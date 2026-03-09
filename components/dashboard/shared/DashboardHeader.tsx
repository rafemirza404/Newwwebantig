"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Bell, Settings, LogOut, Building2, User, FileText, ClipboardList, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "~/lib/supabase/client";
import { openCommandPalette } from "~/components/dashboard/shared/CommandPalette";

interface Notification {
    id: string;
    title: string;
    message: string | null;
    type: "audit_complete" | "report_ready" | "client_added" | "system";
    href: string;
    is_read: boolean;
    created_at: string;
}

interface DashboardHeaderProps {
    firstName: string;
    lastName?: string;
    email: string;
    notifications?: Notification[];
    hasAgency?: boolean;
    currentMode?: "direct" | "agency_owner";
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

function NotifIcon({ type }: { type: string }) {
    if (type === "report_ready") return <FileText className="w-4 h-4 text-primary" />;
    if (type === "audit_complete") return <ClipboardList className="w-4 h-4 text-green-500" />;
    if (type === "client_added") return <Users className="w-4 h-4 text-blue-500" />;
    return <Bell className="w-4 h-4 text-muted-foreground" />;
}

export function DashboardHeader({
    firstName,
    lastName,
    email,
    notifications = [],
    hasAgency = false,
    currentMode = "direct",
}: DashboardHeaderProps) {
    const [notifs, setNotifs] = useState<Notification[]>(notifications);
    const [bellOpen, setBellOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [switchingMode, setSwitchingMode] = useState(false);

    const bellRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Sync when wrapper re-fetches on route change
    useEffect(() => { setNotifs(notifications); }, [notifications]);

    const unreadCount = notifs.filter(n => !n.is_read).length;

    function markRead(id: string) {
        setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        fetch("/api/notifications/read", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: [id] }),
        }).catch(() => {});
    }

    function markAllRead() {
        setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
        fetch("/api/notifications/read", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ all: true }),
        }).catch(() => {});
    }

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
                setBellOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    async function handleLogout() {
        const supabase = createSupabaseClient();
        await supabase.auth.signOut();
        router.push("/login");
    }

    async function handleModeSwitch(mode: "direct" | "agency_owner") {
        if (mode === currentMode || switchingMode) return;
        setSwitchingMode(true);
        await fetch("/api/dev/mode", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mode }),
        });
        router.push("/dashboard");
        router.refresh();
        setSwitchingMode(false);
    }

    return (
        <div className="flex justify-end items-center mb-10 gap-3 relative z-50">

            {/* Mode switcher pill — shown only when user has both modes */}
            {hasAgency && (
                <div className="flex items-center bg-secondary rounded-full p-1 gap-0.5 mr-1">
                    <button
                        onClick={() => handleModeSwitch("direct")}
                        disabled={switchingMode}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${currentMode === "direct"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <User className="w-3 h-3" />
                        Business
                    </button>
                    <button
                        onClick={() => handleModeSwitch("agency_owner")}
                        disabled={switchingMode}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${currentMode === "agency_owner"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <Building2 className="w-3 h-3" />
                        Agency
                    </button>
                </div>
            )}

            {/* Search — opens command palette */}
            <button
                onClick={openCommandPalette}
                title="Search (Ctrl+K)"
                className="w-10 h-10 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center cursor-pointer transition-smooth border border-transparent hover:border-border"
            >
                <Search className="w-[18px] h-[18px] text-muted-foreground" />
            </button>

            {/* Bell / Notifications */}
            <div ref={bellRef} className="relative">
                <button
                    onClick={() => { setBellOpen((v) => !v); setProfileOpen(false); }}
                    className="relative w-10 h-10 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center cursor-pointer text-muted-foreground transition-smooth border border-transparent hover:border-border"
                >
                    <Bell className="w-[18px] h-[18px]" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-destructive text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 ring-2 ring-background">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </button>

                {bellOpen && (
                    <div className="absolute top-14 right-0 w-80 bg-card border border-border rounded-2xl shadow-elegant overflow-hidden animate-fade-in">
                        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="text-xs text-primary hover:underline"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {notifs.length > 0 ? (
                            <div className="max-h-72 overflow-y-auto divide-y divide-border/50">
                                {notifs.map((n) => (
                                    <Link
                                        key={n.id}
                                        href={n.href}
                                        onClick={() => { markRead(n.id); setBellOpen(false); }}
                                        className={`flex items-start gap-3 px-4 py-3 hover:bg-secondary transition-colors ${!n.is_read ? "bg-primary/[0.03]" : ""}`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${!n.is_read ? "bg-primary/10" : "bg-secondary"}`}>
                                            <NotifIcon type={n.type} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm truncate ${!n.is_read ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                                                {n.title}
                                            </p>
                                            {n.message && (
                                                <p className="text-xs text-muted-foreground mt-0.5 truncate">{n.message}</p>
                                            )}
                                            <p className="text-[10px] text-muted-foreground/60 mt-1">{timeAgo(n.created_at)}</p>
                                        </div>
                                        {!n.is_read && (
                                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                                        )}
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                No notifications yet
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Profile Circle */}
            <div ref={profileRef} className="relative ml-1">
                <button
                    onClick={() => { setProfileOpen((v) => !v); setBellOpen(false); }}
                    className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm cursor-pointer border-2 border-primary shadow-glow transition-smooth hover:scale-105"
                >
                    {firstName.charAt(0).toUpperCase()}
                </button>

                {/* Profile dropdown */}
                {profileOpen && (
                    <div className="absolute top-14 right-0 w-64 bg-card border border-border rounded-2xl shadow-elegant overflow-hidden animate-fade-in">
                        <div className="px-4 py-4 border-b border-border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm flex-shrink-0">
                                    {firstName.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-foreground truncate">
                                        {firstName}{lastName ? ` ${lastName}` : ""}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">{email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="py-1.5">
                            <Link
                                href="/dashboard/settings"
                                onClick={() => setProfileOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-secondary transition-colors text-sm text-foreground"
                            >
                                <Settings className="w-4 h-4 text-muted-foreground" />
                                Settings
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-secondary transition-colors text-sm text-destructive"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
