import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
          set(name, value, options) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name, options) {
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Always fetch profile — needed for both portal client detection and onboarding check
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed_at, user_type")
        .eq("id", data.user.id)
        .maybeSingle();

      // Portal client users — redirect to portal, never onboarding
      // Check both user_metadata (new users) and profile user_type (all users)
      const isClient =
        data.user.user_metadata?.user_type === "client" ||
        profile?.user_type === "client";
      if (isClient) {
        return NextResponse.redirect(`${origin}/portal`);
      }

      // Detect new agency/direct users who haven't completed onboarding
      if (next !== "/onboarding" && !profile?.onboarding_completed_at) {
        return NextResponse.redirect(`${origin}/onboarding`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth_callback`);
}
