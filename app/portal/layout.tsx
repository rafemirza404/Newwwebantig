import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "~/lib/supabase/server";
import PortalSidebar from "~/components/portal/PortalSidebar";
import { isDemoMode, DEMO_CLIENTS, DEMO_WORKSPACE, DEMO_PROFILE } from "~/lib/mock/mockData";

const PORTAL_AUTH_PAGES = ["/portal/login", "/portal/signup", "/portal/reset-password"];

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Portal auth pages (login/signup/reset-password) render without sidebar or auth check
  const pathname = headers().get("x-pathname") ?? "";
  if (PORTAL_AUTH_PAGES.some((p) => pathname.startsWith(p))) {
    return <>{children}</>;
  }

  // Demo mode — bypass all DB checks, use mock data
  if (isDemoMode()) {
    const demoClient = DEMO_CLIENTS[0];
    const demoBrandColor = DEMO_WORKSPACE.brand_color;
    return (
      <div
        className="flex h-screen bg-background text-foreground overflow-hidden"
        style={{ "--brand-color": demoBrandColor } as React.CSSProperties}
      >
        <PortalSidebar
          workspaceName={DEMO_WORKSPACE.name}
          workspaceLogoUrl={DEMO_WORKSPACE.logo_url}
          brandColor={demoBrandColor}
          isWhiteLabel={true}
          clientName={demoClient.business_name}
          clientEmail={demoClient.contact_email}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    );
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/portal/login");

  // Find the client record linked to this user
  const { data: client } = await supabase
    .from("clients")
    .select("id, business_name, contact_email, workspace_id")
    .eq("client_user_id", user.id)
    .maybeSingle();

  if (!client) {
    // Not a portal user — send to dashboard (they may be an agency owner or direct user)
    redirect("/dashboard");
  }

  // Load workspace branding
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("name, logo_url, brand_color, plan")
    .eq("id", client.workspace_id)
    .single();

  const brandColor = workspace?.brand_color ?? "#7C6EF8";
  const isWhiteLabel = workspace?.plan === "scale";

  // Get the user's profile for their name
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div
      className="flex h-screen bg-background text-foreground overflow-hidden"
      style={{ "--brand-color": brandColor } as React.CSSProperties}
    >
      <PortalSidebar
        workspaceName={workspace?.name ?? "Agency"}
        workspaceLogoUrl={workspace?.logo_url ?? null}
        brandColor={brandColor}
        isWhiteLabel={isWhiteLabel}
        clientName={profile?.full_name ?? client.business_name}
        clientEmail={client.contact_email}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
