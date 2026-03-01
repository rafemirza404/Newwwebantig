import { createSupabaseServerClient } from "~/lib/supabase/server";
import { runBusinessProfiler } from "./business-profiler";
import { runGapAnalyzer } from "./gap-analyzer";
import { runSolutionMapper } from "./solution-mapper";
import { runReportAssembler } from "./report-assembler";
import { runDiagramArchitect } from "./diagram-architect";
import { runFinalCompiler } from "./final-compiler";

async function updatePipelineStage(sessionId: string, stage: string) {
  const supabase = createSupabaseServerClient();
  await supabase
    .from("audit_sessions")
    .update({ pipeline_stage: stage })
    .eq("id", sessionId);
}

async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  try {
    return await fn();
  } catch (firstErr) {
    console.error(`[Pipeline] ${label} failed — retrying once...`, firstErr);
    try {
      return await fn();
    } catch (secondErr) {
      console.error(`[Pipeline] ${label} failed on retry.`, secondErr);
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
}): Promise<void> {
  const { sessionId, userId, reportId, workspaceId } = params;
  console.log(`[Pipeline] Starting for session ${sessionId}, report ${reportId}`);

  const supabase = createSupabaseServerClient();

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
    await updatePipelineStage(sessionId, "business_profiler");
    const profilerOutput = await withRetry(
      () => runBusinessProfiler({
        businessName: session.business_name,
        industry: session.industry,
        companySize: session.company_size,
        qaTranscript,
        detectedToolStack,
      }),
      "Agent2"
    );

    // ── Agent 3 — Gap Analyzer ──────────────────────────────────────────────
    await updatePipelineStage(sessionId, "gap_analyzer");
    const gapAnalyzerOutput = await withRetry(
      () => runGapAnalyzer(profilerOutput),
      "Agent3"
    );

    // ── Agent 4 — Solution Mapper ───────────────────────────────────────────
    await updatePipelineStage(sessionId, "solution_mapper");
    const solutionMapperOutput = await withRetry(
      () => runSolutionMapper({ profilerOutput, gapAnalyzerOutput, workspaceId }),
      "Agent4"
    );

    // ── Agents 5 & 6 — Parallel ────────────────────────────────────────────
    await updatePipelineStage(sessionId, "assembling");
    const [reportAssemblerOutput, diagrams] = await Promise.all([
      withRetry(
        () => runReportAssembler({ profilerOutput, gapAnalyzerOutput, solutionMapperOutput }),
        "Agent5"
      ),
      withRetry(
        () => runDiagramArchitect({
          profilerOutput,
          gaps: gapAnalyzerOutput.gaps,
          solutions: solutionMapperOutput.solutions,
        }),
        "Agent6"
      ),
    ]);

    // ── Agent 7 — Final Compiler ────────────────────────────────────────────
    await updatePipelineStage(sessionId, "final_compiler");
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
      }),
      "Agent7"
    );

    console.log(`[Pipeline] Complete for session ${sessionId}`);
  } catch (err) {
    console.error(`[Pipeline] Fatal error for session ${sessionId}:`, err);
    await supabase
      .from("audit_sessions")
      .update({ status: "in_progress", pipeline_stage: "failed" })
      .eq("id", sessionId);
  }
}
