"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { DashboardHeader } from "~/components/dashboard/shared/DashboardHeader";
import { createSupabaseClient } from "~/lib/supabase/client";
import { isDemoMode } from "~/lib/mock/mockData";

interface DashboardHeaderWrapperProps {
    firstName: string;
    email: string;
    hasAgency?: boolean;
    currentMode?: "direct" | "agency_owner";
}

export default function DashboardHeaderWrapper({
    firstName,
    email,
    hasAgency = false,
    currentMode = "direct",
}: DashboardHeaderWrapperProps) {
    const pathname = usePathname();
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        if (isDemoMode()) {
            setNotifications([]);
            return;
        }

        (async () => {
            const supabase = createSupabaseClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from("notifications")
                .select("id, title, message, type, href, is_read, created_at")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(10);

            if (data) setNotifications(data);
        })();
    }, [pathname]);

    return (
        <DashboardHeader
            firstName={firstName}
            email={email}
            notifications={notifications}
            hasAgency={hasAgency}
            currentMode={currentMode}
        />
    );
}
