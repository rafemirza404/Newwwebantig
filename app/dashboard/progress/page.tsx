"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, Clock, TrendingUp, Zap, ChevronDown, Calendar } from "lucide-react";
import { createSupabaseClient } from "~/lib/supabase/client";
import { toast } from "sonner";
import { isDemoMode, DEMO_IMPL_ITEMS } from "~/lib/mock/mockData";

type ItemStatus = "not_started" | "in_progress" | "done";
type ItemPriority = "quick_win" | "medium" | "strategic";
type TimelineFilter = "week" | "month" | "quarter" | "all";

interface ImplItem {
  id: string;
  gap_name: string;
  priority: ItemPriority;
  time_saved_hrs: number | null;
  status: ItemStatus;
  completed_at: string | null;
  started_at: string | null;
}

const PRIORITY_LABEL: Record<ItemPriority, string> = {
  quick_win: "Quick Wins",
  medium: "Medium Term",
  strategic: "Strategic",
};

const PRIORITY_COLOR: Record<ItemPriority, string> = {
  quick_win: "hsl(var(--primary))",
  medium: "#F59E0B",
  strategic: "hsl(var(--muted-foreground))",
};

const STATUS_LABELS: Record<ItemStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  done: "Done",
};

function timelineStart(filter: TimelineFilter): Date {
  const now = Date.now();
  if (filter === "week")    return new Date(now - 7  * 24 * 60 * 60 * 1000);
  if (filter === "month")   return new Date(now - 30 * 24 * 60 * 60 * 1000);
  if (filter === "quarter") return new Date(now - 90 * 24 * 60 * 60 * 1000);
  return new Date(0);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function KpiCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string | number; sub: string; color: string;
}) {
  return (
    <div className="bg-card rounded-2xl p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <div>
        <p className={`text-[28px] font-bold tracking-tight leading-none ${color}`}>{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </div>
    </div>
  );
}

export default function ProgressPage() {
  const router = useRouter();
  const [items, setItems] = useState<ImplItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [pendingDone, setPendingDone] = useState<string | null>(null);
  const [timelineFilter, setTimelineFilter] = useState<TimelineFilter>("month");

  useEffect(() => {
    if (isDemoMode()) {
      const mapped = DEMO_IMPL_ITEMS.map((item) => ({
        ...item,
        status: (item.status === "pending" ? "not_started" : item.status) as ItemStatus,
        completed_at: item.status === "done" ? "2026-02-28T10:00:00Z" : null,
        started_at: (item.status === "in_progress" || item.status === "done") ? "2026-02-20T10:00:00Z" : null,
      }));
      setItems(mapped);
      setLoading(false);
      return;
    }

    (async () => {
      const supabase = createSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login?redirectTo=/dashboard/progress"); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", user.id)
        .single();

      if (profile?.user_type !== "direct") { router.push("/dashboard"); return; }

      const { data } = await supabase
        .from("implementation_items")
        .select("id, gap_name, priority, time_saved_hrs, status, completed_at, started_at")
        .eq("user_id", user.id)
        .order("priority", { ascending: true });

      setItems(data ?? []);
      setLoading(false);
    })();
  }, [router]);

  async function applyStatus(itemId: string, newStatus: ItemStatus) {
    setUpdatingId(itemId);
    setPendingDone(null);

    if (isDemoMode()) {
      const now = new Date().toISOString();
      setItems(prev => prev.map(i => {
        if (i.id !== itemId) return i;
        return {
          ...i,
          status: newStatus,
          started_at:   newStatus === "in_progress" ? now : newStatus === "not_started" ? null : i.started_at,
          completed_at: newStatus === "done"         ? now : newStatus === "not_started" ? null : i.completed_at,
        };
      }));
      toast.success(`Marked as ${STATUS_LABELS[newStatus]}`);
      setUpdatingId(null);
      return;
    }

    const res = await fetch("/api/progress", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, status: newStatus }),
    });

    if (res.ok) {
      const now = new Date().toISOString();
      setItems(prev => prev.map(i => {
        if (i.id !== itemId) return i;
        return {
          ...i,
          status: newStatus,
          started_at:   newStatus === "in_progress" ? now : newStatus === "not_started" ? null : i.started_at,
          completed_at: newStatus === "done"         ? now : newStatus === "not_started" ? null : i.completed_at,
        };
      }));
      toast.success(`Marked as ${STATUS_LABELS[newStatus]}`);
    } else {
      toast.error("Failed to update status");
    }
    setUpdatingId(null);
  }

  function handleStatusSelect(item: ImplItem, newStatus: ItemStatus) {
    if (newStatus === item.status) return;
    if (newStatus === "done") {
      setPendingDone(item.id); // show inline confirm before committing
    } else {
      applyStatus(item.id, newStatus);
    }
  }

  // ── KPIs ────────────────────────────────────────────────────────────────────
  const totalItems      = items.length;
  const doneItems       = items.filter(i => i.status === "done");
  const inProgressItems = items.filter(i => i.status === "in_progress");
  const totalHoursSaved = doneItems.reduce((s, i) => s + (i.time_saved_hrs ?? 0), 0);
  const weekAgo         = new Date(Date.now() - 7  * 24 * 60 * 60 * 1000);
  const monthAgo        = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const completedThisWeek  = doneItems.filter(i => i.completed_at && new Date(i.completed_at) >= weekAgo).length;
  const completedThisMonth = doneItems.filter(i => i.completed_at && new Date(i.completed_at) >= monthAgo).length;
  const completionRate     = totalItems > 0 ? Math.round((doneItems.length / totalItems) * 100) : 0;

  // ── Timeline ─────────────────────────────────────────────────────────────────
  const since         = timelineStart(timelineFilter);
  const timelineItems = doneItems
    .filter(i => i.completed_at && new Date(i.completed_at) >= since)
    .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime());
  const timelineHours = timelineItems.reduce((s, i) => s + (i.time_saved_hrs ?? 0), 0);

  // ── Grouped ──────────────────────────────────────────────────────────────────
  const grouped: Record<ItemPriority, ImplItem[]> = {
    quick_win: items.filter(i => i.priority === "quick_win"),
    medium:    items.filter(i => i.priority === "medium"),
    strategic: items.filter(i => i.priority === "strategic"),
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
      </div>
    );
  }

  if (totalItems === 0) {
    return (
      <div className="p-6 max-w-[1400px] mx-auto">
        <div className="mb-8">
          <h1 className="text-foreground text-[28px] font-bold tracking-tight">Implementation Progress</h1>
          <p className="text-muted-foreground text-sm mt-1">Track your AI automation roadmap</p>
        </div>
        <div className="bg-card rounded-2xl p-12 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
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
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-8">

      {/* Page header */}
      <div>
        <h1 className="text-foreground text-[28px] font-bold tracking-tight">Implementation Progress</h1>
        <p className="text-muted-foreground text-sm mt-1">Track your AI automation roadmap</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<Zap className="w-4 h-4 text-primary" />}
          label="Hours Saved" value={`${totalHoursSaved}h`} sub="total" color="text-primary"
        />
        <KpiCard
          icon={<CheckCircle2 className="w-4 h-4 text-green-500" />}
          label="This Week" value={completedThisWeek} sub="completed" color="text-green-500"
        />
        <KpiCard
          icon={<Calendar className="w-4 h-4 text-amber-500" />}
          label="This Month" value={completedThisMonth} sub="completed" color="text-amber-500"
        />
        <KpiCard
          icon={<TrendingUp className="w-4 h-4 text-foreground" />}
          label="Completion" value={`${completionRate}%`}
          sub={`${doneItems.length} of ${totalItems} done`} color="text-foreground"
        />
      </div>

      {/* Overall progress bar */}
      <div className="bg-card rounded-2xl p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-foreground">Overall Progress</span>
          <span className="text-sm font-bold text-primary">{completionRate}%</span>
        </div>
        <div className="bg-secondary rounded-full h-2 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {doneItems.length} done · {inProgressItems.length} in progress · {items.filter(i => i.status === "not_started").length} not started
        </p>
      </div>

      {/* Priority groups */}
      {(Object.entries(grouped) as [ItemPriority, ImplItem[]][]).map(([priority, groupItems]) => {
        if (!groupItems.length) return null;
        const groupDone = groupItems.filter(i => i.status === "done").length;
        const groupPct  = Math.round((groupDone / groupItems.length) * 100);

        return (
          <div key={priority}>
            {/* Group header with inline progress bar */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PRIORITY_COLOR[priority] }} />
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                {PRIORITY_LABEL[priority]}
              </h2>
              <span className="text-muted-foreground text-xs font-mono">({groupItems.length})</span>
              <div className="flex-1 mx-2 bg-secondary rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${groupPct}%`, backgroundColor: PRIORITY_COLOR[priority] }}
                />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{groupDone}/{groupItems.length}</span>
            </div>

            {/* Item rows */}
            <div className="bg-card rounded-2xl overflow-hidden divide-y divide-border/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              {groupItems.map(item => {
                const isUpdating   = updatingId === item.id;
                const isConfirming = pendingDone === item.id;

                return (
                  <div key={item.id} className={`px-5 py-4 transition-colors ${item.status === "done" ? "opacity-60" : ""}`}>
                    <div className="flex items-center gap-4">

                      {/* Status dot */}
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor:
                            item.status === "done"        ? PRIORITY_COLOR[priority] :
                            item.status === "in_progress" ? "#F59E0B" :
                            "hsl(var(--border))",
                        }}
                      />

                      {/* Gap name */}
                      <span className={`flex-1 text-sm font-medium ${item.status === "done" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {item.gap_name}
                      </span>

                      {/* Time saved badge */}
                      {item.time_saved_hrs ? (
                        <span className="text-xs text-muted-foreground font-semibold px-2 py-1 rounded-lg bg-secondary">
                          {item.time_saved_hrs}h
                        </span>
                      ) : null}

                      {/* Status dropdown */}
                      <div className="relative flex-shrink-0">
                        <select
                          value={item.status}
                          disabled={isUpdating || isConfirming}
                          onChange={e => handleStatusSelect(item, e.target.value as ItemStatus)}
                          className="appearance-none pl-3 pr-7 py-1.5 text-xs font-semibold rounded-full border cursor-pointer bg-background focus:outline-none focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50"
                          style={{
                            borderColor: item.status === "done"        ? PRIORITY_COLOR[priority]
                                       : item.status === "in_progress" ? "#F59E0B"
                                       : "hsl(var(--border))",
                            color:       item.status === "done"        ? PRIORITY_COLOR[priority]
                                       : item.status === "in_progress" ? "#F59E0B"
                                       : "hsl(var(--muted-foreground))",
                          }}
                        >
                          <option value="not_started">Not Started</option>
                          <option value="in_progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                        {isUpdating
                          ? <Loader2 className="w-3 h-3 animate-spin absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                          : <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        }
                      </div>
                    </div>

                    {/* Inline "Done" confirmation */}
                    {isConfirming && (
                      <div className="mt-3 ml-6 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Mark as done?</span>
                        <button
                          onClick={() => applyStatus(item.id, "done")}
                          className="text-xs font-semibold px-3 py-1 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setPendingDone(null)}
                          className="text-xs font-semibold px-3 py-1 bg-secondary text-muted-foreground rounded-full hover:text-foreground transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Completed timeline */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Completed Timeline</h2>
          <div className="flex items-center gap-1 bg-secondary rounded-full p-1">
            {(["week", "month", "quarter", "all"] as TimelineFilter[]).map(f => (
              <button
                key={f}
                onClick={() => setTimelineFilter(f)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  timelineFilter === f
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f === "all" ? "All Time" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {timelineItems.length > 0 ? (
          <>
            <div className="mb-3 px-4 py-3 bg-primary/5 border border-primary/10 rounded-xl text-sm text-primary font-medium">
              {timelineHours}h saved · {timelineItems.length} item{timelineItems.length !== 1 ? "s" : ""} completed
              {timelineFilter !== "all" && ` this ${timelineFilter}`}
            </div>
            <div className="bg-card rounded-2xl overflow-hidden divide-y divide-border/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              {timelineItems.map(item => (
                <div key={item.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  <span className="flex-1 text-sm text-foreground font-medium">{item.gap_name}</span>
                  {item.time_saved_hrs ? (
                    <span className="text-xs text-muted-foreground">{item.time_saved_hrs}h saved</span>
                  ) : null}
                  <span className="text-xs text-muted-foreground">{formatDate(item.completed_at!)}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-card rounded-2xl p-8 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <Clock className="w-6 h-6 mx-auto mb-2 text-muted-foreground opacity-40" />
            <p className="text-sm text-muted-foreground">
              No items completed {timelineFilter === "all" ? "yet" : `this ${timelineFilter}`}
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
