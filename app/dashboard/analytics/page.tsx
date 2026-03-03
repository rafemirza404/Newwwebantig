import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "~/lib/supabase/server";
import StatCard from "~/components/dashboard/shared/StatCard";
import { isDemoMode, DEMO_AGENCY_AUDITS, DEMO_DIRECT_AUDITS, DEMO_REPORTS, DEMO_PROFILE } from "~/lib/mock/mockData";

const FUNCTION_LABELS: Record<string, string> = {
  sales: "Sales", marketing: "Marketing", operations: "Operations",
  finance: "Finance", hr: "HR", customer_service: "Customer Service",
  technology: "Technology", strategy: "Strategy",
};

export default async function AnalyticsPage() {
  let totalAudits = 0;
  let completedAudits = 0;
  let reports: any[] = [];
  let isAgency = false;

  const cookieStore = cookies();
  const viewMode = cookieStore.get("view_mode")?.value;

  if (isDemoMode()) {
    isAgency = viewMode === "agency_owner" || DEMO_PROFILE.user_type === "agency_owner";
    const demoAudits = isAgency ? DEMO_AGENCY_AUDITS : DEMO_DIRECT_AUDITS;
    totalAudits = demoAudits.length;
    completedAudits = demoAudits.filter(a => a.status === "complete").length;
    reports = DEMO_REPORTS;
  } else {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login?redirectTo=/dashboard/analytics");

    const { data: profile } = await supabase
      .from("profiles")
      .select("user_type, has_agency")
      .eq("id", user.id)
      .single();

    const userType = profile?.user_type ?? "direct";
    const effectiveType = (viewMode && ["direct", "agency_owner"].includes(viewMode)) ? viewMode : userType;
    isAgency = effectiveType === "agency_owner";

    if (isAgency) {
      // Fetch workspace, then query by workspace_id
      const { data: workspace } = await supabase
        .from("workspaces")
        .select("id")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (workspace) {
        const { count: tc } = await supabase
          .from("audit_sessions")
          .select("id", { count: "exact", head: true })
          .eq("workspace_id", workspace.id);

        const { count: cc } = await supabase
          .from("audit_sessions")
          .select("id", { count: "exact", head: true })
          .eq("workspace_id", workspace.id)
          .eq("status", "complete");

        // Get session IDs for this workspace, then fetch reports
        const { data: sessions } = await supabase
          .from("audit_sessions")
          .select("id")
          .eq("workspace_id", workspace.id);

        const sessionIds = (sessions ?? []).map((s: any) => s.id);

        const { data: rpts } = sessionIds.length > 0
          ? await supabase
            .from("reports")
            .select("overall_score, function_scores, created_at")
            .in("session_id", sessionIds)
            .order("created_at", { ascending: false })
          : { data: [] };

        totalAudits = tc ?? 0;
        completedAudits = cc ?? 0;
        reports = rpts ?? [];
      }
    } else {
      // Direct mode — query by user_id
      const { count: tc } = await supabase
        .from("audit_sessions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .is("workspace_id", null);

      const { count: cc } = await supabase
        .from("audit_sessions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .is("workspace_id", null)
        .eq("status", "complete");

      const { data: rpts } = await supabase
        .from("reports")
        .select("overall_score, function_scores, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      totalAudits = tc ?? 0;
      completedAudits = cc ?? 0;
      reports = rpts ?? [];
    }
  }

  const avgScore = reports.length > 0
    ? Math.round(reports.reduce((sum: number, r: any) => sum + (r.overall_score ?? 0), 0) / reports.length)
    : null;

  // Aggregate function gaps across all reports
  const functionGapCounts: Record<string, number> = {};
  reports.forEach((r: any) => {
    const scores = r.function_scores as Record<string, number | { score?: number }> ?? {};
    Object.entries(scores).forEach(([fn, score]) => {
      const numScore = typeof score === "object" ? ((score as { score?: number })?.score ?? 0) : (score as number);
      if (numScore < 40) {
        functionGapCounts[fn] = (functionGapCounts[fn] ?? 0) + 1;
      }
    });
  });

  const topGapFunctions = Object.entries(functionGapCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <h1 className="text-foreground text-[28px] font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isAgency ? "Insights across all client audits" : "Insights across all your audits"}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-5 mb-8">
        <StatCard label="TOTAL AUDITS" value={totalAudits} />
        <StatCard
          label="COMPLETED AUDITS"
          value={completedAudits}
          subtitle={`${totalAudits ? Math.round((completedAudits / totalAudits) * 100) : 0}% completion rate`}
        />
        <StatCard
          label="AVERAGE SCORE"
          value={avgScore !== null ? `${avgScore}/100` : "—"}
          subtitle={avgScore !== null ? (avgScore >= 70 ? "Above average" : "Below average") : "Run audits to track"}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Score over time */}
        <div className="bg-card border-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl p-6">
          <h2 className="text-foreground font-semibold mb-6">Score History</h2>
          {reports.length === 0 ? (
            <p className="text-muted-foreground text-sm">No reports yet.</p>
          ) : (
            <div className="space-y-4">
              {reports.slice(0, 8).map((r: any, i: number) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-muted-foreground text-xs font-mono w-24 flex-shrink-0 tracking-wider">
                    {new Date(r.created_at).toLocaleDateString('en-US')}
                  </span>
                  <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${r.overall_score ?? 0}%`,
                        backgroundColor: (r.overall_score ?? 0) >= 70 ? "hsl(var(--primary))" : (r.overall_score ?? 0) >= 40 ? "#F59E0B" : "hsl(var(--destructive))",
                      }}
                    />
                  </div>
                  <span className="text-foreground text-xs font-medium w-8 text-right font-mono">{r.overall_score ?? "—"}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Common weak functions */}
        <div className="bg-card border-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl p-6">
          <h2 className="text-foreground font-semibold mb-6">Most Common Gaps</h2>
          {topGapFunctions.length === 0 ? (
            <p className="text-muted-foreground text-sm">No gap data yet. Complete an audit to see insights.</p>
          ) : (
            <div className="space-y-4">
              {topGapFunctions.map(([fn, count]) => (
                <div key={fn} className="flex items-center justify-between pb-4 border-b border-border/10 last:border-0 last:pb-0">
                  <span className="text-foreground text-sm font-medium">{FUNCTION_LABELS[fn] ?? fn}</span>
                  <span className="text-destructive text-sm font-semibold">{count} gap{count !== 1 ? "s" : ""}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
