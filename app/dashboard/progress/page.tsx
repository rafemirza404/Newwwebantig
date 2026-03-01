import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "~/lib/supabase/server";
import Link from "next/link";
import type { ItemPriority, ItemStatus } from "~/lib/supabase/client";
import { isDemoMode, DEMO_IMPL_ITEMS } from "~/lib/mock/mockData";

const PRIORITY_LABEL: Record<ItemPriority, string> = {
  quick_win: "Quick Wins",
  medium: "Medium Term",
  strategic: "Strategic",
};

const PRIORITY_COLOR: Record<ItemPriority, string> = {
  quick_win: "var(--primary)",
  medium: "#F59E0B",
  strategic: "var(--muted-foreground)",
};

const STATUS_OPTIONS: { value: ItemStatus; label: string }[] = [
  { value: "not_started", label: "Not Started" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

function StatusBadge({ status }: { status: ItemStatus }) {
  const styles: Record<ItemStatus, string> = {
    not_started: "bg-secondary text-muted-foreground border border-border/50",
    in_progress: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
    done: "bg-primary/10 text-primary border border-primary/20",
  };
  return (
    <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1.5 rounded-full font-semibold ${styles[status]}`}>
      {STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status}
    </span>
  );
}

export default async function ProgressPage() {
  let items: any[] = [];

  if (isDemoMode()) {
    // Map mock impl items to match the expected shape with pending mapped to not_started
    items = DEMO_IMPL_ITEMS.map(item => ({
      ...item,
      status: item.status === "pending" ? "not_started" : item.status,
    }));
  } else {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login?redirectTo=/dashboard/progress");

    const { data: profile } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .single();

    // Progress page is for direct users only
    if (profile?.user_type !== "direct") redirect("/dashboard");

    const { data } = await supabase
      .from("implementation_items")
      .select("*, reports(audit_sessions(business_name))")
      .eq("user_id", user.id)
      .order("priority", { ascending: true });

    items = data ?? [];
  }

  const totalItems = items.length;
  const doneItems = items.filter((i) => i.status === "done").length;
  const inProgressItems = items.filter((i) => i.status === "in_progress").length;
  const totalTimeSaved = items
    .filter((i) => i.status === "done")
    .reduce((sum: number, i: any) => sum + (i.time_saved_hrs ?? 0), 0);

  // Group by priority
  const grouped: Record<ItemPriority, typeof items> = {
    quick_win: items.filter((i) => i.priority === "quick_win"),
    medium: items.filter((i) => i.priority === "medium"),
    strategic: items.filter((i) => i.priority === "strategic"),
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <h1 className="text-foreground text-[28px] font-bold tracking-tight">Implementation Progress</h1>
        <p className="text-muted-foreground text-sm mt-1">Track your AI implementation roadmap</p>
      </div>

      {totalItems === 0 ? (
        <div className="bg-card border-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl p-12 text-center">
          <p className="text-foreground font-medium mb-2">No implementation items yet</p>
          <p className="text-muted-foreground text-sm mb-6">
            Complete an audit to get your personalized AI implementation roadmap.
          </p>
          <Link
            href="/audit/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-full transition-colors"
          >
            Start Audit
          </Link>
        </div>
      ) : (
        <>
          {/* Summary row */}
          <div className="grid grid-cols-4 gap-5 mb-8">
            {[
              { label: "TOTAL ITEMS", value: totalItems, color: "var(--foreground)" },
              { label: "COMPLETED", value: doneItems, color: "var(--primary)" },
              { label: "IN PROGRESS", value: inProgressItems, color: "#F59E0B" },
              { label: "HOURS SAVED", value: `${totalTimeSaved}h`, color: "var(--foreground)" },
            ].map((stat) => (
              <div key={stat.label} className="bg-card border-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl p-5 flex flex-col justify-between min-h-[120px]">
                <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">{stat.label}</p>
                <p className="text-[28px] font-bold tracking-tight" style={{ color: stat.color }}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          {totalItems > 0 && (
            <div className="bg-card border-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-foreground text-sm font-semibold">Overall Progress</span>
                <span className="text-primary text-sm font-bold">
                  {Math.round((doneItems / totalItems) * 100)}%
                </span>
              </div>
              <div className="bg-secondary rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.round((doneItems / totalItems) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Items by priority */}
          {(Object.entries(grouped) as [ItemPriority, typeof items][]).map(([priority, groupItems]) => {
            if (!groupItems || groupItems.length === 0) return null;
            return (
              <div key={priority} className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: PRIORITY_COLOR[priority] }}
                  />
                  <h2 className="text-foreground font-semibold text-sm tracking-wide uppercase">{PRIORITY_LABEL[priority]}</h2>
                  <span className="text-muted-foreground text-xs font-mono ml-1">({groupItems.length})</span>
                </div>

                <div className="bg-card border-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl overflow-hidden divide-y divide-border/10">
                  {groupItems.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-4 px-6 py-4 transition-colors hover:bg-secondary/10 ${item.status === "done" ? "opacity-60" : ""}`}
                    >
                      {/* Checkbox indicator */}
                      <div
                        className="w-5 h-5 rounded-md flex-shrink-0 border-2 flex items-center justify-center transition-colors"
                        style={{
                          borderColor: item.status === "done" ? "var(--primary)" : "var(--border)",
                          backgroundColor: item.status === "done" ? "var(--primary)" : "transparent",
                        }}
                      >
                        {item.status === "done" && (
                          <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 12 12">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>

                      {/* Gap name */}
                      <span className={`flex-1 text-[15px] font-medium ${item.status === "done" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {item.gap_name}
                      </span>

                      {/* Time saved */}
                      {item.time_saved_hrs && (
                        <span className="text-muted-foreground text-xs font-semibold px-2.5 py-1 rounded bg-secondary">
                          {item.time_saved_hrs}h saved
                        </span>
                      )}

                      {/* Status badge */}
                      <StatusBadge status={item.status as ItemStatus} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
