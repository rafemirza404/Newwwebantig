import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "~/lib/supabase/server";
import { streamNextQuestion, type CoverageStatus, type QAEntry } from "~/lib/ai/agents/question-engine";
import { z } from "zod";

const AnswerSchema = z.object({
  sessionId: z.string().min(1, "sessionId is required"),
  questionText: z.string().min(1).max(5000),
  answerText: z.string().min(1).max(5000),
  category: z.string().min(1).max(100),
  questionOrder: z.number().int().min(-1),
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

  // Save this answer — skip the synthetic __START__ initialisation call
  const isStartCall = questionText === "__START__" && answerText === "__START__";
  if (!isStartCall) {
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
  }

  // Load all answers to build sliding window (done before count so resume uses real DB count)
  const { data: allAnswers } = await supabase
    .from("audit_answers")
    .select("question_text, answer_text, question_category")
    .eq("session_id", sessionId)
    .order("question_order", { ascending: true });

  // For start/resume calls use the real DB answer count; for normal submissions use questionOrder
  const newQuestionCount = isStartCall ? (allAnswers?.length ?? 0) : questionOrder + 1;

  // Update question count
  await supabase
    .from("audit_sessions")
    .update({ question_count: newQuestionCount })
    .eq("id", sessionId);

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

  // Collect the full stream, persist coverage_status synchronously, then re-stream to client
  const collectedChunks: Uint8Array[] = [];
  const agentReader = agentStream.getReader();
  let collectedMeta: { coverage_status: object; detected_tool_stack: string[]; tool_stack_captured: boolean } | null = null;

  let streamBuffer = "";
  while (true) {
    const { done, value } = await agentReader.read();
    if (done) break;
    collectedChunks.push(value);
    streamBuffer += new TextDecoder().decode(value, { stream: true });
  }

  // Parse all SSE events from the collected buffer to find the coverage update
  const sseLines = streamBuffer.split("\n\n");
  for (const line of sseLines) {
    if (!line.startsWith("data: ")) continue;
    try {
      const parsed = JSON.parse(line.slice(6).trim());
      if (parsed.type === "complete" && parsed.meta) {
        collectedMeta = {
          coverage_status: parsed.meta.coverage_status,
          detected_tool_stack: parsed.meta.detected_tool_stack ?? [],
          tool_stack_captured: parsed.meta.tool_stack_captured ?? false,
        };
      }
    } catch {
      // ignore non-JSON lines
    }
  }

  // Persist coverage state synchronously so the next call reads fresh data
  if (collectedMeta) {
    const { error } = await supabase
      .from("audit_sessions")
      .update({
        coverage_status: collectedMeta.coverage_status,
        detected_tool_stack: collectedMeta.detected_tool_stack,
        tool_stack_captured: collectedMeta.tool_stack_captured,
      })
      .eq("id", sessionId);
    if (error) console.error("[audit/answer] Failed to update coverage state:", error);
  }

  // Re-stream the collected chunks to the client
  const readable = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of collectedChunks) {
        controller.enqueue(chunk);
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
