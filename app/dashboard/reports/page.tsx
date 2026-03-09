"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Archive, Check, X, Loader2, RotateCcw } from "lucide-react";
import { createSupabaseClient } from "~/lib/supabase/client";
import { toast } from "sonner";
import { isDemoMode, DEMO_REPORTS } from "~/lib/mock/mockData";

interface Report {
  id: string;
  overall_score: number | null;
  created_at: string;
  archived_at: string | null;
  audit_sessions: { id: string; business_name: string; industry: string | null } | null;
}

function getScoreColor(score: number | null) {
  if (score === null) return "text-muted-foreground";
  if (score >= 70) return "text-primary";
  if (score >= 40) return "text-amber-500";
  return "text-destructive";
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
      }`}
    >
      {label}
    </button>
  );
}

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [isAgency, setIsAgency] = useState(false);
  const [businessFilter, setBusinessFilter] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (isDemoMode()) {
      const viewMode = document.cookie.split(";").find(c => c.trim().startsWith("view_mode="))?.split("=")[1]?.trim();
      setIsAgency(viewMode === "agency_owner");
      const mapped = DEMO_REPORTS.map((r: any) => ({
        id: r.id,
        overall_score: r.overall_score,
        created_at: r.created_at,
        archived_at: r.archived_at ?? null,
        audit_sessions: Array.isArray(r.audit_sessions) ? r.audit_sessions[0] : r.audit_sessions,
      }));
      setReports(mapped);
      setLoading(false);
      return;
    }

    (async () => {
      const supabase = createSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login?redirectTo=/dashboard/reports"); return; }

      // Respect view_mode cookie for data isolation
      const viewMode = document.cookie.split(";").find(c => c.trim().startsWith("view_mode="))?.split("=")[1]?.trim();
      const agencyMode = viewMode === "agency_owner";
      setIsAgency(agencyMode);
      const isAgency = agencyMode;

      let data: any[] = [];

      if (isAgency) {
        const { data: workspace } = await supabase
          .from("workspaces")
          .select("id")
          .eq("owner_id", user.id)
          .maybeSingle();

        if (workspace) {
          const { data: sessions } = await supabase
            .from("audit_sessions")
            .select("id")
            .eq("workspace_id", workspace.id);

          const sessionIds = (sessions ?? []).map((s: any) => s.id);

          if (sessionIds.length > 0) {
            const { data: rpts } = await supabase
              .from("reports")
              .select(`id, overall_score, created_at, archived_at, audit_sessions (id, business_name, industry)`)
              .in("session_id", sessionIds)
              .order("created_at", { ascending: false });
            data = rpts ?? [];
          }
        }
      } else {
        // Direct mode: only sessions NOT linked to a workspace (exclude agency client audits)
        const { data: directSessions } = await supabase
          .from("audit_sessions")
          .select("id")
          .eq("user_id", user.id)
          .is("workspace_id", null);

        const directSessionIds = (directSessions ?? []).map((s: any) => s.id);

        if (directSessionIds.length > 0) {
          const { data: rpts } = await supabase
            .from("reports")
            .select(`id, overall_score, created_at, archived_at, audit_sessions (id, business_name, industry)`)
            .in("session_id", directSessionIds)
            .order("created_at", { ascending: false });
          data = rpts ?? [];
        }
      }

      const mapped = data.map((r: any) => ({
        ...r,
        audit_sessions: Array.isArray(r.audit_sessions) ? r.audit_sessions[0] : r.audit_sessions,
      }));
      setReports(mapped);
      setLoading(false);
    })();
  }, []);

  async function handleRename(reportId: string) {
    const name = renameValue.trim();
    if (!name) { setRenamingId(null); return; }

    if (isDemoMode()) {
      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId
            ? { ...r, audit_sessions: r.audit_sessions ? { ...r.audit_sessions, business_name: name } : null }
            : r
        )
      );
      setRenamingId(null);
      toast.success("Report renamed (demo mode)");
      return;
    }

    const res = await fetch("/api/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId, name }),
    });

    if (res.ok) {
      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId
            ? { ...r, audit_sessions: r.audit_sessions ? { ...r.audit_sessions, business_name: name } : null }
            : r
        )
      );
      toast.success("Report renamed");
    } else {
      toast.error("Failed to rename report");
    }
    setRenamingId(null);
  }

  async function handleDelete(reportId: string, action: "delete" | "archive") {
    setDeletingId(reportId);

    if (isDemoMode()) {
      if (action === "delete") {
        setReports((prev) => prev.filter((r) => r.id !== reportId));
      } else {
        setReports((prev) => prev.map((r) =>
          r.id === reportId ? { ...r, archived_at: new Date().toISOString() } : r
        ));
      }
      setDeletingId(null);
      toast.success(`Report ${action === "archive" ? "archived" : "deleted"} (demo mode)`);
      return;
    }

    const res = await fetch("/api/reports", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId, action }),
    });

    if (res.ok) {
      if (action === "delete") {
        setReports((prev) => prev.filter((r) => r.id !== reportId));
      } else {
        setReports((prev) => prev.map((r) =>
          r.id === reportId ? { ...r, archived_at: new Date().toISOString() } : r
        ));
      }
      toast.success(`Report ${action === "archive" ? "archived" : "deleted"}`);
    } else {
      toast.error(`Failed to ${action} report`);
    }
    setDeletingId(null);
  }

  async function handleRestore(reportId: string) {
    setDeletingId(reportId);

    if (isDemoMode()) {
      setReports((prev) => prev.map((r) =>
        r.id === reportId ? { ...r, archived_at: null } : r
      ));
      setDeletingId(null);
      toast.success("Report restored (demo mode)");
      return;
    }

    const res = await fetch("/api/reports", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId, action: "restore" }),
    });

    if (res.ok) {
      setReports((prev) => prev.map((r) =>
        r.id === reportId ? { ...r, archived_at: null } : r
      ));
      toast.success("Report restored");
    } else {
      toast.error("Failed to restore report");
    }
    setDeletingId(null);
  }

  const archivedCount = useMemo(() => reports.filter(r => r.archived_at !== null).length, [reports]);

  // Business name counts for filter pills (active reports only)
  const businessCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of reports) {
      if (r.archived_at !== null) continue;
      const name = r.audit_sessions?.business_name;
      if (name) counts[name] = (counts[name] ?? 0) + 1;
    }
    return counts;
  }, [reports]);

  const filteredReports = useMemo(() => {
    return reports
      .filter(r => showArchived ? r.archived_at !== null : r.archived_at === null)
      .filter(r => businessFilter === "all" || r.audit_sessions?.business_name === businessFilter);
  }, [reports, showArchived, businessFilter]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-foreground text-[28px] font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground text-sm mt-1">{reports.length} reports generated</p>
        </div>
      </div>

      {/* Filter row */}
      {reports.length > 0 && (
        <div className="mb-5 space-y-2">
          {/* Business filter — agency only */}
          {isAgency && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs text-muted-foreground flex-shrink-0 mr-1">Client:</span>
              <FilterPill label="All" active={businessFilter === "all"} onClick={() => setBusinessFilter("all")} />
              {Object.entries(businessCounts).map(([name, count]) => (
                <FilterPill
                  key={name}
                  label={`${name} (${count})`}
                  active={businessFilter === name}
                  onClick={() => setBusinessFilter(name)}
                />
              ))}
            </div>
          )}

          {/* Show Archived toggle + result count */}
          <div className="flex items-center justify-between">
            {businessFilter !== "all" ? (
              <p className="text-xs text-muted-foreground">
                Showing {filteredReports.length} of {reports.filter(r => r.archived_at === null).length} reports
              </p>
            ) : <div />}

            {archivedCount > 0 && (
              <button
                onClick={() => {
                  setShowArchived(v => !v);
                  setBusinessFilter("all");
                }}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                  showArchived
                    ? "bg-primary/10 text-primary"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                <Archive className="w-3.5 h-3.5" />
                {showArchived ? "Hide Archived" : `Show Archived (${archivedCount})`}
              </button>
            )}
          </div>
        </div>
      )}

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
          {filteredReports.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground text-sm">
              No reports match the selected filter.
            </div>
          ) : (
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
              {filteredReports.map((report) => {
                const session = report.audit_sessions;
                const isRenaming = renamingId === report.id;
                const isDeleting = deletingId === report.id;
                const isArchived = report.archived_at !== null;
                return (
                  <tr key={report.id} className={`hover:bg-secondary/20 transition-colors group ${isArchived ? "opacity-60" : ""}`}>
                    <td className="px-5 py-4 text-foreground text-sm font-medium">
                      {isRenaming ? (
                        <div className="flex items-center gap-2">
                          <input
                            autoFocus
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleRename(report.id);
                              if (e.key === "Escape") setRenamingId(null);
                            }}
                            className="bg-secondary border border-primary/40 text-foreground rounded-lg px-2 py-1 text-sm w-40 focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                          <button onClick={() => handleRename(report.id)} className="text-primary hover:text-primary/80">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => setRenamingId(null)} className="text-muted-foreground hover:text-foreground">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        session?.business_name ?? "Unknown"
                      )}
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
                      <div className="flex items-center justify-end gap-2">
                        {isArchived ? (
                          /* Archived: show Restore + Delete only */
                          <>
                            <button
                              onClick={() => handleRestore(report.id)}
                              disabled={isDeleting}
                              title="Restore report"
                              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                            >
                              {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                              Restore
                            </button>
                            <button
                              onClick={() => {
                                if (confirm("Permanently delete this report?")) {
                                  handleDelete(report.id, "delete");
                                }
                              }}
                              disabled={isDeleting}
                              title="Delete permanently"
                              className="w-8 h-8 rounded-lg bg-secondary hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          /* Active: Rename, Archive, Delete, View */
                          <>
                            <button
                              onClick={() => {
                                setRenamingId(report.id);
                                setRenameValue(session?.business_name ?? "");
                              }}
                              title="Rename report"
                              className="w-8 h-8 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(report.id, "archive")}
                              disabled={isDeleting}
                              title="Archive report"
                              className="w-8 h-8 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 opacity-0 group-hover:opacity-100"
                            >
                              {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Archive className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => {
                                if (confirm("Permanently delete this report?")) {
                                  handleDelete(report.id, "delete");
                                }
                              }}
                              disabled={isDeleting}
                              title="Delete permanently"
                              className="w-8 h-8 rounded-lg bg-secondary hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50 opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <Link
                              href={`/report/${report.id}`}
                              className="inline-flex items-center justify-center text-xs font-semibold px-3 py-1.5 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
                            >
                              View →
                            </Link>
                          </>
                        )}
                      </div>
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
