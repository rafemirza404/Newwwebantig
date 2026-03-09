import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "~/lib/supabase/server";
import Sidebar from "~/components/dashboard/sidebar/Sidebar";
import DashboardHeaderWrapper from "~/components/dashboard/shared/DashboardHeaderWrapper";
import { CommandPalette } from "~/components/dashboard/shared/CommandPalette";
import { isDemoMode, DEMO_PROFILE, DEMO_WORKSPACE } from "~/lib/mock/mockData";
import type { UserType } from "~/lib/supabase/client";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Read the view_mode cookie — this is the same source of truth the page uses
  const cookieStore = cookies();
  const cookieMode = cookieStore.get("view_mode")?.value;

  if (isDemoMode()) {
    // In demo mode: allow cookie to switch sidebar nav just like the page switches content
    const effectiveUserType = (
      cookieMode && ["direct", "agency_owner"].includes(cookieMode)
        ? cookieMode
        : DEMO_PROFILE.user_type
    ) as UserType;

    return (
      <div className="flex h-screen bg-background text-foreground overflow-hidden">
        <Sidebar
          userType={effectiveUserType}
          userEmail={DEMO_PROFILE.email}
          userName={DEMO_PROFILE.full_name}
          workspaceName={effectiveUserType === "agency_owner" ? DEMO_WORKSPACE.name : undefined}
          userPlan="free"
        />
        <main className="flex-1 overflow-y-auto">
          <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm px-8 pt-6 pb-2">
            <DashboardHeaderWrapper
              firstName={DEMO_PROFILE.full_name.split(" ")[0]}
              email={DEMO_PROFILE.email}
              hasAgency={DEMO_PROFILE.has_agency}
              currentMode={effectiveUserType as "direct" | "agency_owner"}
            />
          </div>
          {children}
        </main>
        <CommandPalette isAgency={effectiveUserType === "agency_owner"} />
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
    .select("user_type, full_name, email, has_agency, plan")
    .eq("id", user.id)
    .single();

  const realUserType = (profile?.user_type ?? "direct") as UserType;

  // Apply the same view_mode cookie the page uses — sidebar must match page content
  const effectiveUserType = (
    cookieMode && ["direct", "agency_owner"].includes(cookieMode)
      ? cookieMode
      : realUserType
  ) as UserType;

  // Only fetch workspace name if we're rendering the agency sidebar
  let workspaceName: string | undefined;
  if (effectiveUserType === "agency_owner") {
    const { data: workspace } = await supabase
      .from("workspaces")
      .select("name")
      .eq("owner_id", user.id)
      .maybeSingle();
    workspaceName = workspace?.name;
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar
        userType={effectiveUserType}
        userEmail={profile?.email ?? user.email ?? ""}
        userName={profile?.full_name ?? ""}
        workspaceName={workspaceName}
        userPlan={(profile as any)?.plan ?? "free"}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm px-8 pt-6 pb-2">
          <DashboardHeaderWrapper
            firstName={(profile?.full_name ?? "").split(" ")[0] || "User"}
            email={profile?.email ?? user.email ?? ""}
            hasAgency={(profile as any)?.has_agency ?? false}
            currentMode={effectiveUserType as "direct" | "agency_owner"}
          />
        </div>
        {children}
      </main>
      <CommandPalette isAgency={effectiveUserType === "agency_owner"} />
    </div>
  );
}
