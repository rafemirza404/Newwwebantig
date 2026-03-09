"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Archive, RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { isDemoMode } from "~/lib/mock/mockData";

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

interface Session {
    id: string;
    business_name: string;
    status: string;
    mode: string | null;
    started_at: string;
    completed_at: string | null;
    question_count: number | null;
    archived_at: string | null;
}

interface Props {
    sessions: Session[];
    isAgency: boolean;
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

export default function AuditsClient({ sessions: initialSessions, isAgency }: Props) {
    const [sessions, setSessions] = useState<Session[]>(initialSessions);
    const [businessFilter, setBusinessFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [showArchived, setShowArchived] = useState(false);
    const [archivingId, setArchivingId] = useState<string | null>(null);

    const archivedCount = useMemo(() => sessions.filter(s => s.archived_at !== null).length, [sessions]);

    // Unique business names with counts (from active sessions only)
    const businessCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const s of sessions) {
            if (s.archived_at !== null) continue;
            counts[s.business_name] = (counts[s.business_name] ?? 0) + 1;
        }
        return counts;
    }, [sessions]);

    // Unique statuses present in active sessions
    const presentStatuses = useMemo(() => {
        const seen = new Set<string>();
        for (const s of sessions) {
            if (s.archived_at === null) seen.add(s.status);
        }
        return Array.from(seen);
    }, [sessions]);

    const visible = useMemo(() => {
        return sessions
            .filter(s => showArchived ? s.archived_at !== null : s.archived_at === null)
            .filter(s => businessFilter === "all" || s.business_name === businessFilter)
            .filter(s => statusFilter === "all" || s.status === statusFilter);
    }, [sessions, showArchived, businessFilter, statusFilter]);

    async function handleArchive(sessionId: string, isArchived: boolean) {
        if (isDemoMode()) {
            setSessions(prev => prev.map(s =>
                s.id === sessionId
                    ? { ...s, archived_at: isArchived ? null : new Date().toISOString() }
                    : s
            ));
            toast.success(isArchived ? "Audit restored (demo mode)" : "Audit archived (demo mode)");
            return;
        }

        setArchivingId(sessionId);
        try {
            const res = await fetch(`/api/audits/${sessionId}/archive`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: isArchived ? "restore" : "archive" }),
            });

            if (res.ok) {
                setSessions(prev => prev.map(s =>
                    s.id === sessionId
                        ? { ...s, archived_at: isArchived ? null : new Date().toISOString() }
                        : s
                ));
                toast.success(isArchived ? "Audit restored" : "Audit archived");
            } else {
                toast.error(isArchived ? "Failed to restore audit" : "Failed to archive audit");
            }
        } finally {
            setArchivingId(null);
        }
    }

    if (sessions.length === 0) {
        return (
            <div className="bg-card border-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl p-12 text-center">
                <p className="text-foreground font-medium mb-2">No audits yet</p>
                <p className="text-muted-foreground text-sm mb-6">
                    {isAgency
                        ? "No audits have been run for your workspace clients yet."
                        : "Start your first audit to get AI-powered business insights."}
                </p>
                <Link
                    href="/audit/new"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-full transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Start Audit
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filter bars — agency only */}
            {isAgency && (
                <div className="space-y-3">
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

                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                        <span className="text-xs text-muted-foreground flex-shrink-0 mr-1">Status:</span>
                        <FilterPill label="All" active={statusFilter === "all"} onClick={() => setStatusFilter("all")} />
                        {presentStatuses.map(status => (
                            <FilterPill
                                key={status}
                                label={STATUS_LABELS[status] ?? status}
                                active={statusFilter === status}
                                onClick={() => setStatusFilter(status)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Show Archived toggle */}
            <div className="flex items-center justify-between">
                {isAgency && (businessFilter !== "all" || statusFilter !== "all") ? (
                    <p className="text-xs text-muted-foreground">
                        Showing {visible.length} of {sessions.filter(s => s.archived_at === null).length} audits
                    </p>
                ) : <div />}

                {archivedCount > 0 && (
                    <button
                        onClick={() => {
                            setShowArchived(v => !v);
                            setBusinessFilter("all");
                            setStatusFilter("all");
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

            <div className="bg-card border-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl overflow-hidden">
                {visible.length === 0 ? (
                    <div className="p-10 text-center text-muted-foreground text-sm">
                        {showArchived
                            ? "No archived audits."
                            : "No audits match the selected filters."}
                    </div>
                ) : (
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
                            {visible.map(session => {
                                const isArchived = session.archived_at !== null;
                                const isProcessing = archivingId === session.id;
                                return (
                                    <tr
                                        key={session.id}
                                        className={`hover:bg-secondary/20 transition-colors group ${isArchived ? "opacity-60" : ""}`}
                                    >
                                        <td className="px-5 py-4 text-foreground text-sm font-medium">{session.business_name}</td>
                                        <td className="px-5 py-4">
                                            <span className={`text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1.5 rounded-full ${STATUS_STYLES[session.status] ?? "bg-secondary text-muted-foreground border border-border/50"}`}>
                                                {STATUS_LABELS[session.status] ?? session.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-muted-foreground text-sm">{session.question_count ?? 0}</td>
                                        <td className="px-5 py-4 text-muted-foreground text-sm">
                                            {new Date(session.started_at).toLocaleDateString("en-US")}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                {!isArchived && session.status === "in_progress" && (
                                                    <Link href={`/audit/${session.id}`} className="inline-flex items-center justify-center text-xs font-semibold px-3 py-1.5 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors">
                                                        Resume
                                                    </Link>
                                                )}
                                                {!isArchived && session.status === "processing" && (
                                                    <Link href={`/audit/${session.id}/complete`} className="inline-flex items-center justify-center text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors">
                                                        View Progress
                                                    </Link>
                                                )}
                                                {!isArchived && session.status === "complete" && (
                                                    <Link href="/dashboard/reports" className="inline-flex items-center justify-center text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                                                        View Report
                                                    </Link>
                                                )}
                                                {isArchived ? (
                                                    <button
                                                        onClick={() => handleArchive(session.id, true)}
                                                        disabled={isProcessing}
                                                        title="Restore audit"
                                                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                                                    >
                                                        {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                                                        Restore
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleArchive(session.id, false)}
                                                        disabled={isProcessing}
                                                        title="Archive audit"
                                                        className="w-7 h-7 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 opacity-0 group-hover:opacity-100"
                                                    >
                                                        {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Archive className="w-3.5 h-3.5" />}
                                                    </button>
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
        </div>
    );
}
