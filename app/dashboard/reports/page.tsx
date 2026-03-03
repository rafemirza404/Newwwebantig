"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Archive, Check, X, Loader2 } from "lucide-react";
import { createSupabaseClient } from "~/lib/supabase/client";
import { toast } from "sonner";
import { isDemoMode, DEMO_REPORTS } from "~/lib/mock/mockData";

interface Report {
  id: string;
  overall_score: number | null;
  created_at: string;
  audit_sessions: { id: string; business_name: string; industry: string | null } | null;
}

function getScoreColor(score: number | null) {
  if (score === null) return "text-muted-foreground";
  if (score >= 70) return "text-primary";
  if (score >= 40) return "text-amber-500";
  return "text-destructive";
}

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (isDemoMode()) {
      const mapped = DEMO_REPORTS.map((r: any) => ({
        id: r.id,
        overall_score: r.overall_score,
        created_at: r.created_at,
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
      const isAgency = viewMode === "agency_owner";

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
              .select(`id, overall_score, created_at, audit_sessions (id, business_name, industry)`)
              .in("session_id", sessionIds)
              .order("created_at", { ascending: false });
            data = rpts ?? [];
          }
        }
      } else {
        const { data: rpts } = await supabase
          .from("reports")
          .select(`id, overall_score, created_at, audit_sessions (id, business_name, industry)`)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        data = rpts ?? [];
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
      setReports((prev) => prev.filter((r) => r.id !== reportId));
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
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      toast.success(`Report ${action === "archive" ? "archived" : "deleted"}`);
    } else {
      toast.error(`Failed to ${action} report`);
    }
    setDeletingId(null);
  }

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
              {reports.map((report) => {
                const session = report.audit_sessions;
                const isRenaming = renamingId === report.id;
                const isDeleting = deletingId === report.id;
                return (
                  <tr key={report.id} className="hover:bg-secondary/20 transition-colors group">
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
                        {/* Rename */}
                        <button
                          onClick={() => {
                            setRenamingId(report.id);
                            setRenameValue(session?.business_name ?? "");
                          }}
                          title="Rename report"
                          className="w-8 h-8 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {/* Archive */}
                        <button
                          onClick={() => handleDelete(report.id, "archive")}
                          disabled={isDeleting}
                          title="Archive report"
                          className="w-8 h-8 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                        >
                          {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Archive className="w-3.5 h-3.5" />}
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => {
                            if (confirm("Delete this report permanently?")) {
                              handleDelete(report.id, "delete");
                            }
                          }}
                          disabled={isDeleting}
                          title="Delete report"
                          className="w-8 h-8 rounded-lg bg-secondary hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        {/* View */}
                        <Link
                          href={`/report/${report.id}`}
                          className="inline-flex items-center justify-center text-xs font-semibold px-3 py-1.5 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
                        >
                          View →
                        </Link>
                      </div>
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
