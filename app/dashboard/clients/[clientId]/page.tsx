import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "~/lib/supabase/server";
import { isDemoMode, DEMO_CLIENTS, DEMO_AGENCY_AUDITS, DEMO_REPORTS } from "~/lib/mock/mockData";
import Link from "next/link";
import {
    ArrowLeft, Mail, Building, Plus, ClipboardList,
    FileText, BarChart3, LayoutDashboard, ArrowUpRight, Clock, Pencil,
} from "lucide-react";
import { InviteButton } from "~/components/dashboard/clients/InviteButton";
import { SendReminderButton } from "~/components/dashboard/clients/SendReminderButton";

const STATUS_STYLES: Record<string, string> = {
    in_progress: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
    processing: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
    complete: "bg-primary/10 text-primary border border-primary/20",
    abandoned: "bg-secondary text-muted-foreground border border-border/50",
};

const STATUS_LABELS: Record<string, string> = {
    in_progress: "In Progress",
    processing: "Processing",
    complete: "Complete",
    abandoned: "Abandoned",
};

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

function scoreColor(score: number | null) {
    if (score === null || score === undefined) return "text-muted-foreground";
    if (score >= 70) return "text-primary";
    if (score >= 40) return "text-amber-500";
    return "text-destructive";
}

function scoreBg(score: number | null) {
    if (score === null || score === undefined) return "bg-secondary";
    if (score >= 70) return "bg-primary";
    if (score >= 40) return "bg-amber-500";
    return "bg-destructive";
}

export default async function ClientDetailPage({
    params,
    searchParams,
}: {
    params: { clientId: string };
    searchParams: { tab?: string };
}) {
    const tab = searchParams.tab ?? "overview";

    let client: any = null;
    let audits: any[] = [];
    let reports: any[] = [];
    let latestInvite: { accepted_at: string | null } | null = null;

    if (isDemoMode()) {
        client = DEMO_CLIENTS.find((c) => c.id === params.clientId) ?? null;
        if (client) {
            audits = DEMO_AGENCY_AUDITS.filter((a) => a.business_name === client.business_name);
            reports = DEMO_REPORTS
                .filter((r) => {
                    const s = Array.isArray(r.audit_sessions) ? r.audit_sessions[0] : r.audit_sessions;
                    return s?.business_name === client.business_name;
                })
                .map((r) => ({
                    ...r,
                    audit_sessions: Array.isArray(r.audit_sessions) ? r.audit_sessions[0] : r.audit_sessions,
                }));
        }
    } else {
        const supabase = createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) redirect("/login?redirectTo=/dashboard/clients");

        const { data: clientData } = await supabase
            .from("clients")
            .select("*")
            .eq("id", params.clientId)
            .single();
        client = clientData;

        if (client) {
            const { data: auditData } = await supabase
                .from("audit_sessions")
                .select("id, business_name, status, started_at, completed_at, question_count, mode")
                .eq("client_id", params.clientId)
                .order("started_at", { ascending: false });
            audits = auditData ?? [];

            const auditIds = audits.map((a) => a.id);
            if (auditIds.length > 0) {
                const { data: reportData } = await supabase
                    .from("reports")
                    .select("id, overall_score, function_scores, created_at, audit_sessions(id, business_name, industry)")
                    .in("session_id", auditIds)
                    .order("created_at", { ascending: false });
                reports = (reportData ?? []).map((r: any) => ({
                    ...r,
                    audit_sessions: Array.isArray(r.audit_sessions) ? r.audit_sessions[0] : r.audit_sessions,
                }));
            }

            // Fetch latest invite for portal status
            const { data: inviteData } = await supabase
                .from("client_invites")
                .select("accepted_at")
                .eq("client_id", params.clientId)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();
            latestInvite = inviteData;
        }
    }

    if (!client) {
        return (
            <div className="p-8 max-w-[1400px] mx-auto flex flex-col items-center justify-center min-h-[50vh]">
                <h1 className="text-2xl text-foreground font-bold mb-4">Client Not Found</h1>
                <Link href="/dashboard/clients" className="px-5 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-semibold">
                    Back to Clients
                </Link>
            </div>
        );
    }

    const latestReport = reports[0] ?? null;
    const completedAudits = audits.filter((a) => a.status === "complete").length;

    // Build report lookup: auditId → reportId for linking from Audits tab
    const reportByAuditId: Record<string, string> = {};
    for (const r of reports) {
        if (r.audit_sessions?.id) reportByAuditId[r.audit_sessions.id] = r.id;
    }

    // Average function scores across all reports
    const avgFunctionScores: Record<string, number> = {};
    if (reports.length > 0) {
        for (const key of Object.keys(FUNCTION_LABELS)) {
            const vals = reports
                .map((r) => r.function_scores?.[key])
                .filter((v): v is number => v != null);
            if (vals.length > 0) {
                avgFunctionScores[key] = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
            }
        }
    }

    const TABS = [
        { id: "overview", label: "Overview", icon: LayoutDashboard },
        { id: "audits", label: "Audits", icon: ClipboardList },
        { id: "reports", label: "Reports", icon: FileText },
        { id: "analytics", label: "Analytics", icon: BarChart3 },
    ];

    return (
        <div className="p-6 max-w-[1400px] mx-auto">
            {/* Back */}
            <Link
                href="/dashboard/clients"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Clients
            </Link>

            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h1 className="text-foreground text-[32px] font-bold tracking-tight">{client.business_name}</h1>
                    <p className="text-primary text-sm font-medium mt-1 capitalize">{client.industry ?? "No industry"}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                    {!isDemoMode() && (
                        client.client_user_id ? (
                            <SendReminderButton clientId={client.id} />
                        ) : (
                            <InviteButton
                                clientId={client.id}
                                hasPortalAccess={false}
                                hasInvite={!!latestInvite}
                            />
                        )
                    )}
                    <Link
                        href={`/dashboard/clients/${params.clientId}/edit`}
                        className="flex items-center gap-2 px-4 py-2.5 border border-border/50 text-muted-foreground hover:text-foreground hover:bg-secondary text-sm font-semibold rounded-full transition-colors"
                    >
                        <Pencil className="w-4 h-4" /> Edit
                    </Link>
                    <Link
                        href={`/audit/agency/new?clientId=${client.id}`}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-full transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" /> New Audit
                    </Link>
                </div>
            </div>

            {/* Tab nav */}
            <div className="flex items-center gap-1 border-b border-border/10 mb-8">
                {TABS.map(({ id, label, icon: Icon }) => (
                    <Link
                        key={id}
                        href={`/dashboard/clients/${params.clientId}?tab=${id}`}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                            tab === id
                                ? "border-primary text-foreground"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <Icon className="w-4 h-4" />
                        {label}
                    </Link>
                ))}
            </div>

            {/* ── OVERVIEW ── */}
            {tab === "overview" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Client Info */}
                    <div className="bg-card border border-border/10 rounded-2xl p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-5">Client Info</h3>
                        <div className="space-y-4">
                            {client.contact_email && (
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                                        <p className="text-sm text-foreground font-medium">{client.contact_email}</p>
                                    </div>
                                </div>
                            )}
                            {client.company_size && (
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                                        <Building className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-0.5">Company Size</p>
                                        <p className="text-sm text-foreground font-medium">{client.company_size}</p>
                                    </div>
                                </div>
                            )}
                            <div className="pt-4 border-t border-border/10 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Total Audits</p>
                                    <p className="text-2xl font-bold text-foreground">{audits.length}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Completed</p>
                                    <p className="text-2xl font-bold text-primary">{completedAudits}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Latest Score */}
                    <div className="bg-card border border-border/10 rounded-2xl p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] flex flex-col">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-5">Latest Score</h3>
                        {latestReport ? (
                            <div className="flex flex-col items-center justify-center flex-1 py-4">
                                <div className={`text-6xl font-bold mb-2 ${scoreColor(latestReport.overall_score)}`}>
                                    {latestReport.overall_score ?? "—"}
                                </div>
                                <p className="text-muted-foreground text-sm">out of 100</p>
                                <p className="text-xs text-muted-foreground mt-4">
                                    Generated{" "}
                                    {new Date(latestReport.created_at).toLocaleDateString("en-US", {
                                        month: "short", day: "numeric", year: "numeric",
                                    })}
                                </p>
                                <Link
                                    href={`/report/${latestReport.id}`}
                                    className="mt-4 text-xs text-primary hover:underline flex items-center gap-1"
                                >
                                    View Report <ArrowUpRight className="w-3 h-3" />
                                </Link>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground">
                                <FileText className="w-8 h-8 mb-3 opacity-20" />
                                <p className="text-sm">No reports yet</p>
                            </div>
                        )}
                    </div>

                    {/* Recent Audits */}
                    <div className="bg-card border border-border/10 rounded-2xl p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-5">Recent Audits</h3>
                        {audits.length > 0 ? (
                            <div className="space-y-2">
                                {audits.slice(0, 5).map((audit) => (
                                    <div key={audit.id} className="flex items-center justify-between py-2 border-b border-border/5 last:border-0">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(audit.started_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                            </span>
                                        </div>
                                        <span className={`text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full ${STATUS_STYLES[audit.status] ?? ""}`}>
                                            {STATUS_LABELS[audit.status] ?? audit.status}
                                        </span>
                                    </div>
                                ))}
                                {audits.length > 5 && (
                                    <Link
                                        href={`/dashboard/clients/${params.clientId}?tab=audits`}
                                        className="text-xs text-muted-foreground hover:text-foreground pt-2 block text-center"
                                    >
                                        +{audits.length - 5} more
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
                                <ClipboardList className="w-8 h-8 mb-3 opacity-20" />
                                <p className="text-sm">No audits yet</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── AUDITS ── */}
            {tab === "audits" && (
                <div className="bg-card border border-border/10 rounded-2xl overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                    {audits.length === 0 ? (
                        <div className="p-12 text-center">
                            <ClipboardList className="w-8 h-8 text-muted-foreground opacity-20 mx-auto mb-3" />
                            <p className="text-foreground font-medium mb-1">No audits yet</p>
                            <p className="text-muted-foreground text-sm mb-5">Run the first audit for this client.</p>
                            <Link
                                href={`/audit/agency/new?clientId=${client.id}`}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-full transition-colors"
                            >
                                <Plus className="w-4 h-4" /> New Audit
                            </Link>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-muted-foreground text-xs uppercase tracking-wide border-b border-border/10 bg-secondary/20">
                                    <th className="font-medium px-5 py-4">Started</th>
                                    <th className="font-medium px-5 py-4">Status</th>
                                    <th className="font-medium px-5 py-4">Questions</th>
                                    <th className="font-medium px-5 py-4">Completed</th>
                                    <th className="font-medium px-5 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/10">
                                {audits.map((audit) => (
                                    <tr key={audit.id} className="hover:bg-secondary/20 transition-colors">
                                        <td className="px-5 py-4 text-sm text-foreground">
                                            {new Date(audit.started_at).toLocaleDateString("en-US", {
                                                month: "short", day: "numeric", year: "numeric",
                                            })}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full ${STATUS_STYLES[audit.status] ?? "bg-secondary text-muted-foreground"}`}>
                                                {STATUS_LABELS[audit.status] ?? audit.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-muted-foreground">{audit.question_count ?? 0}</td>
                                        <td className="px-5 py-4 text-sm text-muted-foreground">
                                            {audit.completed_at
                                                ? new Date(audit.completed_at).toLocaleDateString("en-US", {
                                                    month: "short", day: "numeric", year: "numeric",
                                                })
                                                : "—"}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            {audit.status === "in_progress" && (
                                                <Link href={`/audit/${audit.id}`} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors">
                                                    Resume
                                                </Link>
                                            )}
                                            {audit.status === "complete" && reportByAuditId[audit.id] && (
                                                <Link href={`/report/${reportByAuditId[audit.id]}`} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                                                    View Report
                                                </Link>
                                            )}
                                            {audit.status === "complete" && !reportByAuditId[audit.id] && (
                                                <Link href="/dashboard/reports" className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                                                    Reports
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* ── REPORTS ── */}
            {tab === "reports" && (
                <div className="bg-card border border-border/10 rounded-2xl overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                    {reports.length === 0 ? (
                        <div className="p-12 text-center">
                            <FileText className="w-8 h-8 text-muted-foreground opacity-20 mx-auto mb-3" />
                            <p className="text-foreground font-medium mb-1">No reports yet</p>
                            <p className="text-muted-foreground text-sm">Complete an audit to generate a report.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-muted-foreground text-xs uppercase tracking-wide border-b border-border/10 bg-secondary/20">
                                    <th className="font-medium px-5 py-4">Generated</th>
                                    <th className="font-medium px-5 py-4">Score</th>
                                    <th className="font-medium px-5 py-4">Industry</th>
                                    <th className="font-medium px-5 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/10">
                                {reports.map((report) => (
                                    <tr key={report.id} className="hover:bg-secondary/20 transition-colors">
                                        <td className="px-5 py-4 text-sm text-foreground">
                                            {new Date(report.created_at).toLocaleDateString("en-US", {
                                                month: "short", day: "numeric", year: "numeric",
                                            })}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`text-sm font-bold ${scoreColor(report.overall_score)}`}>
                                                {report.overall_score !== null ? `${report.overall_score}/100` : "—"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-muted-foreground capitalize">
                                            {report.audit_sessions?.industry ?? "—"}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <Link
                                                href={`/report/${report.id}`}
                                                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
                                            >
                                                View →
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* ── ANALYTICS ── */}
            {tab === "analytics" && (
                <div className="space-y-6">
                    {Object.keys(avgFunctionScores).length === 0 ? (
                        <div className="bg-card border border-border/10 rounded-2xl p-12 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                            <BarChart3 className="w-8 h-8 text-muted-foreground opacity-20 mx-auto mb-3" />
                            <p className="text-foreground font-medium mb-1">No analytics yet</p>
                            <p className="text-muted-foreground text-sm">Complete an audit to see function-level scoring.</p>
                        </div>
                    ) : (
                        <>
                            {/* Function Scores Bar Chart */}
                            <div className="bg-card border border-border/10 rounded-2xl p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                                <h3 className="text-sm font-semibold text-foreground mb-1">Function Scores</h3>
                                <p className="text-xs text-muted-foreground mb-6">
                                    Average across {reports.length} report{reports.length > 1 ? "s" : ""}
                                </p>
                                <div className="space-y-4">
                                    {Object.entries(avgFunctionScores)
                                        .sort(([, a], [, b]) => b - a)
                                        .map(([key, score]) => (
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
                                        ))}
                                </div>
                            </div>

                            {/* Score History (only if multiple reports) */}
                            {reports.length > 1 && (
                                <div className="bg-card border border-border/10 rounded-2xl p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                                    <h3 className="text-sm font-semibold text-foreground mb-4">Score History</h3>
                                    <div className="space-y-3">
                                        {reports.map((r) => (
                                            <div key={r.id} className="flex items-center gap-4">
                                                <span className="text-xs text-muted-foreground w-28 flex-shrink-0">
                                                    {new Date(r.created_at).toLocaleDateString("en-US", {
                                                        month: "short", day: "numeric", year: "2-digit",
                                                    })}
                                                </span>
                                                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${scoreBg(r.overall_score)}`}
                                                        style={{ width: `${r.overall_score ?? 0}%` }}
                                                    />
                                                </div>
                                                <span className={`text-sm font-bold w-12 text-right flex-shrink-0 ${scoreColor(r.overall_score)}`}>
                                                    {r.overall_score ?? "—"}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
