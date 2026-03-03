import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "~/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    fullName,
    companyName,
    industry,
    companySize,
    role,
    challenge,
    usageMode,
    workspaceName,
  } = body;

  // Determine user_type and has_agency from usageMode
  let user_type: "direct" | "agency_owner" = "direct";
  let has_agency = false;

  if (usageMode === "clients") {
    user_type = "agency_owner";
  } else if (usageMode === "both") {
    user_type = "direct";
    has_agency = true;
  }

  // Update profile with all onboarding fields
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: fullName || null,
      company_name: companyName || null,
      industry: industry || null,
      company_size: companySize || null,
      role: role || null,
      challenge: challenge || null,
      user_type,
      has_agency,
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  // Create workspace for agency users
  if (user_type === "agency_owner" || has_agency) {
    const { data: existingWs } = await supabase
      .from("workspaces")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!existingWs) {
      const wsName = workspaceName?.trim() || companyName || "My Agency";
      await supabase.from("workspaces").insert({
        owner_id: user.id,
        name: wsName,
        plan: "starter",
      });
    }
  }

  // For pure direct users: create first audit session and redirect there
  if (user_type === "direct" && !has_agency) {
    const { data: session } = await supabase
      .from("audit_sessions")
      .insert({
        user_id: user.id,
        mode: "self_serve",
        status: "in_progress",
        business_name: companyName || "My Business",
        industry: industry || null,
      })
      .select("id")
      .single();

    if (session) {
      // Fire-and-forget welcome email
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/send-welcome`, { method: "POST" }).catch(() => {});
      return NextResponse.json({ redirect: `/audit/${session.id}` });
    }
  }

  // Agency / both users → dashboard
  fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/send-welcome`, { method: "POST" }).catch(() => {});
  return NextResponse.json({ redirect: "/dashboard" });
}
