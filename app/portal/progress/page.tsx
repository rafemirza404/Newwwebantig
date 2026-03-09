import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "~/lib/supabase/server";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { isDemoMode, DEMO_IMPL_ITEMS } from "~/lib/mock/mockData";

interface ImplItem {
  id: string;
  gap_name: string;
  priority: string;
  time_saved_hrs: number;
  status: string;
  completed_at: string | null;
}

const PRIORITY_ORDER = ["quick_win", "medium", "strategic"];
const PRIORITY_LABEL: Record<string, string> = {
  quick_win: "Quick Win",
  medium: "Medium",
  strategic: "Strategic",
};
const PRIORITY_COLOR: Record<string, string> = {
  quick_win: "var(--primary)",
  medium: "#F59E0B",
  strategic: "var(--muted-foreground)",
};

export default async function PortalProgressPage() {
  let items: ImplItem[] = [];

  // Demo mode bypass
  if (isDemoMode()) {
    items = DEMO_IMPL_ITEMS.map(item => ({
      ...item,
      status: item.status === "pending" ? "not_started" : item.status,
      completed_at: item.status === "done" ? "2026-02-01T12:00:00Z" : null,
    })) as ImplItem[];
  } else {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login?redirectTo=/portal/progress");

    const { data: client } = await supabase
      .from("clients")
      .select("id, workspace_id")
      .eq("client_user_id", user.id)
      .maybeSingle();

    if (!client) redirect("/dashboard");

    // Get the latest complete session for this client
    const { data: session } = await supabase
      .from("audit_sessions")
      .select("id")
      .eq("client_id", client.id)
      .eq("status", "complete")
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!session) {
      return (
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="text-center max-w-sm">
            <h2 className="text-foreground font-semibold mb-2">No data yet</h2>
            <p className="text-muted-foreground text-sm">
              Implementation items will appear here once your audit report is complete.
            </p>
          </div>
        </div>
      );
    }

    // Get the report for this session
    const { data: report } = await supabase
      .from("reports")
      .select("id")
      .eq("session_id", session.id)
      .single();

    if (report) {
      const { data } = await supabase
        .from("implementation_items")
        .select("id, gap_name, priority, time_saved_hrs, status, completed_at")
        .eq("report_id", report.id)
        .order("priority", { ascending: true });
      if (data) items = data as ImplItem[];
    }
  }

  const completed = items.filter((i) => i.status === "done");
  const totalHrs = items.reduce((s, i) => s + Number(i.time_saved_hrs ?? 0), 0);
  const savedHrs = completed.reduce((s, i) => s + Number(i.time_saved_hrs ?? 0), 0);
  const pct = items.length > 0 ? Math.round((completed.length / items.length) * 100) : 0;

  const grouped = PRIORITY_ORDER.reduce<Record<string, ImplItem[]>>((acc, p) => {
    acc[p] = items.filter((i) => i.priority === p);
    return acc;
  }, {});

  return (
    <div className="min-h-full bg-background pb-12">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/10 px-8 py-5 shadow-sm">
        <h1 className="text-foreground text-[28px] font-medium tracking-tight">Implementation Progress</h1>
      </div>

      <div className="max-w-[1000px] mx-auto px-6 mt-10 space-y-10">
        {/* Summary row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Completed", value: `${completed.length} / ${items.length}` },
            { label: "Progress", value: `${pct}%` },
            { label: "Hrs Saved", value: `${savedHrs} / ${totalHrs}h` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-card shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] border border-border/30 rounded-3xl p-6">
              <p className="text-muted-foreground text-[14px] font-medium mb-2">{label}</p>
              <p className="text-foreground text-3xl font-semibold tracking-tight">{value}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="bg-card border border-border/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-3xl p-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-muted-foreground text-[15px] font-medium">Overall Progress</span>
            <span className="text-foreground text-[18px] font-semibold">{pct}%</span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-primary rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
              style={{ width: `${pct}%` }}
            >
              <div className="absolute inset-0 bg-white/20 w-full h-full skew-x-12 -translate-x-full animate-[shimmer_2s_infinite]" />
            </div>
          </div>
        </div>

        {/* Items by priority */}
        <div className="space-y-10">
          {PRIORITY_ORDER.map((priority) => {
            const group = grouped[priority];
            if (!group || group.length === 0) return null;
            const color = PRIORITY_COLOR[priority];
            return (
              <div key={priority} className="space-y-4">
                <div className="flex items-center gap-3">
                  <span
                    className="text-[12px] font-medium px-3 py-1 rounded-md border shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                    style={{ color, borderColor: `${color}30`, backgroundColor: `${color}10` }}
                  >
                    {PRIORITY_LABEL[priority]}
                  </span>
                  <span className="text-muted-foreground text-[14px] font-medium">{group.length} items</span>
                </div>

                <div className="bg-card shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl overflow-hidden border border-border/40 p-2">
                  <div className="divide-y divide-border/10">
                    {group.map((item) => {
                      const done = item.status === "done";
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-5 px-6 py-5 hover:bg-secondary/20 transition-colors"
                        >
                          {done ? (
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <CheckCircle2 className="w-4 h-4 text-primary" />
                            </div>
                          ) : item.status === "in_progress" ? (
                            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                              <Clock className="w-4 h-4 text-amber-500" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                              <Circle className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={`text-[17px] font-medium tracking-tight truncate transition-colors ${done ? "text-muted-foreground/60 line-through" : "text-foreground"}`}>
                              {item.gap_name}
                            </p>
                            {item.completed_at && (
                              <p className="text-muted-foreground text-[14px] mt-1">
                                Completed {new Date(item.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="inline-flex items-center justify-center bg-secondary text-foreground text-[14px] font-medium px-3 py-1.5 rounded-xl border border-border/40">
                              {item.time_saved_hrs}h/mo
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {items.length === 0 && (
          <div className="text-center py-20 bg-card rounded-3xl border border-border/10">
            <p className="text-muted-foreground text-[15px] font-medium">No implementation items found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
