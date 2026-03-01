import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "~/lib/supabase/server";
import Link from "next/link";
import { isDemoMode, DEMO_REPORTS } from "~/lib/mock/mockData";

function getScoreColor(score: number | null) {
  if (score === null) return "text-muted-foreground";
  if (score >= 70) return "text-primary";
  if (score >= 40) return "text-amber-500";
  return "text-destructive";
}

export default async function ReportsPage() {
  let reports: any[] = [];

  if (isDemoMode()) {
    reports = DEMO_REPORTS;
  } else {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login?redirectTo=/dashboard/reports");

    const { data } = await supabase
      .from("reports")
      .select(`
        id, overall_score, created_at,
        audit_sessions (id, business_name, industry)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    reports = data ?? [];
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-foreground text-[28px] font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground text-sm mt-1">{reports.length} reports generated</p>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="bg-card border-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl p-12 text-center">
          <p className="text-foreground font-medium mb-2">No reports yet</p>
          <p className="text-muted-foreground text-sm mb-6">Complete an audit to generate your AI-powered business report.</p>
          <Link
            href="/audit/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-full transition-colors"
          >
            Start Audit
          </Link>
        </div>
      ) : (
        <div className="bg-card border-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="text-muted-foreground text-xs uppercase tracking-wide border-b border-border/10 bg-secondary/20">
                <th className="font-medium px-5 py-4">Business</th>
                <th className="font-medium px-5 py-4">Score</th>
                <th className="font-medium px-5 py-4">Industry</th>
                <th className="font-medium px-5 py-4">Generated</th>
                <th className="font-medium px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {reports.map((report: any) => {
                const session = Array.isArray(report.audit_sessions)
                  ? report.audit_sessions[0]
                  : report.audit_sessions;
                return (
                  <tr key={report.id} className="hover:bg-secondary/20 transition-colors group">
                    <td className="px-5 py-4 text-foreground text-sm font-medium">
                      {session?.business_name ?? "Unknown"}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-sm font-semibold ${getScoreColor(report.overall_score)}`}>
                        {report.overall_score !== null ? `${report.overall_score}/100` : "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground text-sm capitalize">
                      {session?.industry ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground text-sm">
                      {new Date(report.created_at).toLocaleDateString('en-US')}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/report/${report.id}`} className="inline-flex items-center justify-center text-xs font-semibold px-3 py-1.5 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors">
                        View Report →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
