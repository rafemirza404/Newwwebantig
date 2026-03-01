import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "~/lib/supabase/server";
import Sidebar from "~/components/dashboard/sidebar/Sidebar";
import { isDemoMode, DEMO_PROFILE, DEMO_USER, DEMO_WORKSPACE } from "~/lib/mock/mockData";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (isDemoMode()) {
    const userType = (DEMO_PROFILE.user_type) as "direct" | "agency_owner" | "team_member" | "client" | "super_admin";
    return (
      <div className="flex h-screen bg-background text-foreground overflow-hidden">
        <Sidebar
          userType={userType}
          userEmail={DEMO_PROFILE.email}
          userName={DEMO_PROFILE.full_name}
          workspaceName={DEMO_WORKSPACE.name}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    );
  }

  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/dashboard");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type, full_name, email")
    .eq("id", user.id)
    .single();

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("name")
    .eq("owner_id", user.id)
    .maybeSingle();

  const userType = (profile?.user_type ?? "direct") as "direct" | "agency_owner" | "team_member" | "client" | "super_admin";

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar
        userType={userType}
        userEmail={profile?.email ?? user.email ?? ""}
        userName={profile?.full_name ?? ""}
        workspaceName={workspace?.name}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
