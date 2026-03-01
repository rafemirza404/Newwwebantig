import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "~/lib/supabase/server";
import { sendEmail } from "~/lib/email";
import { welcomeEmail } from "~/lib/emails/welcome";

export async function POST() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, user_type")
    .eq("id", user.id)
    .single();

  const userType = (profile?.user_type ?? "direct") as "direct" | "agency_owner";
  const name = profile?.full_name ?? user.email ?? "there";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:8080";

  await sendEmail({
    to: user.email!,
    subject: "Welcome to AgentBlue",
    html: welcomeEmail({
      name,
      dashboardUrl: `${baseUrl}/dashboard`,
      userType,
    }),
  });

  return NextResponse.json({ ok: true });
}
