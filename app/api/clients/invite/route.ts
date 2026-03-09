import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "~/lib/supabase/server";
import { sendEmail } from "~/lib/email";
import { clientPortalInviteEmail } from "~/lib/emails/client-portal-invite";

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

  // Verify client belongs to caller's workspace
  const { data: client } = await supabase
    .from("clients")
    .select("id, business_name, contact_email, client_user_id, workspace_id")
    .eq("id", clientId)
    .eq("workspace_id", workspace.id)
    .maybeSingle();

  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 403 });
  if (client.client_user_id) {
    return NextResponse.json({ error: "Client already has portal access" }, { status: 409 });
  }

  // Insert invite
  const { data: invite, error } = await supabase
    .from("client_invites")
    .insert({
      workspace_id: workspace.id,
      client_id: client.id,
      email: client.contact_email,
    })
    .select("token")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;
  const signupUrl = `${baseUrl}/portal/signup?token=${invite.token}`;

  sendEmail({
    to: client.contact_email,
    subject: `You've been invited to ${workspace.name}'s client portal`,
    html: clientPortalInviteEmail({
      workspaceName: workspace.name,
      workspaceLogoUrl: workspace.logo_url ?? null,
      clientName: client.business_name,
      signupUrl,
    }),
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}
