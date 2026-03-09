import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createServiceRoleClient } from "~/lib/supabase/server";
import { sendEmail } from "~/lib/email";
import { clientPortalWelcomeEmail } from "~/lib/emails/client-portal-welcome";

export async function POST(req: NextRequest) {
  const { token, password, fullName } = await req.json();
  if (!token || !password || !fullName) {
    return NextResponse.json({ error: "token, password, and fullName are required" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();

  // Validate invite
  const { data: invite } = await supabase
    .from("client_invites")
    .select("id, email, accepted_at, client_id, workspace_id")
    .eq("token", token)
    .maybeSingle();

  if (!invite) return NextResponse.json({ error: "Invalid invite" }, { status: 404 });

  // Fetch workspace + client together
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("name, logo_url")
    .eq("id", invite.workspace_id)
    .single();

  const { data: client } = await supabase
    .from("clients")
    .select("id, business_name, client_user_id")
    .eq("id", invite.client_id)
    .single();

  // Already registered — safe to retry signup if client_user_id not set yet
  if (client?.client_user_id) {
    return NextResponse.json({ error: "This client already has portal access" }, { status: 409 });
  }

  // Create the Supabase auth user via service role
  const adminClient = createServiceRoleClient();
  const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
    email: invite.email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, user_type: "client" },
  });

  if (createError || !newUser.user) {
    return NextResponse.json({ error: createError?.message ?? "Failed to create user" }, { status: 500 });
  }

  const newUserId = newUser.user.id;

  // Insert profile — onboarding_completed_at set so auth/callback never redirects to /onboarding
  await adminClient.from("profiles").insert({
    id: newUserId,
    full_name: fullName,
    user_type: "client",
    onboarding_completed_at: new Date().toISOString(),
  });

  // Link client to new user
  await adminClient.from("clients").update({ client_user_id: newUserId }).eq("id", invite.client_id);

  // Mark invite as accepted
  await adminClient.from("client_invites").update({ accepted_at: new Date().toISOString() }).eq("id", invite.id);

  // Send welcome email (fire-and-forget)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;
  const portalUrl = `${baseUrl}/portal/login`;
  sendEmail({
    to: invite.email,
    subject: `Welcome to your ${workspace?.name ?? "client"} portal`,
    html: clientPortalWelcomeEmail({
      workspaceName: workspace?.name ?? "your advisor",
      clientName: fullName,
      portalUrl,
    }),
  }).catch(() => {});

  return NextResponse.json({ ok: true, email: invite.email });
}
