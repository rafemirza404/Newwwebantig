"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Bell, Settings, LogOut, X, ChevronRight, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "~/lib/supabase/client";

interface Notification {
    id: string;
    label: string;
    meta: string;
    type: "audit" | "client" | "report";
}

interface DashboardHeaderProps {
    firstName: string;
    lastName?: string;
    email: string;
    /** Items to search through — pass clients or sessions array */
    searchItems?: { id: string; name: string; href: string }[];
    /** Recent activity for the notification bell */
    notifications?: Notification[];
    onSearchChange?: (query: string) => void;
}

export function DashboardHeader({
    firstName,
    lastName,
    email,
    searchItems = [],
    notifications = [],
    onSearchChange,
}: DashboardHeaderProps) {
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [bellOpen, setBellOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const searchRef = useRef<HTMLDivElement>(null);
    const bellRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setSearchOpen(false);
                setSearchQuery("");
                onSearchChange?.("");
            }
            if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
                setBellOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onSearchChange]);

    // Focus input when search opens
    useEffect(() => {
        if (searchOpen) {
            setTimeout(() => searchInputRef.current?.focus(), 50);
        }
    }, [searchOpen]);

    function handleSearch(query: string) {
        setSearchQuery(query);
        onSearchChange?.(query);
    }

    const filteredItems = searchQuery.trim()
        ? searchItems.filter((item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : searchItems.slice(0, 5);

    async function handleLogout() {
        const supabase = createSupabaseClient();
        await supabase.auth.signOut();
        router.push("/login");
    }

    return (
        <div className="flex justify-end items-center mb-10 gap-3 relative z-50">

            {/* Search */}
            <div ref={searchRef} className="relative">
                <button
                    onClick={() => {
                        setSearchOpen((v) => !v);
                        setBellOpen(false);
                        setProfileOpen(false);
                    }}
                    className="w-10 h-10 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center cursor-pointer transition-smooth border border-transparent hover:border-border"
                >
                    {searchOpen ? (
                        <X className="w-[18px] h-[18px] text-muted-foreground" />
                    ) : (
                        <Search className="w-[18px] h-[18px] text-muted-foreground" />
                    )}
                </button>

                {/* Search dropdown */}
                {searchOpen && (
                    <div className="absolute top-14 right-0 w-80 bg-card border border-border rounded-2xl shadow-elegant overflow-hidden animate-fade-in">
                        <div className="p-3 border-b border-border">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder="Search clients or audits..."
                                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-secondary text-foreground placeholder:text-muted-foreground rounded-xl border border-transparent focus:outline-none focus:border-primary transition-smooth"
                                />
                            </div>
                        </div>

                        {searchItems.length > 0 ? (
                            <div className="max-h-60 overflow-y-auto">
                                {filteredItems.length > 0 ? (
                                    filteredItems.map((item) => (
                                        <Link
                                            key={item.id}
                                            href={item.href}
                                            onClick={() => {
                                                setSearchOpen(false);
                                                setSearchQuery("");
                                                onSearchChange?.("");
                                            }}
                                            className="flex items-center justify-between px-4 py-3 hover:bg-secondary transition-colors group"
                                        >
                                            <span className="text-sm text-foreground font-medium group-hover:text-primary transition-colors">
                                                {item.name}
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </Link>
                                    ))
                                ) : (
                                    <div className="px-4 py-6 text-center text-muted-foreground text-sm">
                                        No results for &quot;{searchQuery}&quot;
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="px-4 py-6 text-center text-muted-foreground text-sm">
                                No items to search yet
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Bell / Notifications */}
            <div ref={bellRef} className="relative">
                <button
                    onClick={() => {
                        setBellOpen((v) => !v);
                        setSearchOpen(false);
                        setProfileOpen(false);
                    }}
                    className="relative w-10 h-10 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center cursor-pointer text-muted-foreground transition-smooth border border-transparent hover:border-border"
                >
                    <Bell className="w-[18px] h-[18px]" />
                    {notifications.length > 0 && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full ring-2 ring-background" />
                    )}
                </button>

                {/* Notifications dropdown */}
                {bellOpen && (
                    <div className="absolute top-14 right-0 w-80 bg-card border border-border rounded-2xl shadow-elegant overflow-hidden animate-fade-in">
                        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                            {notifications.length > 0 && (
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                    {notifications.length} new
                                </span>
                            )}
                        </div>

                        {notifications.length > 0 ? (
                            <div className="max-h-60 overflow-y-auto divide-y divide-border/50">
                                {notifications.map((n) => (
                                    <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-secondary transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <Clock className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">{n.label}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">{n.meta}</p>
                                        </div>
                                    </div>
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
                    onClick={() => {
                        setProfileOpen((v) => !v);
                        setSearchOpen(false);
                        setBellOpen(false);
                    }}
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
