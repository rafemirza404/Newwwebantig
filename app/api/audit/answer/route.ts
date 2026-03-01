import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "~/lib/supabase/server";
import { streamNextQuestion, type CoverageStatus, type QAEntry } from "~/lib/ai/agents/question-engine";
import { z } from "zod";

const AnswerSchema = z.object({
  sessionId: z.string().min(1, "sessionId is required"),
  questionText: z.string().min(1).max(5000),
  answerText: z.string().min(1).max(5000),
  category: z.string().min(1).max(100),
  questionOrder: z.number().int().min(0),
});

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(
      `data: ${JSON.stringify({ type: "error", message: "Unauthorized" })}\n\n`,
      { status: 401, headers: { "Content-Type": "text/event-stream" } }
    );
  }

  // Validate input
  let body: z.infer<typeof AnswerSchema>;
  try {
    const raw = await req.json();
    const parsed = AnswerSchema.safeParse(raw);
    if (!parsed.success) {
      const encoder = new TextEncoder();
      const errorStream = new ReadableStream({
        start(c) {
          c.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "error", message: "Invalid input" })}\n\n`));
          c.close();
        },
      });
      return new Response(errorStream, { status: 400, headers: { "Content-Type": "text/event-stream" } });
    }
    body = parsed.data;
  } catch {
    const encoder = new TextEncoder();
    const errorStream = new ReadableStream({
      start(c) {
        c.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "error", message: "Invalid JSON body" })}\n\n`));
        c.close();
      },
    });
    return new Response(errorStream, { status: 400, headers: { "Content-Type": "text/event-stream" } });
  }

  const { sessionId, questionText, answerText, category, questionOrder } = body;

  // Verify session belongs to user
  const { data: session } = await supabase
    .from("audit_sessions")
    .select("id, user_id, business_name, industry, company_size, status, coverage_status, detected_tool_stack, tool_stack_captured")
    .eq("id", sessionId)
    .single();

  if (!session || session.user_id !== user.id) {
    const encoder = new TextEncoder();
    const errorStream = new ReadableStream({
      start(c) {
        c.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "error", message: "Session not found" })}\n\n`));
        c.close();
      },
    });
    return new Response(errorStream, { status: 404, headers: { "Content-Type": "text/event-stream" } });
  }

  if (session.status === "complete" || session.status === "processing") {
    const encoder = new TextEncoder();
    const completeStream = new ReadableStream({
      start(c) {
        c.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "complete", questionText: "", meta: { is_complete: true, closing_message: null, question_category: "complete", coverage_status: session.coverage_status, detected_tool_stack: session.detected_tool_stack, tool_stack_captured: session.tool_stack_captured } })}\n\n`));
        c.close();
      },
    });
    return new Response(completeStream, { headers: { "Content-Type": "text/event-stream" } });
  }

  // Save this answer
  const { error: insertError } = await supabase.from("audit_answers").insert({
    session_id: sessionId,
    question_text: questionText,
    answer_text: answerText,
    question_category: category,
    question_order: questionOrder,
  });

  if (insertError) {
    console.error("[audit/answer] Failed to save answer:", insertError);
  }

  const newQuestionCount = questionOrder + 1;

  // Update question count
  await supabase
    .from("audit_sessions")
    .update({ question_count: newQuestionCount })
    .eq("id", sessionId);

  // Load all answers to build sliding window
  const { data: allAnswers } = await supabase
    .from("audit_answers")
    .select("question_text, answer_text, question_category")
    .eq("session_id", sessionId)
    .order("question_order", { ascending: true });

  const qaHistory: QAEntry[] = (allAnswers ?? []).map((a) => ({
    question: a.question_text,
    answer: a.answer_text,
    category: a.question_category ?? "general",
  }));

  const coverageStatus = (session.coverage_status as CoverageStatus) ?? {
    sales: "uncovered",
    customer_onboarding: "uncovered",
    operations: "uncovered",
    finance: "uncovered",
    customer_support: "uncovered",
    marketing: "uncovered",
    hr: "uncovered",
    data_reporting: "uncovered",
  };

  // Create the SSE stream from Agent 1
  const agentStream = streamNextQuestion({
    businessName: session.business_name,
    industry: session.industry,
    companySize: session.company_size,
    allAnswers: qaHistory,
    coverageStatus,
    detectedToolStack: (session.detected_tool_stack as string[]) ?? [],
    toolStackCaptured: session.tool_stack_captured ?? false,
    questionCount: newQuestionCount,
  });

  // Intercept the stream to update session metadata on completion
  const encoder = new TextEncoder();
  const transformStream = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      controller.enqueue(chunk);

      // Parse to check for completion events
      const text = new TextDecoder().decode(chunk);
      if (text.startsWith("data: ")) {
        try {
          const parsed = JSON.parse(text.slice(6).trim());
          if (parsed.type === "complete" && parsed.meta) {
            const meta = parsed.meta;
            // Fire-and-forget DB update with new coverage state
            supabase
              .from("audit_sessions")
              .update({
                coverage_status: meta.coverage_status,
                detected_tool_stack: meta.detected_tool_stack,
                tool_stack_captured: meta.tool_stack_captured,
              })
              .eq("id", sessionId)
              .then(({ error }) => {
                if (error) console.error("[audit/answer] Failed to update coverage state:", error);
              });
          }
        } catch {
          // Non-JSON chunk — ignore
        }
      }
    },
  });

  const readable = agentStream.pipeThrough(transformStream);

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
