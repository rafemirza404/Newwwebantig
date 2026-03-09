import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "~/lib/supabase/server";
import { CheckCircle2 } from "lucide-react";

export default async function PortalWelcomePage() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/portal/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const name = profile?.full_name ?? "there";

  return (
    <div className="min-h-full flex items-center justify-center px-4 py-20">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-primary" />
        </div>

        <h1 className="text-foreground text-[28px] font-bold tracking-tight mb-2">
          Welcome, {name}!
        </h1>
        <h2 className="text-foreground text-[20px] font-medium mb-3">Your report is ready.</h2>
        <p className="text-muted-foreground text-[15px] leading-relaxed mb-2">
          Your advisor has completed your AI audit. Explore your results below.
        </p>
        <p className="text-muted-foreground text-[14px] mb-8">
          Bookmark this page's URL to return anytime — or check your email for the login link.
        </p>

        <Link
          href="/portal/report"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-white font-semibold text-[15px] transition-colors"
          style={{ backgroundColor: "var(--brand-color, #7C6EF8)" }}
        >
          View My Report →
        </Link>
      </div>
    </div>
  );
}
