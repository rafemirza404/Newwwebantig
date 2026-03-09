import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "~/lib/supabase/server";
import { isDemoMode, DEMO_REPORTS, DEMO_AGENCY_AUDITS, DEMO_CLIENTS } from "~/lib/mock/mockData";

const FUNCTION_LABELS: Record<string, string> = {
  sales: "Sales",
  marketing: "Marketing",
  operations: "Operations",
  finance: "Finance",
  hr: "HR",
  customer_service: "Customer Service",
  technology: "Technology",
  strategy: "Strategy",
};

function scoreColor(score: number) {
  if (score >= 70) return "text-primary";
  if (score >= 40) return "text-amber-500";
  return "text-destructive";
}

function scoreBg(score: number) {
  if (score >= 70) return "bg-primary";
  if (score >= 40) return "bg-amber-500";
  return "bg-destructive";
}

interface Report {
  id: string;
  overall_score: number | null;
  function_scores: Record<string, number> | null;
  created_at: string;
}

export default async function PortalAnalyticsPage() {
  let reports: Report[] = [];

  if (isDemoMode()) {
    const demoClient = DEMO_CLIENTS[0];
    const demoAudits = DEMO_AGENCY_AUDITS.filter(
      (a) => a.business_name === demoClient.business_name && a.status === "complete"
    );
    const auditIds = new Set(demoAudits.map((a) => a.id));
    reports = DEMO_REPORTS
      .filter((r) => auditIds.has(r.session_id))
      .map((r) => ({
        id: r.id,
        overall_score: r.overall_score,
        function_scores: (r.function_scores as Record<string, number>) ?? null,
        created_at: r.created_at,
      }))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  } else {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/portal/login");

    const { data: client } = await supabase
      .from("clients")
      .select("id")
      .eq("client_user_id", user.id)
      .maybeSingle();

    if (!client) redirect("/dashboard");

    const { data: sessions } = await supabase
      .from("audit_sessions")
      .select("id")
      .eq("client_id", client.id)
      .eq("status", "complete")
      .order("completed_at", { ascending: true });

    if (sessions && sessions.length > 0) {
      const sessionIds = sessions.map((s) => s.id);
      const { data: reportData } = await supabase
        .from("reports")
        .select("id, overall_score, function_scores, created_at")
        .in("session_id", sessionIds)
        .order("created_at", { ascending: true });
      reports = (reportData ?? []) as Report[];
    }
  }

  const latestReport = reports[reports.length - 1] ?? null;
  const latestFunctionScores = latestReport?.function_scores ?? {};

  return (
    <div className="min-h-full bg-background pb-12">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/10 px-8 py-5 shadow-sm">
        <h1 className="text-foreground text-[28px] font-medium tracking-tight">Analytics</h1>
      </div>

      <div className="max-w-[900px] mx-auto px-6 mt-10 space-y-8">

        {/* Score Trend */}
        <div className="bg-card border border-border/10 rounded-2xl p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <h2 className="text-sm font-semibold text-foreground mb-4">Score Trend</h2>

          {reports.length === 0 ? (
            <p className="text-muted-foreground text-sm">No completed audits yet.</p>
          ) : reports.length === 1 ? (
            <div className="flex items-center gap-4">
              <div className={`text-4xl font-bold ${scoreColor(reports[0].overall_score ?? 0)}`}>
                {reports[0].overall_score ?? "—"}
              </div>
              <div>
                <p className="text-sm text-foreground font-medium">
                  {new Date(reports[0].created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Complete more audits to track your improvement
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {reports.map((r, i) => {
                const prev = reports[i - 1];
                const delta = prev && r.overall_score != null && prev.overall_score != null
                  ? r.overall_score - prev.overall_score
                  : null;
                return (
                  <div key={r.id} className="flex items-center gap-2 bg-secondary/50 border border-border/20 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                      </p>
                      <p className={`text-xl font-bold ${scoreColor(r.overall_score ?? 0)}`}>
                        {r.overall_score ?? "—"}
                      </p>
                    </div>
                    {delta !== null && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${delta >= 0 ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                        {delta >= 0 ? "+" : ""}{delta}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Latest Function Scores */}
        {latestReport && Object.keys(latestFunctionScores).length > 0 && (
          <div className="bg-card border border-border/10 rounded-2xl p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <h2 className="text-sm font-semibold text-foreground mb-1">Function Scores</h2>
            <p className="text-xs text-muted-foreground mb-5">Latest audit</p>
            <div className="space-y-4">
              {Object.entries(latestFunctionScores)
                .sort(([, a], [, b]) => b - a)
                .map(([key, rawScore]) => {
                  const score = typeof rawScore === "object" && rawScore !== null
                    ? (rawScore as { score: number }).score
                    : (rawScore as number);
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-foreground">{FUNCTION_LABELS[key] ?? key}</span>
                        <span className={`text-sm font-semibold ${scoreColor(score)}`}>{score}</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${scoreBg(score)}`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {reports.length === 0 && (
          <div className="text-center py-20 bg-card rounded-2xl border border-border/10">
            <p className="text-muted-foreground text-[15px] font-medium">No analytics yet</p>
            <p className="text-muted-foreground text-sm mt-1">Complete an audit to see your scores here</p>
          </div>
        )}
      </div>
    </div>
  );
}
