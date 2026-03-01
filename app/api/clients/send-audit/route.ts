import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "~/lib/supabase/server";
import { sendEmail } from "~/lib/email";
import { clientAuditEmail } from "~/lib/emails/client-audit";

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { clientId, message } = await req.json() as { clientId: string; message?: string };
  if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 });

  // Verify client belongs to caller's workspace
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, name")
    .eq("owner_id", user.id)
    .single();

  if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });

  const { data: client } = await supabase
    .from("clients")
    .select("id, business_name, contact_email")
    .eq("id", clientId)
    .eq("workspace_id", workspace.id)
    .single();

  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  // Create an audit session for this client
  const { data: session, error: sessionError } = await supabase
    .from("audit_sessions")
    .insert({
      workspace_id: workspace.id,
      business_name: client.business_name,
      mode: "self_serve",
      status: "in_progress",
    })
    .select("id")
    .single();

  if (sessionError || !session) {
    return NextResponse.json({ error: "Failed to create audit session" }, { status: 500 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;
  const auditUrl = `${baseUrl}/audit/${session.id}`;

  await sendEmail({
    to: client.contact_email,
    subject: `${workspace.name} has a free AI audit ready for you`,
    html: clientAuditEmail({
      workspaceName: workspace.name,
      clientName: client.business_name,
      auditUrl,
      agencyMessage: message,
    }),
  });

  return NextResponse.json({ ok: true, auditUrl, sessionId: session.id });
}
