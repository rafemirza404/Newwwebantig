import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "~/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 });

  // Look up the invite
  const { data: invite } = await supabase
    .from("invites")
    .select("id, workspace_id, email, role, accepted_at, expires_at")
    .eq("token", token)
    .single();

  if (!invite) return NextResponse.json({ error: "Invalid invite" }, { status: 404 });
  if (invite.accepted_at) return NextResponse.json({ error: "Invite already used" }, { status: 409 });
  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: "Invite has expired" }, { status: 410 });
  }

  // Add user to workspace_members
  const { error: insertError } = await supabase
    .from("workspace_members")
    .insert({ workspace_id: invite.workspace_id, user_id: user.id, role: invite.role });

  if (insertError && !insertError.message.includes("duplicate")) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Update user_type to reflect they're a team member
  await supabase
    .from("profiles")
    .update({ user_type: "team_member" })
    .eq("id", user.id);

  // Mark invite as accepted
  await supabase
    .from("invites")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", invite.id);

  return NextResponse.json({ ok: true });
}
