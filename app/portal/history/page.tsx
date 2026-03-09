import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "~/lib/supabase/server";
import { CheckCircle2, Clock, Loader2 } from "lucide-react";
import { isDemoMode, DEMO_AUDITS, DEMO_REPORTS } from "~/lib/mock/mockData";

interface AuditSession {
  id: string;
  business_name: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  reports: { id: string }[] | null;
}

export default async function PortalHistoryPage() {
  let rows: AuditSession[];

  if (isDemoMode()) {
    // Demo mode — use mock audit history
    rows = DEMO_AUDITS.map(a => ({
      id: a.id,
      business_name: a.business_name,
      status: a.status,
      started_at: a.started_at,
      completed_at: a.completed_at ?? null,
      reports: DEMO_REPORTS.filter(r => r.session_id === a.id).map(r => ({ id: r.id })),
    }));
  } else {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login?redirectTo=/portal/history");

    const { data: client } = await supabase
      .from("clients")
      .select("id, workspace_id")
      .eq("client_user_id", user.id)
      .maybeSingle();

    if (!client) redirect("/dashboard");

    const { data: sessions } = await supabase
      .from("audit_sessions")
      .select("id, business_name, status, started_at, completed_at, reports(id)")
      .eq("client_id", client.id)
      .order("started_at", { ascending: false });

    rows = (sessions ?? []) as AuditSession[];
  }

  return (
    <div className="min-h-full bg-background pb-12">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/10 px-8 py-5 shadow-sm">
        <h1 className="text-foreground text-[28px] font-medium tracking-tight">Audit History</h1>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-10">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-card rounded-3xl border-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-5 shadow-sm">
              <Clock className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <h2 className="text-foreground font-medium text-[20px] mb-2 tracking-tight">No audits yet</h2>
            <p className="text-muted-foreground text-[15px]">Your completed reports will appear here</p>
          </div>
        ) : (
          <div className="bg-card shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-border/40 rounded-3xl overflow-hidden p-2">
            <div className="divide-y divide-border/10">
              {rows.map((session) => {
                const reportId = session.reports?.[0]?.id ?? null;
                const isComplete = session.status === "complete";
                const isProcessing =
                  session.status === "processing" || session.status === "in_progress";
                const date = session.completed_at ?? session.started_at;
                const formattedDate = date
                  ? new Date(date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                  : "—";

                return (
                  <Link
                    key={session.id}
                    href={isComplete && reportId ? `/portal/report` : "#"}
                    className={`flex items-center gap-5 px-6 py-5 transition-colors ${isComplete && reportId ? "hover:bg-secondary/20 cursor-pointer" : "cursor-default"
                      }`}
                  >
                    {isComplete ? (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      </div>
                    ) : isProcessing ? (
                      <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                        <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-foreground text-[17px] font-medium tracking-tight truncate">
                        {session.business_name}
                      </p>
                      <p className="text-muted-foreground text-[14px] font-medium mt-1">{formattedDate}</p>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span
                        className={`text-[12px] font-medium px-3 py-1 rounded-md border shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] ${isComplete
                          ? "text-primary border-primary/20 bg-primary/10"
                          : isProcessing
                            ? "text-amber-500 border-amber-500/20 bg-amber-500/10"
                            : "text-muted-foreground border-border/50 bg-secondary"
                          }`}
                      >
                        {isComplete ? "Complete" : isProcessing ? "Processing" : session.status}
                      </span>

                      {isComplete && reportId && (
                        <div className="text-primary text-[15px] font-medium hover:underline flex items-center gap-1">
                          View
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
