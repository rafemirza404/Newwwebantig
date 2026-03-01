import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "~/lib/supabase/server";
import { z } from "zod";

const CompleteSchema = z.object({
  sessionId: z.string().min(1, "sessionId is required"),
});

// Allow up to 300s for background pipeline kick-off (actual pipeline runs async)
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Validate input
  let body: z.infer<typeof CompleteSchema>;
  try {
    const raw = await req.json();
    const parsed = CompleteSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }
    body = parsed.data;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { sessionId } = body;

  // Verify session
  const { data: session } = await supabase
    .from("audit_sessions")
    .select("id, status, user_id, business_name, industry, workspace_id")
    .eq("id", sessionId)
    .single();

  if (!session || session.user_id !== user.id) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // Already complete — return existing report
  if (session.status === "complete") {
    const { data: report } = await supabase
      .from("reports")
      .select("id")
      .eq("session_id", sessionId)
      .single();
    return NextResponse.json({ status: "complete", reportId: report?.id });
  }

  // Already processing — client should poll status
  if (session.status === "processing") {
    return NextResponse.json({ status: "processing" });
  }

  // Mark as processing immediately
  await supabase
    .from("audit_sessions")
    .update({ status: "processing", pipeline_stage: "starting" })
    .eq("id", sessionId);

  // Create an empty report placeholder so we have an ID to poll
  const { data: report, error: reportError } = await supabase
    .from("reports")
    .insert({
      session_id: sessionId,
      user_id: user.id,
      overall_score: 0,
      function_scores: {},
      business_summary: "",
      gaps_preview: [],
      full_gaps: [],
      solutions: [],
      roi_analysis: {},
    })
    .select("id")
    .single();

  if (reportError || !report) {
    console.error("[Complete] Failed to create report placeholder:", reportError);
    await supabase.from("audit_sessions").update({ status: "in_progress" }).eq("id", sessionId);
    return NextResponse.json({ error: "Failed to initialise report" }, { status: 500 });
  }

  // Fire-and-forget pipeline — import and run without awaiting
  import("~/lib/ai/agents/pipeline")
    .then(({ runPipeline }) => {
      runPipeline({
        sessionId,
        userId: user.id,
        reportId: report.id,
        workspaceId: session.workspace_id ?? null,
      }).catch((err: unknown) => {
        console.error("[Complete] Pipeline fatal error:", err);
      });
    })
    .catch((err: unknown) => {
      console.error("[Complete] Failed to import pipeline:", err);
    });

  // Immediately return processing status to client
  return NextResponse.json({ status: "processing", reportId: report.id });
}
