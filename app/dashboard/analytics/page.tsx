import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "~/lib/supabase/server";
import StatCard from "~/components/dashboard/shared/StatCard";
import Link from "next/link";
import { ArrowUpRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { isDemoMode, DEMO_AGENCY_AUDITS, DEMO_DIRECT_AUDITS, DEMO_REPORTS, DEMO_PROFILE, DEMO_CLIENTS } from "~/lib/mock/mockData";

const FUNCTION_LABELS: Record<string, string> = {
  sales: "Sales", marketing: "Marketing", operations: "Operations",
  finance: "Finance", hr: "HR", customer_service: "Customer Service",
  technology: "Technology", strategy: "Strategy",
};

function scoreColor(score: number | null) {
  if (score === null) return "text-muted-foreground";
  if (score >= 70) return "text-primary";
  if (score >= 40) return "text-amber-500";
  return "text-destructive";
}

interface ClientBreakdownItem {
  id: string;
  business_name: string;
  industry: string | null;
  latestScore: number | null;
  previousScore: number | null;
  auditCount: number;
  reportCount: number;
}

export default async function AnalyticsPage() {
  let totalAudits = 0;
  let completedAudits = 0;
  let reports: any[] = [];
  let isAgency = false;
  let clientBreakdown: ClientBreakdownItem[] = [];

  const cookieStore = cookies();
  const viewMode = cookieStore.get("view_mode")?.value;

  if (isDemoMode()) {
    isAgency = viewMode === "agency_owner" || DEMO_PROFILE.user_type === "agency_owner";
    const demoAudits = isAgency ? DEMO_AGENCY_AUDITS : DEMO_DIRECT_AUDITS;
    totalAudits = demoAudits.length;
    completedAudits = demoAudits.filter(a => a.status === "complete").length;
    reports = DEMO_REPORTS;

    if (isAgency) {
      clientBreakdown = DEMO_CLIENTS.map(c => {
        const clientReports = DEMO_REPORTS
          .filter(r => {
            const s = Array.isArray(r.audit_sessions) ? r.audit_sessions[0] : r.audit_sessions;
            return s?.business_name === c.business_name;
          })
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        const auditCount = DEMO_AGENCY_AUDITS.filter(a => a.business_name === c.business_name).length;
        return {
          id: c.id,
          business_name: c.business_name,
          industry: c.industry,
          latestScore: clientReports[0]?.overall_score ?? null,
          previousScore: clientReports[1]?.overall_score ?? null,
          auditCount,
          reportCount: clientReports.length,
        };
      }).filter(c => c.auditCount > 0);
    }
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

        // Client breakdown — fetch clients + their audit/report data
        const [{ data: clients }, { data: clientAuditSessions }] = await Promise.all([
          supabase
            .from("clients")
            .select("id, business_name, industry")
            .eq("workspace_id", workspace.id)
            .order("business_name"),
          supabase
            .from("audit_sessions")
            .select("id, client_id")
            .eq("workspace_id", workspace.id)
            .not("client_id", "is", null),
        ]);

        const clientSessionIds = (clientAuditSessions ?? []).map((a: any) => a.id);
        const { data: clientReports } = clientSessionIds.length > 0
          ? await supabase
            .from("reports")
            .select("id, overall_score, session_id, created_at")
            .in("session_id", clientSessionIds)
            .order("created_at", { ascending: false })
          : { data: [] };

        // Build session → client lookup
        const sessionToClient: Record<string, string> = {};
        for (const a of (clientAuditSessions ?? [])) {
          if ((a as any).client_id) sessionToClient[(a as any).id] = (a as any).client_id;
        }

        // Group reports by clientId (already ordered desc by created_at)
        const reportsByClient: Record<string, any[]> = {};
        for (const r of (clientReports ?? [])) {
          const cid = sessionToClient[(r as any).session_id];
          if (cid) {
            reportsByClient[cid] = reportsByClient[cid] ?? [];
            reportsByClient[cid].push(r);
          }
        }

        // Count audits per client
        const auditsByClient: Record<string, number> = {};
        for (const a of (clientAuditSessions ?? [])) {
          const cid = (a as any).client_id;
          if (cid) auditsByClient[cid] = (auditsByClient[cid] ?? 0) + 1;
        }

        clientBreakdown = (clients ?? []).map((c: any) => ({
          id: c.id,
          business_name: c.business_name,
          industry: c.industry,
          latestScore: reportsByClient[c.id]?.[0]?.overall_score ?? null,
          previousScore: reportsByClient[c.id]?.[1]?.overall_score ?? null,
          auditCount: auditsByClient[c.id] ?? 0,
          reportCount: reportsByClient[c.id]?.length ?? 0,
        })).filter((c: ClientBreakdownItem) => c.auditCount > 0);
      }
    } else {
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

      <div className="grid grid-cols-2 gap-6 mb-6">
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

      {/* Client Breakdown — agency only */}
      {isAgency && (
        <div className="bg-card border-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl overflow-hidden">
          <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-border/10">
            <div>
              <h2 className="text-foreground font-semibold">Client Breakdown</h2>
              <p className="text-muted-foreground text-xs mt-0.5">Latest score per client — click to view full analytics</p>
            </div>
            <Link
              href="/dashboard/clients"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              All Clients <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          {clientBreakdown.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground text-sm">
              No client audits yet. Run an audit for a client to see their breakdown here.
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-muted-foreground text-xs uppercase tracking-wide bg-secondary/20">
                  <th className="font-medium px-6 py-3">Client</th>
                  <th className="font-medium px-6 py-3">Industry</th>
                  <th className="font-medium px-6 py-3">Audits</th>
                  <th className="font-medium px-6 py-3">Latest Score</th>
                  <th className="font-medium px-6 py-3">Trend</th>
                  <th className="font-medium px-6 py-3 text-right">Analytics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {clientBreakdown.map((client) => {
                  const trend =
                    client.previousScore === null ? null
                    : client.latestScore === null ? null
                    : client.latestScore > client.previousScore ? "up"
                    : client.latestScore < client.previousScore ? "down"
                    : "flat";

                  return (
                    <tr key={client.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-foreground">
                        {client.business_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground capitalize">
                        {client.industry ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {client.auditCount}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-bold ${scoreColor(client.latestScore)}`}>
                          {client.latestScore !== null ? `${client.latestScore}/100` : "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {trend === "up" && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                            <TrendingUp className="w-3.5 h-3.5" />
                            +{(client.latestScore ?? 0) - (client.previousScore ?? 0)}
                          </span>
                        )}
                        {trend === "down" && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
                            <TrendingDown className="w-3.5 h-3.5" />
                            {(client.latestScore ?? 0) - (client.previousScore ?? 0)}
                          </span>
                        )}
                        {trend === "flat" && (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Minus className="w-3.5 h-3.5" /> —
                          </span>
                        )}
                        {trend === null && (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/dashboard/clients/${client.id}?tab=analytics`}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
                        >
                          View <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
