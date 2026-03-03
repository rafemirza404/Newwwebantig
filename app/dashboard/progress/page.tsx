"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createSupabaseClient } from "~/lib/supabase/client";
import { toast } from "sonner";
import { isDemoMode, DEMO_IMPL_ITEMS } from "~/lib/mock/mockData";

type ItemStatus = "not_started" | "in_progress" | "done";
type ItemPriority = "quick_win" | "medium" | "strategic";

interface ImplItem {
  id: string;
  gap_name: string;
  priority: ItemPriority;
  time_saved_hrs: number | null;
  status: ItemStatus;
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

const STATUS_OPTIONS: { value: ItemStatus; label: string }[] = [
  { value: "not_started", label: "Not Started" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

// Cycle order: not_started → in_progress → done → not_started
const STATUS_CYCLE: Record<ItemStatus, ItemStatus> = {
  not_started: "in_progress",
  in_progress: "done",
  done: "not_started",
};

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

export default function ProgressPage() {
  const router = useRouter();
  const [items, setItems] = useState<ImplItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (isDemoMode()) {
      const mapped = DEMO_IMPL_ITEMS.map((item) => ({
        ...item,
        status: (item.status === "pending" ? "not_started" : item.status) as ItemStatus,
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
        .select("id, gap_name, priority, time_saved_hrs, status")
        .eq("user_id", user.id)
        .order("priority", { ascending: true });

      setItems(data ?? []);
      setLoading(false);
    })();
  }, []);

  async function handleStatusToggle(item: ImplItem) {
    const nextStatus = STATUS_CYCLE[item.status];
    setUpdatingId(item.id);

    if (isDemoMode()) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: nextStatus } : i))
      );
      setUpdatingId(null);
      toast.success(`Marked as ${STATUS_OPTIONS.find((s) => s.value === nextStatus)?.label}`);
      return;
    }

    const res = await fetch("/api/progress", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: item.id, status: nextStatus }),
    });

    if (res.ok) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: nextStatus } : i))
      );
      toast.success(`Marked as ${STATUS_OPTIONS.find((s) => s.value === nextStatus)?.label}`);
    } else {
      toast.error("Failed to update status");
    }
    setUpdatingId(null);
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
      </div>
    );
  }

  const totalItems = items.length;
  const doneItems = items.filter((i) => i.status === "done").length;
  const inProgressItems = items.filter((i) => i.status === "in_progress").length;
  const totalTimeSaved = items
    .filter((i) => i.status === "done")
    .reduce((sum, i) => sum + (i.time_saved_hrs ?? 0), 0);

  const grouped: Record<ItemPriority, ImplItem[]> = {
    quick_win: items.filter((i) => i.priority === "quick_win"),
    medium: items.filter((i) => i.priority === "medium"),
    strategic: items.filter((i) => i.priority === "strategic"),
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <h1 className="text-foreground text-[28px] font-bold tracking-tight">Implementation Progress</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track your AI implementation roadmap — click the checkbox to cycle status
        </p>
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
              { label: "TOTAL ITEMS", value: totalItems, color: "hsl(var(--foreground))" },
              { label: "COMPLETED", value: doneItems, color: "hsl(var(--primary))" },
              { label: "IN PROGRESS", value: inProgressItems, color: "#F59E0B" },
              { label: "HOURS SAVED", value: `${totalTimeSaved}h`, color: "hsl(var(--foreground))" },
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
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${Math.round((doneItems / totalItems) * 100)}%` }}
                />
              </div>
              <p className="text-muted-foreground text-xs mt-3">
                Click the checkbox next to any item to mark it as In Progress or Done
              </p>
            </div>
          )}

          {/* Items by priority */}
          {(Object.entries(grouped) as [ItemPriority, ImplItem[]][]).map(([priority, groupItems]) => {
            if (!groupItems || groupItems.length === 0) return null;
            const groupDone = groupItems.filter((i) => i.status === "done").length;
            return (
              <div key={priority} className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: PRIORITY_COLOR[priority] }}
                  />
                  <h2 className="text-foreground font-semibold text-sm tracking-wide uppercase">{PRIORITY_LABEL[priority]}</h2>
                  <span className="text-muted-foreground text-xs font-mono ml-1">({groupItems.length})</span>
                  {groupDone > 0 && (
                    <span className="text-primary text-xs font-medium ml-auto">{groupDone}/{groupItems.length} done</span>
                  )}
                </div>

                <div className="bg-card border-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl overflow-hidden divide-y divide-border/10">
                  {groupItems.map((item) => {
                    const isUpdating = updatingId === item.id;
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center gap-4 px-6 py-4 transition-colors hover:bg-secondary/10 ${item.status === "done" ? "opacity-60" : ""}`}
                      >
                        {/* Clickable checkbox */}
                        <button
                          onClick={() => handleStatusToggle(item)}
                          disabled={isUpdating}
                          title={`Click to mark as: ${STATUS_OPTIONS.find((s) => s.value === STATUS_CYCLE[item.status])?.label}`}
                          className="w-5 h-5 rounded-md flex-shrink-0 border-2 flex items-center justify-center transition-all hover:scale-110 disabled:opacity-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40"
                          style={{
                            borderColor: item.status === "done"
                              ? "hsl(var(--primary))"
                              : item.status === "in_progress"
                              ? "#F59E0B"
                              : "hsl(var(--border))",
                            backgroundColor: item.status === "done"
                              ? "hsl(var(--primary))"
                              : item.status === "in_progress"
                              ? "rgba(245,158,11,0.15)"
                              : "transparent",
                          }}
                        >
                          {isUpdating ? (
                            <Loader2 className="w-3 h-3 animate-spin text-primary" />
                          ) : item.status === "done" ? (
                            <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 12 12">
                              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : item.status === "in_progress" ? (
                            <div className="w-2 h-2 rounded-sm bg-amber-500" />
                          ) : null}
                        </button>

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
                        <StatusBadge status={item.status} />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
