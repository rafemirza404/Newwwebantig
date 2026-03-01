import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "~/lib/supabase/server";
import { sendEmail } from "~/lib/email";
import { teamInviteEmail } from "~/lib/emails/team-invite";

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { email, role } = await req.json();
  if (!email || !role) {
    return NextResponse.json({ error: "email and role are required" }, { status: 400 });
  }

  // Verify caller owns a workspace
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, name")
    .eq("owner_id", user.id)
    .single();

  if (!workspace) {
    return NextResponse.json({ error: "No workspace found" }, { status: 404 });
  }

  // Create the invite
  const { data: invite, error } = await supabase
    .from("invites")
    .insert({ workspace_id: workspace.id, email: email.trim().toLowerCase(), role })
    .select("token")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;
  const inviteUrl = `${baseUrl}/auth/accept-invite?token=${invite.token}`;

  // Get inviter's name for the email
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();
  const inviterName = profile?.full_name ?? user.email ?? workspace.name;

  // Send invite email (non-blocking)
  sendEmail({
    to: email.trim().toLowerCase(),
    subject: `${inviterName} invited you to ${workspace.name} on AgentBlue`,
    html: teamInviteEmail({ workspaceName: workspace.name, inviterName, role, inviteUrl }),
  }).catch(() => {/* already logged inside sendEmail */});

  return NextResponse.json({ inviteUrl });
}
