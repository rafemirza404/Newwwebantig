import { redirect } from "next/navigation";
import { createSupabaseServerClient, createServiceRoleClient } from "~/lib/supabase/server";
import ReportHeader from "./_components/ReportHeader";
import ScoreSection from "./_components/ScoreSection";
import GapsSection from "./_components/GapsSection";
import SolutionsSection from "./_components/SolutionsSection";
import ROISection from "./_components/ROISection";
import DiagramSection from "./_components/DiagramSection";
import RoadmapSection from "./_components/RoadmapSection";
import BusinessSnapshot from "./_components/BusinessSnapshot";
import ComparisonBanner from "./_components/ComparisonBanner";

interface Props {
  params: { reportId: string };
  searchParams: { token?: string };
}

export default async function ReportPage({ params, searchParams }: Props) {
  const sharedToken = searchParams.token ?? null;

  // ── Shared-link path (no auth required) ──────────────────────────────────
  if (sharedToken) {
    const serviceClient = createServiceRoleClient();
    const { data: report } = await serviceClient
      .from("reports")
      .select(`
        id, user_id, overall_score, function_scores, business_summary,
        gaps_preview, teaser_gap, full_gaps, solutions, roi_analysis,
        diagrams, roadmap, total_roi_summary, created_at,
        business_profile, comparison_data, gap_analysis_narrative,
        share_token, is_shared,
        audit_sessions (
          id, business_name, industry, company_size
        )
      `)
      .eq("id", params.reportId)
      .single();

    const isValidToken =
      report?.is_shared === true && report?.share_token === sharedToken;

    if (!report || !isValidToken) redirect("/login");

    const session = Array.isArray(report.audit_sessions)
      ? report.audit_sessions[0]
      : report.audit_sessions;

    const rawFunctionScores =
      (report.function_scores as Record<string, FunctionScore | number>) ?? {};

    const normalisedFunctionScores: Record<string, number> = Object.fromEntries(
      Object.entries(rawFunctionScores).map(([k, v]) => [
        k,
        typeof v === "number" ? v : v.score ?? 0,
      ])
    );

    const richFunctionScores: Record<string, FunctionScore> = Object.fromEntries(
      Object.entries(rawFunctionScores).map(([k, v]) => [
        k,
        typeof v === "number" ? { score: v } : v,
      ])
    );

    const businessProfile = (report.business_profile as BusinessProfile) ?? null;
    const comparisonData = (report.comparison_data as ComparisonData) ?? null;
    const totalRoiSummary = (report.total_roi_summary as TotalRoiSummary) ?? null;

    return (
      <div className="min-h-screen bg-background text-foreground">
        <ReportHeader
          reportId={params.reportId}
          businessName={session?.business_name ?? "Shared Report"}
          industry={session?.industry ?? null}
          createdAt={report.created_at ?? ""}
          isPro={true}
          isSharedView={true}
        />
        <div id="report-content" className="max-w-[1400px] mx-auto px-6 pb-20 mt-10 space-y-12">
          {businessProfile && (
            <BusinessSnapshot profile={businessProfile} />
          )}
          {comparisonData?.has_previous_audit && (
            <ComparisonBanner comparison={comparisonData} />
          )}
          <ScoreSection
            overall={report.overall_score ?? 0}
            functionScores={normalisedFunctionScores}
            richFunctionScores={richFunctionScores}
            summary={report.business_summary ?? ""}
          />
          <GapsSection
            gaps={(report.full_gaps as Gap[]) ?? []}
            teaserGap={null}
            isPro={true}
            narrative={(report.gap_analysis_narrative as string) ?? null}
          />
          <SolutionsSection solutions={(report.solutions as Solution[]) ?? []} isPro={true} />
          <ROISection roi={(report.roi_analysis as RoiAnalysis) ?? {}} totalRoiSummary={totalRoiSummary} isPro={true} />
          {((report.diagrams as Diagram[]) ?? []).length > 0 && (
            <DiagramSection diagrams={(report.diagrams as Diagram[]) ?? []} />
          )}
          {report.roadmap && (
            <RoadmapSection roadmap={report.roadmap as Roadmap} isPro={true} />
          )}
        </div>
      </div>
    );
  }

  // ── Authenticated path ────────────────────────────────────────────────────
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirectTo=/report/${params.reportId}`);

  const { data: report } = await supabase
    .from("reports")
    .select(`
      id, user_id, overall_score, function_scores, business_summary,
      gaps_preview, teaser_gap, full_gaps, solutions, roi_analysis,
      diagrams, roadmap, total_roi_summary, created_at,
      business_profile, comparison_data, gap_analysis_narrative,
      audit_sessions (
        id, business_name, industry, company_size
      )
    `)
    .eq("id", params.reportId)
    .single();

  if (!report) redirect("/dashboard/reports");

  // Auth check
  if ((report as { user_id?: string }).user_id !== user.id) {
    const { data: verifiedReport } = await supabase
      .from("reports")
      .select("user_id")
      .eq("id", params.reportId)
      .single();
    if (!verifiedReport || verifiedReport.user_id !== user.id) {
      redirect("/dashboard/reports");
    }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, user_type")
    .eq("id", user.id)
    .single();

  const isPro = profile?.plan === "pro";
  const session = Array.isArray(report?.audit_sessions)
    ? report.audit_sessions[0]
    : report?.audit_sessions;

  const gapsToShow = isPro
    ? ((report?.full_gaps as Gap[]) ?? [])
    : ((report?.gaps_preview as Gap[]) ?? []);
  const teaserGap = isPro ? null : (report?.teaser_gap as Gap | null);
  const solutions = (report?.solutions as Solution[]) ?? [];
  const roiAnalysis = (report?.roi_analysis as RoiAnalysis) ?? {};
  const diagrams = isPro ? ((report?.diagrams as Diagram[]) ?? []) : [];
  const roadmap = isPro ? ((report?.roadmap as Roadmap) ?? null) : null;

  const rawFunctionScores =
    (report?.function_scores as Record<string, FunctionScore | number>) ?? {};

  const normalisedFunctionScores: Record<string, number> = Object.fromEntries(
    Object.entries(rawFunctionScores).map(([k, v]) => [
      k,
      typeof v === "number" ? v : v.score ?? 0,
    ])
  );

  const richFunctionScores: Record<string, FunctionScore> = Object.fromEntries(
    Object.entries(rawFunctionScores).map(([k, v]) => [
      k,
      typeof v === "number" ? { score: v } : v,
    ])
  );

  const businessProfile = (report?.business_profile as BusinessProfile) ?? null;
  const comparisonData = (report?.comparison_data as ComparisonData) ?? null;
  const totalRoiSummary = (report?.total_roi_summary as TotalRoiSummary) ?? null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ReportHeader
        reportId={params.reportId}
        businessName={session?.business_name ?? "Your Business"}
        industry={session?.industry ?? null}
        createdAt={report?.created_at ?? ""}
        isPro={isPro}
      />

      <div id="report-content" className="max-w-[1400px] mx-auto px-6 pb-20 mt-10 space-y-12">
        {businessProfile && (
          <BusinessSnapshot profile={businessProfile} />
        )}
        {comparisonData?.has_previous_audit && (
          <ComparisonBanner comparison={comparisonData} />
        )}
        <ScoreSection
          overall={report?.overall_score ?? 0}
          functionScores={normalisedFunctionScores}
          richFunctionScores={richFunctionScores}
          summary={report?.business_summary ?? ""}
        />

        <GapsSection gaps={gapsToShow} teaserGap={teaserGap} isPro={isPro} narrative={isPro ? ((report?.gap_analysis_narrative as string) ?? null) : null} />

        <SolutionsSection solutions={solutions} isPro={isPro} />

        <ROISection roi={roiAnalysis} totalRoiSummary={totalRoiSummary} isPro={isPro} />

        {isPro ? (
          diagrams.length > 0 && <DiagramSection diagrams={diagrams} />
        ) : (
          <section>
            <h2 className="text-foreground font-medium text-[24px] mb-2 tracking-tight">Automation System Diagrams</h2>
            <p className="text-muted-foreground text-[15px] mb-6">Proposed automated systems for your top priority gaps.</p>
            <div className="bg-card shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl p-10 flex flex-col items-center justify-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <div>
                <p className="text-foreground font-semibold text-[16px]">Pro Feature</p>
                <p className="text-muted-foreground text-[14px] mt-1">Upgrade to Pro to unlock automation diagrams, roadmap, and ROI projections.</p>
              </div>
              <a href="/pricing" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-full transition-colors">
                Upgrade to Pro
              </a>
            </div>
          </section>
        )}

        {roadmap && <RoadmapSection roadmap={roadmap} isPro={isPro} />}
      </div>
    </div>
  );
}

// Types used across report sections
export interface Gap {
  name: string;
  severity: "high" | "medium" | "low";
  description: string;
  gap_id?: string;
  why_this_matters?: string;
  affected_team_members?: string;
  time_cost_per_week_hours?: number;
  estimated_annual_cost?: number;
  priority_rank?: number;
  automation_potential?: "high" | "medium" | "low";
}

export interface Solution {
  name: string;
  hrs: number;
  type: "quick_win" | "medium" | "strategic";
  locked: boolean;
  gap_id?: string;
  how_it_works?: string;
  solution_description?: string;
  why_these_tools?: string;
  primary_tools?: string[];
  new_tools_required?: string[];
  implementation_complexity?: string;
  who_implements_this?: string;
  roi?: {
    hours_saved_per_week: number;
    cost_saved_per_year: number;
    breakeven_weeks: number;
    additional_roi_notes?: string;
  };
  reference_case_study?: {
    title: string;
    industry: string;
    problem: string;
    solution: string;
    result: string;
  } | null;
}

export interface RoiAnalysis {
  estimated_hrs_saved_monthly?: number;
  potential_revenue_lift?: string;
  payback_period?: string;
  total_cost_saved_per_year?: number;
  roi_narrative?: string;
}

export interface FunctionScore {
  score: number;
  industry_average?: number;
  status?: "below" | "on_par" | "above";
  score_rationale?: string;
}

export interface BusinessProfile {
  name: string;
  industry: string;
  company_size: string;
  business_model: string;
  revenue_stage: string;
  team_structure: string;
  primary_services_or_products: string;
  current_tool_stack: string[];
  key_business_context: string;
}

export interface ComparisonData {
  has_previous_audit: boolean;
  overall_score_change: number | null;
  comparison_narrative: string | null;
  previous_audit_date: string | null;
}

export interface TotalRoiSummary {
  total_hours_saved_per_week: number;
  total_cost_saved_per_year: number;
  total_setup_hours_required: number;
  overall_roi_narrative: string;
}

export interface Diagram {
  gap_id: string;
  gap_name: string;
  system_title: string;
  mermaid_script: string;
  is_validated: boolean;
  node_count: number;
  diagram_narrative: string;
}

export interface Roadmap {
  intro: string;
  quick_wins: Array<{ solution_name: string; gap_name: string; estimated_setup_hours: number }>;
  medium_term: Array<{ solution_name: string; gap_name: string; estimated_setup_hours: number }>;
  strategic: Array<{ solution_name: string; gap_name: string; estimated_setup_hours: number }>;
  closing: string;
}
