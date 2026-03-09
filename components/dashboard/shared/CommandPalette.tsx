"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "~/lib/supabase/client";
import { isDemoMode, DEMO_AUDITS, DEMO_CLIENTS } from "~/lib/mock/mockData";
import {
    Search,
    LayoutDashboard,
    Settings,
    CreditCard,
    TrendingUp,
    BarChart3,
    ClipboardList,
    FileText,
    Users,
} from "lucide-react";

const DIRECT_PAGES = [
    { id: "dashboard", label: "Dashboard", href: "/dashboard", Icon: LayoutDashboard },
    { id: "audits", label: "My Audits", href: "/dashboard/audits", Icon: ClipboardList },
    { id: "reports", label: "My Reports", href: "/dashboard/reports", Icon: FileText },
    { id: "progress", label: "Progress", href: "/dashboard/progress", Icon: TrendingUp },
    { id: "analytics", label: "My Score", href: "/dashboard/analytics", Icon: BarChart3 },
    { id: "settings", label: "Settings", href: "/dashboard/settings", Icon: Settings },
    { id: "billing", label: "Billing", href: "/dashboard/billing", Icon: CreditCard },
];

const AGENCY_PAGES = [
    { id: "dashboard", label: "Dashboard", href: "/dashboard", Icon: LayoutDashboard },
    { id: "clients", label: "Clients", href: "/dashboard/clients", Icon: Users },
    { id: "audits", label: "Audits", href: "/dashboard/audits", Icon: ClipboardList },
    { id: "reports", label: "Reports", href: "/dashboard/reports", Icon: FileText },
    { id: "analytics", label: "Analytics", href: "/dashboard/analytics", Icon: BarChart3 },
    { id: "settings", label: "Settings", href: "/dashboard/settings", Icon: Settings },
    { id: "billing", label: "Billing", href: "/dashboard/billing", Icon: CreditCard },
];

const GROUP_CLS =
    "[&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1";

const ITEM_CLS =
    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground cursor-pointer data-[selected=true]:bg-secondary data-[selected=true]:text-foreground transition-colors";

interface CommandPaletteProps {
    isAgency?: boolean;
}

export function CommandPalette({ isAgency = false }: CommandPaletteProps) {
    const [open, setOpen] = useState(false);
    const [audits, setAudits] = useState<{ id: string; label: string; href: string }[]>([]);
    const [reports, setReports] = useState<{ id: string; label: string; href: string }[]>([]);
    const [clients, setClients] = useState<{ id: string; label: string; href: string }[]>([]);
    const router = useRouter();

    // Cmd+K / Ctrl+K to toggle, Escape to close
    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setOpen((v) => !v);
            }
            if (e.key === "Escape") {
                setOpen(false);
            }
        }
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, []);

    // Custom event fired by sidebar/header buttons
    useEffect(() => {
        function onOpen() { setOpen(true); }
        window.addEventListener("open-command-palette", onOpen);
        return () => window.removeEventListener("open-command-palette", onOpen);
    }, []);

    // Lazy-fetch data when palette opens
    useEffect(() => {
        if (!open) return;

        if (isDemoMode()) {
            const allAudits = DEMO_AUDITS as any[];
            setAudits(
                allAudits
                    .filter((a) => a.status !== "complete")
                    .slice(0, 8)
                    .map((a) => ({ id: a.id, label: a.business_name || "Untitled", href: `/audit/${a.id}` }))
            );
            setReports(
                allAudits
                    .filter((a) => a.status === "complete")
                    .slice(0, 5)
                    .map((a) => ({ id: a.id, label: a.business_name || "Report", href: "/dashboard/reports" }))
            );
            if (isAgency) {
                setClients(
                    (DEMO_CLIENTS as any[]).slice(0, 6).map((c) => ({
                        id: c.id,
                        label: c.business_name,
                        href: `/dashboard/clients/${c.id}`,
                    }))
                );
            }
            return;
        }

        (async () => {
            const supabase = createSupabaseClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const [{ data: sessions }, { data: reportRows }] = await Promise.all([
                supabase
                    .from("audit_sessions")
                    .select("id, business_name, status")
                    .eq("user_id", user.id)
                    .neq("status", "complete")
                    .order("started_at", { ascending: false })
                    .limit(10),
                supabase
                    .from("reports")
                    .select("id, audit_sessions(business_name)")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false })
                    .limit(10),
            ]);

            setAudits(
                (sessions ?? []).map((s: any) => ({
                    id: s.id,
                    label: s.business_name || "Untitled Audit",
                    href: `/audit/${s.id}`,
                }))
            );

            setReports(
                (reportRows ?? []).map((r: any) => ({
                    id: r.id,
                    label: (r.audit_sessions as any)?.business_name || "Report",
                    href: `/report/${r.id}`,
                }))
            );

            if (isAgency) {
                const { data: clientData } = await supabase
                    .from("clients")
                    .select("id, business_name")
                    .order("created_at", { ascending: false })
                    .limit(10);
                setClients(
                    (clientData ?? []).map((c: any) => ({
                        id: c.id,
                        label: c.business_name,
                        href: `/dashboard/clients/${c.id}`,
                    }))
                );
            }
        })();
    }, [open, isAgency]);

    function navigate(href: string) {
        setOpen(false);
        router.push(href);
    }

    const pages = isAgency ? AGENCY_PAGES : DIRECT_PAGES;

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Command palette">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setOpen(false)}
            />

            {/* Palette panel */}
            <div className="fixed left-1/2 top-[28%] -translate-x-1/2 -translate-y-1/2 w-full max-w-xl px-4">
                <Command
                    className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
                    loop
                >
                    {/* Input row */}
                    <div className="flex items-center gap-3 px-4 border-b border-border">
                        <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <Command.Input
                            autoFocus
                            placeholder="Search pages, audits, reports..."
                            className="flex-1 py-4 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none border-none"
                        />
                        <span className="text-[10px] text-muted-foreground bg-secondary rounded px-1.5 py-0.5 font-medium flex-shrink-0">
                            ESC
                        </span>
                    </div>

                    <Command.List className="max-h-80 overflow-y-auto p-2">
                        <Command.Empty className="text-center text-sm text-muted-foreground py-8">
                            No results found.
                        </Command.Empty>

                        {/* Pages */}
                        <Command.Group heading="Pages" className={GROUP_CLS}>
                            {pages.map(({ id, label, href, Icon }) => (
                                <Command.Item
                                    key={id}
                                    value={label}
                                    onSelect={() => navigate(href)}
                                    className={ITEM_CLS}
                                >
                                    <Icon className="w-4 h-4 flex-shrink-0" />
                                    {label}
                                </Command.Item>
                            ))}
                        </Command.Group>

                        {/* Audits */}
                        {audits.length > 0 && (
                            <Command.Group heading="Audits" className={GROUP_CLS}>
                                {audits.map((a) => (
                                    <Command.Item
                                        key={a.id}
                                        value={a.label}
                                        onSelect={() => navigate(a.href)}
                                        className={ITEM_CLS}
                                    >
                                        <ClipboardList className="w-4 h-4 flex-shrink-0" />
                                        {a.label}
                                    </Command.Item>
                                ))}
                            </Command.Group>
                        )}

                        {/* Reports */}
                        {reports.length > 0 && (
                            <Command.Group heading="Reports" className={GROUP_CLS}>
                                {reports.map((r) => (
                                    <Command.Item
                                        key={r.id}
                                        value={r.label}
                                        onSelect={() => navigate(r.href)}
                                        className={ITEM_CLS}
                                    >
                                        <FileText className="w-4 h-4 flex-shrink-0" />
                                        {r.label}
                                    </Command.Item>
                                ))}
                            </Command.Group>
                        )}

                        {/* Clients — agency mode only */}
                        {isAgency && clients.length > 0 && (
                            <Command.Group heading="Clients" className={GROUP_CLS}>
                                {clients.map((c) => (
                                    <Command.Item
                                        key={c.id}
                                        value={c.label}
                                        onSelect={() => navigate(c.href)}
                                        className={ITEM_CLS}
                                    >
                                        <Users className="w-4 h-4 flex-shrink-0" />
                                        {c.label}
                                    </Command.Item>
                                ))}
                            </Command.Group>
                        )}
                    </Command.List>

                    {/* Footer */}
                    <div className="px-4 py-2.5 border-t border-border flex items-center gap-4 text-[10px] text-muted-foreground">
                        <span><kbd className="bg-secondary rounded px-1 py-0.5">↑↓</kbd> navigate</span>
                        <span><kbd className="bg-secondary rounded px-1 py-0.5">↵</kbd> select</span>
                        <span><kbd className="bg-secondary rounded px-1 py-0.5">ESC</kbd> close</span>
                    </div>
                </Command>
            </div>
        </div>
    );
}

/** Fire this from any button to open the command palette. */
export function openCommandPalette() {
    window.dispatchEvent(new CustomEvent("open-command-palette"));
}
