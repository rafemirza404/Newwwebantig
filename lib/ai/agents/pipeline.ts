import { createSupabaseClientWithToken } from "~/lib/supabase/server";
import { runBusinessProfiler } from "./business-profiler";
import { runGapAnalyzer } from "./gap-analyzer";
import { runSolutionMapper } from "./solution-mapper";
import { runReportAssembler } from "./report-assembler";
import { runDiagramArchitect } from "./diagram-architect";
import { runFinalCompiler } from "./final-compiler";

async function updatePipelineStage(sessionId: string, stage: string, token: string) {
  const supabase = createSupabaseClientWithToken(token);
  await supabase
    .from("audit_sessions")
    .update({ pipeline_stage: stage })
    .eq("id", sessionId);
}

async function withRetry<T>(fn: () => Promise<T>, label: string, sessionId: string, token: string): Promise<T> {
  try {
    return await fn();
  } catch (firstErr) {
    console.error(`[Pipeline] ${label} failed — retrying once...`, firstErr);
    try {
      return await fn();
    } catch (secondErr) {
      const errMsg = secondErr instanceof Error ? secondErr.message : String(secondErr);
      console.error(`[Pipeline] ${label} failed on retry: ${errMsg}`);
      // Write the specific failing agent to the DB so we can diagnose without terminal access
      await createSupabaseClientWithToken(token)
        .from("audit_sessions")
        .update({ pipeline_stage: `${label.toLowerCase()}_failed` })
        .eq("id", sessionId);
      throw secondErr;
    }
  }
}

/**
 * Runs the full 7-agent pipeline as a background async job.
 * Pipeline: Agent2 → Agent3 → Agent4 → Promise.all([Agent5, Agent6]) → Agent7
 *
 * Called fire-and-forget from the complete API route.
 */
export async function runPipeline(params: {
  sessionId: string;
  userId: string;
  reportId: string;
  workspaceId: string | null;
  accessToken: string;
}): Promise<void> {
  const { sessionId, userId, reportId, workspaceId, accessToken } = params;
  console.log(`[Pipeline] Starting for session ${sessionId}, report ${reportId}`);

  // Use token-based client — safe in fire-and-forget background context.
  // Cookies are gone after HTTP response is sent; the JWT captured before response works fine.
  const supabase = createSupabaseClientWithToken(accessToken);

  try {
  // Load all answers + session data
  const [{ data: session }, { data: answers }] = await Promise.all([
    supabase
      .from("audit_sessions")
      .select("business_name, industry, company_size, detected_tool_stack")
      .eq("id", sessionId)
      .single(),
    supabase
      .from("audit_answers")
      .select("question_text, answer_text, question_category, question_order")
      .eq("session_id", sessionId)
      .order("question_order", { ascending: true }),
  ]);

  if (!session || !answers) {
    console.error("[Pipeline] Could not load session/answers");
    await supabase
      .from("audit_sessions")
      .update({ status: "in_progress", pipeline_stage: "failed" })
      .eq("id", sessionId);
    return;
  }

  const qaTranscript = answers.map((a) => ({
    question: a.question_text,
    answer: a.answer_text,
    category: a.question_category ?? "general",
  }));

  const detectedToolStack = (session.detected_tool_stack as string[]) ?? [];

  try {
    // ── Agent 2 — Business Profiler ─────────────────────────────────────────
    await updatePipelineStage(sessionId, "business_profiler", accessToken);
    const profilerOutput = await withRetry(
      () => runBusinessProfiler({
        businessName: session.business_name,
        industry: session.industry,
        companySize: session.company_size,
        qaTranscript,
        detectedToolStack,
      }),
      "Agent2", sessionId, accessToken
    );

    // ── Agent 3 — Gap Analyzer ──────────────────────────────────────────────
    await updatePipelineStage(sessionId, "gap_analyzer", accessToken);
    const gapAnalyzerOutput = await withRetry(
      () => runGapAnalyzer(profilerOutput),
      "Agent3", sessionId, accessToken
    );

    // ── Agent 4 — Solution Mapper ───────────────────────────────────────────
    await updatePipelineStage(sessionId, "solution_mapper", accessToken);
    const solutionMapperOutput = await withRetry(
      () => runSolutionMapper({ profilerOutput, gapAnalyzerOutput, workspaceId, supabase }),
      "Agent4", sessionId, accessToken
    );

    // ── Agents 5 & 6 — Parallel ────────────────────────────────────────────
    await updatePipelineStage(sessionId, "assembling", accessToken);
    const [reportAssemblerOutput, diagrams] = await Promise.all([
      withRetry(
        () => runReportAssembler({ profilerOutput, gapAnalyzerOutput, solutionMapperOutput }),
        "Agent5", sessionId, accessToken
      ),
      withRetry(
        () => runDiagramArchitect({
          profilerOutput,
          gaps: gapAnalyzerOutput.gaps,
          solutions: solutionMapperOutput.solutions,
        }),
        "Agent6", sessionId, accessToken
      ),
    ]);

    // ── Agent 7 — Final Compiler ────────────────────────────────────────────
    await updatePipelineStage(sessionId, "final_compiler", accessToken);
    await withRetry(
      () => runFinalCompiler({
        sessionId,
        userId,
        reportId,
        profilerOutput,
        gapAnalyzerOutput,
        solutionMapperOutput,
        reportAssemblerOutput,
        diagrams,
        supabase,
      }),
      "Agent7", sessionId, accessToken
    );

    console.log(`[Pipeline] Complete for session ${sessionId}`);
  } catch (innerErr) {
    console.error(`[Pipeline] Fatal error for session ${sessionId}:`, innerErr);
    await supabase
      .from("audit_sessions")
      .update({ status: "in_progress", pipeline_stage: "failed" })
      .eq("id", sessionId);
  }
  } catch (outerErr) {
    console.error(`[Pipeline] Startup error for session ${sessionId}:`, outerErr);
    // Best-effort: try to mark as failed using the token we have
    try {
      await createSupabaseClientWithToken(accessToken)
        .from("audit_sessions")
        .update({ status: "in_progress", pipeline_stage: "failed" })
        .eq("id", sessionId);
    } catch {
      // Nothing more we can do
    }
  }
}
