import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "~/lib/supabase/server";

export default async function NewAuditPage() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/audit/new");

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_name, industry")
    .eq("id", user.id)
    .single();

  const { data: session, error } = await supabase
    .from("audit_sessions")
    .insert({
      user_id: user.id,
      mode: "self_serve",
      status: "in_progress",
      business_name: profile?.company_name ?? "My Business",
      industry: profile?.industry ?? null,
      question_count: 0,
      coverage_status: {
        sales: "uncovered",
        customer_onboarding: "uncovered",
        operations: "uncovered",
        finance: "uncovered",
        customer_support: "uncovered",
        marketing: "uncovered",
        hr: "uncovered",
        data_reporting: "uncovered",
      },
    })
    .select("id")
    .single();

  if (error || !session) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="text-center w-full max-w-sm bg-card border-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl p-8">
          <p className="text-destructive font-semibold text-[15px] mb-6">Failed to start audit session.</p>
          <a href="/dashboard" className="inline-flex items-center justify-center px-6 py-3 bg-secondary hover:bg-secondary/80 text-foreground text-sm font-semibold rounded-full shadow-sm transition-colors">
            ← Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  redirect(`/audit/${session.id}`);
}
