import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "~/lib/supabase/server";
import Link from "next/link";
import { Plus } from "lucide-react";
import { isDemoMode, DEMO_DIRECT_AUDITS, DEMO_AGENCY_AUDITS } from "~/lib/mock/mockData";
import AuditsClient from "~/components/dashboard/audits/AuditsClient";

export default async function AuditsPage() {
  let sessions: any[] = [];
  let isAgency = false;

  if (isDemoMode()) {
    const cookieStore = cookies();
    const cookieMode = cookieStore.get("view_mode")?.value;
    isAgency = cookieMode === "agency_owner";
    sessions = isAgency ? DEMO_AGENCY_AUDITS : DEMO_DIRECT_AUDITS;
  } else {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login?redirectTo=/dashboard/audits");

    const { data: profile } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .single();

    const cookieStore = cookies();
    const cookieMode = cookieStore.get("view_mode")?.value;
    const effectiveType = (cookieMode && ["direct", "agency_owner"].includes(cookieMode))
      ? cookieMode
      : (profile?.user_type ?? "direct");

    isAgency = effectiveType === "agency_owner";

    if (isAgency) {
      const { data: workspace } = await supabase
        .from("workspaces")
        .select("id")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (workspace) {
        const { data } = await supabase
          .from("audit_sessions")
          .select("id, business_name, status, mode, started_at, completed_at, question_count, archived_at")
          .eq("workspace_id", workspace.id)
          .order("started_at", { ascending: false });
        sessions = data ?? [];
      }
    } else {
      // Direct mode: exclude agency client audits (those have workspace_id set)
      const { data } = await supabase
        .from("audit_sessions")
        .select("id, business_name, status, mode, started_at, completed_at, question_count, archived_at")
        .eq("user_id", user.id)
        .is("workspace_id", null)
        .order("started_at", { ascending: false });
      sessions = data ?? [];
    }
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-foreground text-[28px] font-bold tracking-tight">
            {isAgency ? "All Audits" : "My Audits"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{sessions.length} total audits</p>
        </div>
        <Link
          href={isAgency ? "/dashboard/clients" : "/audit/new"}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold flex-shrink-0 shadow-sm transition-colors rounded-full"
        >
          <Plus className="w-4 h-4 text-primary-foreground" />
          {isAgency ? "Select Client" : "New Audit"}
        </Link>
      </div>

      <AuditsClient sessions={sessions} isAgency={isAgency} />
    </div>
  );
}
