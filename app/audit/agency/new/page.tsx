import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "~/lib/supabase/server";

export default async function AgencyNewAuditPage({
  searchParams,
}: {
  searchParams: { clientId?: string };
}) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/dashboard/clients");

  const { clientId } = searchParams;
  if (!clientId) redirect("/dashboard/clients");

  // Get the client to confirm it belongs to this user's workspace
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!workspace) redirect("/dashboard");

  const { data: client } = await supabase
    .from("clients")
    .select("id, business_name, industry")
    .eq("id", clientId)
    .eq("workspace_id", workspace.id)
    .maybeSingle();

  if (!client) redirect("/dashboard/clients");

  const { data: session, error } = await supabase
    .from("audit_sessions")
    .insert({
      user_id: user.id,
      workspace_id: workspace.id,
      client_id: client.id,
      mode: "self_serve",
      status: "in_progress",
      business_name: client.business_name,
      industry: client.industry ?? null,
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
    redirect("/dashboard/clients");
  }

  redirect(`/audit/${session.id}`);
}
