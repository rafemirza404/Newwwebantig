import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "~/lib/supabase/server";
import ReportHeader from "./_components/ReportHeader";
import ScoreSection from "./_components/ScoreSection";
import GapsSection from "./_components/GapsSection";
import SolutionsSection from "./_components/SolutionsSection";
import ROISection from "./_components/ROISection";
import DiagramSection from "./_components/DiagramSection";
import RoadmapSection from "./_components/RoadmapSection";

interface Props {
  params: { reportId: string };
}

export default async function ReportPage({ params }: Props) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirectTo=/report/${params.reportId}`);

  const { data: report } = await supabase
    .from("reports")
    .select(`
      id, user_id, overall_score, function_scores, business_summary,
      gaps_preview, teaser_gap, full_gaps, solutions, roi_analysis,
      diagrams, roadmap, total_roi_summary, created_at,
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
    ? (report?.full_gaps as Gap[]) ?? []
    : (report?.gaps_preview as Gap[]) ?? [];
  const teaserGap = isPro ? null : report?.teaser_gap as Gap | null;
  const solutions = (report?.solutions as Solution[]) ?? [];
  const roiAnalysis = (report?.roi_analysis as RoiAnalysis) ?? {};
  const functionScores = (report?.function_scores as Record<string, { score?: number } | number>) ?? {};
  const diagrams = isPro ? ((report?.diagrams as Diagram[]) ?? []) : [];
  const roadmap = isPro ? ((report?.roadmap as Roadmap) ?? null) : null;

  // Normalise functionScores: new format has {score, industry_average, status} — old format is flat numbers
  const normalisedFunctionScores: Record<string, number> = Object.fromEntries(
    Object.entries(functionScores).map(([k, v]) => [
      k,
      typeof v === "number" ? v : (v as { score?: number }).score ?? 0,
    ])
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ReportHeader
        businessName={session?.business_name ?? "Your Business"}
        industry={session?.industry ?? null}
        createdAt={report?.created_at ?? ""}
        isPro={isPro}
      />

      <div className="max-w-[1400px] mx-auto px-6 pb-20 mt-10 space-y-12">
        <ScoreSection
          overall={report?.overall_score ?? 0}
          functionScores={normalisedFunctionScores}
          summary={report?.business_summary ?? ""}
        />

        <GapsSection
          gaps={gapsToShow}
          teaserGap={teaserGap}
          isPro={isPro}
        />

        <SolutionsSection
          solutions={solutions}
          isPro={isPro}
        />

        <ROISection
          roi={roiAnalysis}
          isPro={isPro}
        />

        {diagrams.length > 0 && (
          <DiagramSection diagrams={diagrams} />
        )}

        {roadmap && (
          <RoadmapSection roadmap={roadmap} isPro={isPro} />
        )}
      </div>
    </div>
  );
}

// Types used across report sections
export interface Gap {
  name: string;
  severity: "high" | "medium" | "low";
  description: string;
  // New fields from 7-agent pipeline
  gap_id?: string;
  why_this_matters?: string;
  affected_team_members?: string;
  time_cost_per_week_hours?: number;
  estimated_annual_cost?: number;
  priority_rank?: number;
}

export interface Solution {
  name: string;
  hrs: number;
  type: "quick_win" | "medium" | "strategic";
  locked: boolean;
  // New fields
  gap_id?: string;
  how_it_works?: string;
  solution_description?: string;
  primary_tools?: string[];
  new_tools_required?: string[];
  implementation_complexity?: string;
  roi?: { hours_saved_per_week: number; cost_saved_per_year: number; breakeven_weeks: number };
}

export interface RoiAnalysis {
  estimated_hrs_saved_monthly?: number;
  potential_revenue_lift?: string;
  payback_period?: string;
  total_cost_saved_per_year?: number;
  roi_narrative?: string;
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
