import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "~/lib/supabase/server";
import AgencyDashboard from "~/components/dashboard/agency/AgencyDashboard";
import DirectDashboard from "~/components/dashboard/direct/DirectDashboard";
import type { UserType } from "~/lib/supabase/client";
import { isDemoMode, DEMO_PROFILE, DEMO_CLIENTS, DEMO_DIRECT_AUDITS, DEMO_AGENCY_AUDITS, DEMO_REPORTS, DEMO_IMPL_ITEMS, DEMO_WORKSPACE } from "~/lib/mock/mockData";

export default async function DashboardPage({ searchParams }: { searchParams: { mode?: string } }) {
  if (isDemoMode()) {
    const cookieStore = cookies();
    const cookieMode = cookieStore.get("view_mode")?.value;
    const rawMode = searchParams?.mode ?? cookieMode;
    const effectiveUserType = (rawMode && ["direct", "agency_owner"].includes(rawMode))
      ? rawMode as UserType
      : DEMO_PROFILE.user_type;

    if (effectiveUserType === "agency_owner") {
      return (
        <AgencyDashboard
          firstName={DEMO_PROFILE.full_name.split(" ")[0]}
          email={DEMO_PROFILE.email}
          activeClients={DEMO_CLIENTS.length}
          pendingAudits={DEMO_AGENCY_AUDITS.filter(a => ["in_progress", "processing"].includes(a.status)).length}
          clients={DEMO_CLIENTS.slice(0, 10)}
          recentAudits={DEMO_AGENCY_AUDITS.slice(0, 10)}
          workspaceId={DEMO_WORKSPACE.id}
          hasAgency={DEMO_PROFILE.has_agency}
          currentMode="agency_owner"
        />
      );
    }

    return (
      <DirectDashboard
        firstName={DEMO_PROFILE.full_name.split(" ")[0]}
        email={DEMO_PROFILE.email}
        latestReport={DEMO_REPORTS[0]}
        sessions={DEMO_DIRECT_AUDITS.slice(0, 5)}
        implItems={DEMO_IMPL_ITEMS}
        plan={DEMO_PROFILE.plan}
        hasAgency={DEMO_PROFILE.has_agency}
        currentMode="direct"
      />
    );
  }

  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirectTo=/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Haven't completed onboarding yet — redirect regardless of how they got here
  if (!profile?.onboarding_completed_at) redirect("/onboarding");

  const userType = profile?.user_type ?? "direct";
  // Mode switcher only shown for direct users who have explicitly unlocked agency mode.
  // Pure agency_owner users (signed up as agency) only have one mode — no switcher needed.
  // Existing agency_owner users who want the switcher must go through the unlock flow (settings).
  const hasAgency = userType === "direct" && (profile?.has_agency ?? false);

  // Client portal users go to /portal instead
  if (userType === "client") redirect("/portal");

  // View mode: searchParams takes priority, then cookie, then real user_type
  const cookieStore = cookies();
  const cookieMode = cookieStore.get("view_mode")?.value;
  const rawMode = searchParams?.mode ?? cookieMode;
  const effectiveUserType = (rawMode && ["direct", "agency_owner"].includes(rawMode))
    ? rawMode as UserType
    : userType;

  if (effectiveUserType === "agency_owner") {
    const { data: workspace } = await supabase
      .from("workspaces")
      .select("id, name")
      .eq("owner_id", user.id)
      .maybeSingle();

    const { data: clients } = workspace
      ? await supabase
        .from("clients")
        .select("id, business_name, industry, created_at")
        .eq("workspace_id", workspace.id)
        .order("created_at", { ascending: false })
        .limit(10)
      : { data: [] };

    const { data: audits } = workspace
      ? await supabase
        .from("audit_sessions")
        .select("id, business_name, status, started_at, completed_at")
        .eq("workspace_id", workspace.id)
        .order("started_at", { ascending: false })
        .limit(10)
      : { data: [] };

    const { count: activeClients } = workspace
      ? await supabase
        .from("clients")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", workspace.id)
      : { count: 0 };

    const { count: pendingAudits } = workspace
      ? await supabase
        .from("audit_sessions")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", workspace.id)
        .in("status", ["in_progress", "processing"])
      : { count: 0 };

    const firstName = (profile?.full_name ?? user.email ?? "").split(" ")[0];

    return (
      <AgencyDashboard
        firstName={firstName}
        email={user.email ?? ""}
        activeClients={activeClients ?? 0}
        pendingAudits={pendingAudits ?? 0}
        clients={clients ?? []}
        recentAudits={audits ?? []}
        workspaceId={workspace?.id}
        hasAgency={hasAgency}
        currentMode="agency_owner"
      />
    );
  }

  // Direct user dashboard — exclude agency client audits (those have workspace_id set)
  const { data: sessions } = await supabase
    .from("audit_sessions")
    .select("id, status, business_name, started_at, completed_at")
    .eq("user_id", user.id)
    .is("workspace_id", null)
    .order("started_at", { ascending: false })
    .limit(5);

  // Get latest report scoped to direct sessions only
  const directSessionIds = (sessions ?? []).map((s: any) => s.id);
  const { data: latestReport } = directSessionIds.length > 0
    ? await supabase
        .from("reports")
        .select("id, overall_score, function_scores, gaps_preview, full_gaps, created_at")
        .in("session_id", directSessionIds)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null };

  const { data: implItems } = await supabase
    .from("implementation_items")
    .select("id, gap_name, priority, time_saved_hrs, status")
    .eq("user_id", user.id)
    .order("status", { ascending: true })
    .limit(10);

  const firstName = (profile?.full_name ?? user.email ?? "").split(" ")[0];

  return (
    <DirectDashboard
      firstName={firstName}
      email={user.email ?? ""}
      latestReport={latestReport}
      sessions={sessions ?? []}
      implItems={implItems ?? []}
      plan={profile?.plan ?? "free"}
      hasAgency={hasAgency}
      currentMode={effectiveUserType === "agency_owner" ? "agency_owner" : "direct"}
    />
  );
}
