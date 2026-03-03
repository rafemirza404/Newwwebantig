import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "~/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceName } = await req.json();
  if (!workspaceName?.trim()) {
    return NextResponse.json({ error: "Workspace name is required" }, { status: 400 });
  }

  // Check current profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("has_agency, user_type")
    .eq("id", user.id)
    .single();

  if (profile?.has_agency) {
    return NextResponse.json({ error: "Agency mode is already active" }, { status: 409 });
  }

  // Create workspace if one doesn't exist yet
  const { data: existingWs } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!existingWs) {
    const { error: wsError } = await supabase
      .from("workspaces")
      .insert({
        owner_id: user.id,
        name: workspaceName.trim(),
        plan: "starter",
      });

    if (wsError) {
      return NextResponse.json({ error: wsError.message }, { status: 500 });
    }
  }

  // Flip has_agency flag
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ has_agency: true })
    .eq("id", user.id);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
