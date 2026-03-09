import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "~/lib/supabase/server";
import { sendEmail } from "~/lib/email";
import { clientPortalWelcomeEmail } from "~/lib/emails/client-portal-welcome";

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { clientId } = await req.json();
  if (!clientId) return NextResponse.json({ error: "clientId is required" }, { status: 400 });

  // Verify caller owns a workspace
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, name, logo_url")
    .eq("owner_id", user.id)
    .single();

  if (!workspace) return NextResponse.json({ error: "No workspace found" }, { status: 404 });

  // Verify client belongs to caller's workspace and has a portal account
  const { data: client } = await supabase
    .from("clients")
    .select("id, business_name, contact_email, client_user_id")
    .eq("id", clientId)
    .eq("workspace_id", workspace.id)
    .maybeSingle();

  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 403 });
  if (!client.client_user_id) {
    return NextResponse.json({ error: "Client has not signed up for portal access yet" }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;
  const portalUrl = `${baseUrl}/portal/login`;

  sendEmail({
    to: client.contact_email,
    subject: `Your ${workspace.name} client portal`,
    html: clientPortalWelcomeEmail({
      workspaceName: workspace.name,
      clientName: client.business_name,
      portalUrl,
    }),
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}
