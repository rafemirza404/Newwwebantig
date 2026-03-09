import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "~/lib/supabase/server";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "token is required" }, { status: 400 });

  const supabase = createSupabaseServerClient();

  const { data: invite } = await supabase
    .from("client_invites")
    .select("id, email, client_id, clients(business_name, workspace_id, client_user_id), workspace_id")
    .eq("token", token)
    .maybeSingle();

  if (!invite) {
    return NextResponse.json({ error: "Invalid invite link" }, { status: 404 });
  }

  const client = Array.isArray(invite.clients) ? invite.clients[0] : invite.clients;

  // Already registered — client already has a portal account
  if (client?.client_user_id) {
    return NextResponse.json({ error: "This client already has portal access" }, { status: 409 });
  }

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("name, logo_url")
    .eq("id", invite.workspace_id)
    .single();

  return NextResponse.json({
    email: invite.email,
    clientName: client?.business_name ?? "",
    workspaceName: workspace?.name ?? "",
    workspaceLogoUrl: workspace?.logo_url ?? null,
  });
}
