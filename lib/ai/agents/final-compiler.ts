import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { BusinessProfilerOutput } from "./business-profiler";
import type { GapAnalyzerOutput } from "./gap-analyzer";
import type { SolutionMapperOutput } from "./solution-mapper";
import type { ReportAssemblerOutput } from "./report-assembler";
import type { Diagram } from "./diagram-architect";

interface FinalReport {
  metadata: {
    report_id: string;
    session_id: string;
    user_id: string;
    business_name: string;
    generated_at: string;
    audit_number: number;
  };
  free_content: {
    business_snapshot: object;
    overall_maturity_score: number;
    score_headline: string;
    gaps_overview_narrative: string;
    total_gaps_found: number;
    total_weekly_hours_lost: number;
    total_annual_cost: number;
    gaps_free_preview: object[];
    teaser_gap: object | null;
    teaser_diagram: object | null;
  };
  paid_content: {
    function_scores: object;
    score_narrative: string;
    full_gaps: object[];
    gap_analysis_narrative: string;
    blueprints: object[];
    blueprints_intro_narrative: string;
    roi_analysis: object;
    roi_narrative: string;
    diagrams: object[];
    roadmap: object;
    roadmap_closing: string;
  };
  comparison: {
    has_previous_audit: boolean;
    previous_report_id: string | null;
    previous_audit_date: string | null;
    overall_score_change: number | null;
    comparison_narrative: string | null;
  };
}

async function buildComparisonData(params: {
  userId: string;
  currentReportId: string;
  currentScore: number;
  supabase: SupabaseClient;
}): Promise<FinalReport["comparison"]> {
  const { data: previousReport } = await params.supabase
    .from("reports")
    .select("id, overall_score, created_at")
    .eq("user_id", params.userId)
    .neq("id", params.currentReportId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!previousReport) {
    return {
      has_previous_audit: false,
      previous_report_id: null,
      previous_audit_date: null,
      overall_score_change: null,
      comparison_narrative: null,
    };
  }

  const scoreDelta = params.currentScore - (previousReport.overall_score ?? 0);

  return {
    has_previous_audit: true,
    previous_report_id: previousReport.id,
    previous_audit_date: previousReport.created_at,
    overall_score_change: scoreDelta,
    comparison_narrative: scoreDelta > 0
      ? `Your AI maturity score has improved by ${scoreDelta} points since your last audit — great progress. The gaps that remain represent your biggest remaining opportunities.`
      : `Your score has shifted ${Math.abs(scoreDelta)} points since your last audit, reflecting business growth and new operational complexity. The solutions in this report address your current priorities.`,
  };
}

export async function runFinalCompiler(params: {
  sessionId: string;
  userId: string;
  reportId: string;
  profilerOutput: BusinessProfilerOutput;
  gapAnalyzerOutput: GapAnalyzerOutput;
  solutionMapperOutput: SolutionMapperOutput;
  reportAssemblerOutput: ReportAssemblerOutput;
  diagrams: Diagram[];
  supabase: SupabaseClient;
}): Promise<void> {
  console.log("[Pipeline] Agent 7 (FinalCompiler) starting...");

  const supabase = params.supabase;
  const content = params.reportAssemblerOutput;
  const gaps = params.gapAnalyzerOutput;
  const solutions = params.solutionMapperOutput;

  // Validate all required sections are present
  const requiredSections = [
    "section_1_business_snapshot",
    "section_2_maturity_score",
    "section_3_gaps",
    "section_4_blueprints",
    "section_5_roi",
    "section_7_roadmap",
  ] as const;

  for (const section of requiredSections) {
    if (!content[section]) {
      throw new Error(`Agent 7: Missing required section ${section} from ReportAssembler`);
    }
  }

  // Find teaser diagram (for free tier — diagram for teaser gap)
  const teaserGap = content.section_3_gaps.teaser_gap;
  const teaserDiagram = teaserGap
    ? params.diagrams.find((d) => d.gap_name === teaserGap.name) ?? params.diagrams[0] ?? null
    : params.diagrams[0] ?? null;

  // Get comparison data
  const comparison = await buildComparisonData({
    userId: params.userId,
    currentReportId: params.reportId,
    currentScore: gaps.overall_maturity_score,
    supabase,
  });

  // Count audit number
  const { count: auditCount } = await supabase
    .from("reports")
    .select("id", { count: "exact", head: true })
    .eq("user_id", params.userId);

  // Map new-format gaps to old report columns (for backward compat with report page)
  const oldStyleGaps = gaps.gaps.map((g) => ({
    name: g.gap_name,
    severity: g.severity,
    description: g.current_situation,
    category: g.business_function,
    currentState: g.current_situation,
    timeCostEstimate: `~${g.time_cost_per_week_hours}h/week`,
    automationPotential: g.why_this_matters,
    // new fields
    why_this_matters: g.why_this_matters,
    affected_team_members: g.affected_team_members,
    time_cost_per_week_hours: g.time_cost_per_week_hours,
    estimated_annual_cost: g.estimated_annual_cost,
    priority_rank: g.priority_rank,
    gap_id: g.gap_id,
  }));

  const oldStyleSolutions = solutions.solutions.map((s) => ({
    name: s.solution_name,
    hrs: s.roi.hours_saved_per_week,
    type: s.implementation_complexity === "simple" ? "quick_win" : s.implementation_complexity === "medium" ? "medium" : "strategic",
    locked: s.implementation_complexity !== "simple",
    gapName: s.solution_name,
    how_it_works: s.how_it_works,
    toolsRecommended: s.primary_tools,
    roiEstimate: `Save ~$${Math.round(s.roi.cost_saved_per_year).toLocaleString()}/year`,
    setupTimeHrs: s.estimated_setup_hours,
    // new fields
    gap_id: s.gap_id,
    solution_description: s.solution_description,
    uses_existing_tools: s.uses_existing_tools,
    new_tools_required: s.new_tools_required,
    implementation_complexity: s.implementation_complexity,
    why_these_tools: s.why_these_tools,
    roi: s.roi,
    reference_case_study: s.reference_case_study,
  }));

  const previewGaps = oldStyleGaps.slice(0, 2).map((g) => ({
    name: g.name,
    severity: g.severity,
    description: g.description,
  }));

  const roadmap = {
    intro: content.section_7_roadmap.roadmap_intro,
    quick_wins: content.section_7_roadmap.quick_wins,
    medium_term: content.section_7_roadmap.medium_term,
    strategic: content.section_7_roadmap.strategic,
    closing: content.section_7_roadmap.roadmap_closing,
  };

  // Persist to reports table — use service role if available to bypass RLS in background jobs
  const writeClient: SupabaseClient = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false, autoRefreshToken: false } }
      )
    : supabase;

  console.log("[Agent7] Writing report to DB. reportId:", params.reportId);

  const { error: updateError, data: updatedRows } = await writeClient
    .from("reports")
    .update({
      overall_score: gaps.overall_maturity_score,
      function_scores: gaps.function_scores,
      business_summary: content.section_1_business_snapshot.narrative,
      gaps_preview: previewGaps,
      teaser_gap: teaserGap
        ? { name: teaserGap.name, severity: teaserGap.severity, description: teaserGap.current_situation }
        : null,
      full_gaps: oldStyleGaps,
      solutions: oldStyleSolutions,
      roi_analysis: {
        estimated_hrs_saved_monthly: Math.round(solutions.total_roi_summary.total_hours_saved_per_week * 4),
        potential_revenue_lift: content.section_5_roi.roi_headline,
        payback_period: `${Math.round(solutions.total_roi_summary.total_setup_hours_required / (solutions.total_roi_summary.total_hours_saved_per_week || 1))} weeks`,
        total_hrs_saved_monthly: Math.round(solutions.total_roi_summary.total_hours_saved_per_week * 4),
        total_cost_saved_per_year: solutions.total_roi_summary.total_cost_saved_per_year,
        roi_narrative: solutions.total_roi_summary.overall_roi_narrative,
      },
      diagrams: params.diagrams,
      roadmap,
      business_profile: params.profilerOutput.business_profile,
      total_roi_summary: solutions.total_roi_summary,
      comparison_data: comparison,
    })
    .eq("id", params.reportId)
    .select("id");

  if (updateError) {
    console.error("[Agent7] Failed to update report:", updateError);
    throw new Error(`FinalCompiler failed to persist report: ${updateError.message}`);
  }

  if (!updatedRows || updatedRows.length === 0) {
    console.error("[Agent7] Update matched 0 rows. reportId:", params.reportId, "— RLS or missing row?");
    // Verify the row exists
    const { data: check } = await writeClient.from("reports").select("id, user_id").eq("id", params.reportId).single();
    console.error("[Agent7] Row check:", check);
    throw new Error("FinalCompiler: report update affected 0 rows");
  }

  console.log("[Agent7] Report written successfully.");

  // Mark session complete
  await writeClient
    .from("audit_sessions")
    .update({ status: "complete", completed_at: new Date().toISOString(), pipeline_stage: "complete" })
    .eq("id", params.sessionId);

  // Insert report-ready notification (non-blocking)
  try {
    await writeClient.from("notifications").insert({
      user_id: params.userId,
      title: `${params.profilerOutput.business_profile.name} report is ready`,
      message: `AI maturity score: ${gaps.overall_maturity_score}/100. View your full report and recommendations.`,
      type: "report_ready",
      href: `/report/${params.reportId}`,
    });
  } catch (err) {
    console.error("[Agent7] Notification insert failed:", err);
  }

  console.log("[Pipeline] Agent 7 complete. Report saved:", params.reportId);

  // Fire report-ready email (non-blocking)
  try {
    const { data: userProfile } = await writeClient
      .from("profiles")
      .select("email")
      .eq("id", params.userId)
      .single();

    if (userProfile?.email) {
      const { sendEmail } = await import("~/lib/email");
      const { reportReadyEmail } = await import("~/lib/emails/report-ready");
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:8080";

      sendEmail({
        to: userProfile.email,
        subject: `Your ${params.profilerOutput.business_profile.name} automation report is ready`,
        html: reportReadyEmail({
          businessName: params.profilerOutput.business_profile.name,
          reportUrl: `${baseUrl}/report/${params.reportId}`,
          overallScore: gaps.overall_maturity_score,
          hrsPerMonth: Math.round(solutions.total_roi_summary.total_hours_saved_per_week * 4),
        }),
      }).catch((err: unknown) => console.error("[Agent7] Email send failed:", err));
    }
  } catch (err) {
    console.error("[Agent7] Email notification error:", err);
  }
}
