"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { DashboardHeader } from "~/components/dashboard/shared/DashboardHeader";
import { createSupabaseClient } from "~/lib/supabase/client";
import { isDemoMode, DEMO_PROFILE, DEMO_USER } from "~/lib/mock/mockData";

interface DashboardHeaderWrapperProps {
    firstName: string;
    email: string;
    hasAgency?: boolean;
    currentMode?: "direct" | "agency_owner";
}

/**
 * Wraps DashboardHeader so it can be placed in the server layout.
 * Fetches search items and notifications client-side.
 */
export default function DashboardHeaderWrapper({
    firstName,
    email,
    hasAgency = false,
    currentMode = "direct",
}: DashboardHeaderWrapperProps) {
    const pathname = usePathname();
    const [searchItems, setSearchItems] = useState<{ id: string; name: string; href: string }[]>([]);
    const [notifications, setNotifications] = useState<
        { id: string; label: string; meta: string; type: "audit" | "client" | "report" }[]
    >([]);

    useEffect(() => {
        if (isDemoMode()) {
            // Use lightweight demo data for header
            setSearchItems([]);
            setNotifications([]);
            return;
        }

        (async () => {
            const supabase = createSupabaseClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch recent audit sessions for search and notifications
            const { data: sessions } = await supabase
                .from("audit_sessions")
                .select("id, business_name, status, started_at")
                .eq("user_id", user.id)
                .order("started_at", { ascending: false })
                .limit(10);

            if (sessions) {
                setSearchItems(
                    sessions.map((s: any) => ({
                        id: s.id,
                        name: s.business_name,
                        href: s.status === "complete" ? "/dashboard/reports" : `/audit/${s.id}`,
                    }))
                );

                setNotifications(
                    sessions.slice(0, 5).map((s: any) => ({
                        id: s.id,
                        label: s.business_name,
                        meta: `${s.status === "complete"
                                ? "Audit completed"
                                : s.status === "in_progress"
                                    ? "Audit in progress"
                                    : "Audit started"
                            } · ${new Date(s.started_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                            })}`,
                        type: "audit" as const,
                    }))
                );
            }
        })();
    }, [pathname]);

    return (
        <DashboardHeader
            firstName={firstName}
            email={email}
            searchItems={searchItems}
            notifications={notifications}
            hasAgency={hasAgency}
            currentMode={currentMode}
        />
    );
}
