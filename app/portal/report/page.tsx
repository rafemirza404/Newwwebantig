import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "~/lib/supabase/server";
import ScoreSection from "~/app/report/[reportId]/_components/ScoreSection";
import GapsSection from "~/app/report/[reportId]/_components/GapsSection";
import SolutionsSection from "~/app/report/[reportId]/_components/SolutionsSection";
import ROISection from "~/app/report/[reportId]/_components/ROISection";
import type { Gap, Solution, RoiAnalysis } from "~/app/report/[reportId]/page";
import { isDemoMode, DEMO_REPORTS, DEMO_AUDITS } from "~/lib/mock/mockData";

export default async function PortalReportPage() {
  // Demo mode — show mock report
  if (isDemoMode()) {
    const demoReport = DEMO_REPORTS[0];
    const demoSession = DEMO_AUDITS.find(a => a.id === demoReport.session_id) ?? DEMO_AUDITS[0];
    const gaps = (demoReport.full_gaps as unknown as Gap[]) ?? [];
    const solutions = (demoReport.solutions as unknown as Solution[]) ?? [];
    const roiAnalysis = (demoReport.roi_analysis as unknown as RoiAnalysis) ?? {};
    const functionScores = (demoReport.function_scores as Record<string, number>) ?? {};
    const createdAt = new Date(demoReport.created_at).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });

    return (
      <div className="min-h-full bg-background">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/10 px-8 py-5 flex items-center justify-between shadow-sm">
          <div>
            <h1 className="text-foreground font-medium text-[28px] tracking-tight">
              {demoSession.business_name}
            </h1>
            <p className="text-muted-foreground text-[15px] mt-1">{createdAt}</p>
          </div>
          <span className="text-[14px] font-medium text-primary border border-primary/20 bg-primary/10 rounded-xl px-3 py-1.5 shadow-sm">
            Full Report
          </span>
        </div>
        <div className="max-w-[1400px] mx-auto px-8 pb-20 pt-10 space-y-12">
          <ScoreSection
            overall={demoReport.overall_score ?? 0}
            functionScores={functionScores}
            summary={demoReport.business_summary ?? ""}
          />
          <GapsSection gaps={gaps} teaserGap={null} isPro={true} />
          <SolutionsSection solutions={solutions} isPro={true} />
          <ROISection roi={roiAnalysis} isPro={true} />
        </div>
      </div>
    );
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/portal/report");

  // Get client record
  const { data: client } = await supabase
    .from("clients")
    .select("id, business_name, workspace_id")
    .eq("client_user_id", user.id)
    .maybeSingle();

  if (!client) redirect("/dashboard");

  // Get the latest completed audit session for this client
  const { data: session } = await supabase
    .from("audit_sessions")
    .select("id, business_name, industry")
    .eq("workspace_id", client.workspace_id)
    .eq("status", "complete")
    .order("completed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-background">
        <div className="text-center max-w-sm bg-card border-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] p-10 rounded-3xl">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-6 shadow-sm">
            <div className="w-6 h-6 rounded-full border-4 border-muted-foreground/30 animate-pulse" />
          </div>
          <h2 className="text-foreground font-bold text-xl mb-3 tracking-tight">No report yet</h2>
          <p className="text-muted-foreground text-[15px] leading-relaxed">
            Your audit hasn&apos;t been completed yet. Your advisor will notify you when it&apos;s ready.
          </p>
        </div>
      </div>
    );
  }

  // Load report for this session
  const { data: report } = await supabase
    .from("reports")
    .select(
      "id, overall_score, function_scores, business_summary, full_gaps, solutions, roi_analysis, created_at"
    )
    .eq("session_id", session.id)
    .single();

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-background">
        <div className="text-center max-w-sm bg-card border-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] p-10 rounded-3xl">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-6 shadow-sm">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="text-foreground font-bold text-xl mb-3 tracking-tight">Report generating</h2>
          <p className="text-muted-foreground text-[15px] leading-relaxed mb-6">
            Your report is being built. Check back in a few minutes.
          </p>
          <Link
            href="/portal/report"
            className="inline-flex items-center justify-center px-6 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground font-bold rounded-full shadow-sm transition-colors text-[13px] uppercase tracking-wider"
          >
            Refresh Data
          </Link>
        </div>
      </div>
    );
  }

  const gaps = (report.full_gaps as Gap[]) ?? [];
  const solutions = (report.solutions as Solution[]) ?? [];
  const roiAnalysis = (report.roi_analysis as RoiAnalysis) ?? {};
  const functionScores = (report.function_scores as Record<string, number>) ?? {};
  const createdAt = new Date(report.created_at ?? "").toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <div className="min-h-full bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/10 px-8 py-5 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-foreground font-medium text-[28px] tracking-tight">
            {client.business_name}
          </h1>
          <p className="text-muted-foreground text-[15px] mt-1">{createdAt}</p>
        </div>
        <span className="text-[14px] font-medium text-primary border border-primary/20 bg-primary/10 rounded-xl px-3 py-1.5 shadow-sm">
          Full Report
        </span>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 pb-20 pt-10 space-y-12">
        <ScoreSection
          overall={report.overall_score ?? 0}
          functionScores={functionScores}
          summary={report.business_summary ?? ""}
        />
        <GapsSection gaps={gaps} teaserGap={null} isPro={true} />
        <SolutionsSection solutions={solutions} isPro={true} />
        <ROISection roi={roiAnalysis} isPro={true} />
      </div>
    </div>
  );
}
