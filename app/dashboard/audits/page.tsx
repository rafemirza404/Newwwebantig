import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "~/lib/supabase/server";
import Link from "next/link";
import { Plus } from "lucide-react";
import { isDemoMode, DEMO_AUDITS } from "~/lib/mock/mockData";

const STATUS_LABELS: Record<string, string> = {
  in_progress: "In Progress",
  processing: "Processing",
  complete: "Complete",
  abandoned: "Abandoned",
};

const STATUS_STYLES: Record<string, string> = {
  in_progress: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
  processing: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
  complete: "bg-primary/10 text-primary border border-primary/20",
  abandoned: "bg-secondary text-muted-foreground border border-border/50",
};

export default async function AuditsPage() {
  let sessions: any[] = [];

  if (isDemoMode()) {
    sessions = DEMO_AUDITS;
  } else {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login?redirectTo=/dashboard/audits");

    const { data: profile } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .single();

    const { data } = await supabase
      .from("audit_sessions")
      .select("id, business_name, status, mode, started_at, completed_at, question_count")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false });

    sessions = data ?? [];
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-foreground text-[28px] font-bold tracking-tight">Audits</h1>
          <p className="text-muted-foreground text-sm mt-1">{sessions.length} total audits</p>
        </div>
        <Link
          href="/audit/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold flex-shrink-0 shadow-sm transition-colors rounded-full"
        >
          <Plus className="w-4 h-4 text-primary-foreground" />
          New Audit
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-card border-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl p-12 text-center">
          <p className="text-foreground font-medium mb-2">No audits yet</p>
          <p className="text-muted-foreground text-sm mb-6">Start your first audit to get AI-powered business insights.</p>
          <Link
            href="/audit/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-full transition-colors"
          >
            <Plus className="w-4 h-4 text-primary-foreground" />
            Start Audit
          </Link>
        </div>
      ) : (
        <div className="bg-card border-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="text-muted-foreground text-xs uppercase tracking-wide border-b border-border/10 bg-secondary/20">
                <th className="font-medium px-5 py-4">Business</th>
                <th className="font-medium px-5 py-4">Status</th>
                <th className="font-medium px-5 py-4">Questions</th>
                <th className="font-medium px-5 py-4">Started</th>
                <th className="font-medium px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {sessions.map((session: any) => (
                <tr key={session.id} className="hover:bg-secondary/20 transition-colors group">
                  <td className="px-5 py-4 text-foreground text-sm font-medium">{session.business_name}</td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1.5 rounded-full ${STATUS_STYLES[session.status] ?? "bg-secondary text-muted-foreground border border-border/50"}`}>
                      {STATUS_LABELS[session.status] ?? session.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground text-sm">{session.question_count ?? 0}</td>
                  <td className="px-5 py-4 text-muted-foreground text-sm">
                    {new Date(session.started_at).toLocaleDateString('en-US')}
                  </td>
                  <td className="px-5 py-4 flex items-center gap-3">
                    {session.status === "in_progress" && (
                      <Link href={`/audit/${session.id}`} className="inline-flex items-center justify-center text-xs font-semibold px-3 py-1.5 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors">
                        Resume
                      </Link>
                    )}
                    {session.status === "complete" && (
                      <Link href={`/dashboard/reports`} className="inline-flex items-center justify-center text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                        View Report
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
