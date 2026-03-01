import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "~/lib/supabase/server";
import TeamClient from "./_components/TeamClient";
import { isDemoMode, DEMO_USER, DEMO_WORKSPACE, DEMO_TEAM_MEMBERS, DEMO_PENDING_INVITES } from "~/lib/mock/mockData";

export default async function TeamPage() {
  if (isDemoMode()) {
    return (
      <TeamClient
        ownerEmail={DEMO_USER.email}
        workspaceName={DEMO_WORKSPACE.name}
        members={DEMO_TEAM_MEMBERS.map((m) => ({
          id: m.id,
          role: m.role,
          createdAt: m.created_at,
          profile: Array.isArray(m.profiles) ? m.profiles[0] : m.profiles,
        }))}
        pendingInvites={DEMO_PENDING_INVITES}
      />
    );
  }

  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/dashboard/team");

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", user.id)
    .single();

  if (profile?.user_type !== "agency_owner") redirect("/dashboard");

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, name")
    .eq("owner_id", user.id)
    .single();

  const { data: members } = workspace
    ? await supabase
      .from("workspace_members")
      .select("id, role, created_at, profiles(full_name, email)")
      .eq("workspace_id", workspace.id)
      .order("created_at", { ascending: true })
    : { data: [] };

  const { data: pendingInvites } = workspace
    ? await supabase
      .from("invites")
      .select("id, email, role, created_at, expires_at")
      .eq("workspace_id", workspace.id)
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <TeamClient
      ownerEmail={user.email ?? ""}
      workspaceName={workspace?.name ?? "Workspace"}
      members={(members ?? []).map((m) => ({
        id: m.id,
        role: m.role,
        createdAt: m.created_at,
        profile: Array.isArray(m.profiles) ? m.profiles[0] : m.profiles,
      }))}
      pendingInvites={pendingInvites ?? []}
    />
  );
}
