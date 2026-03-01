import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "~/lib/supabase/server";
import AuditSession from "./_components/AuditSession";

interface Props {
  params: { sessionId: string };
}

export default async function AuditSessionPage({ params }: Props) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirectTo=/audit/${params.sessionId}`);

  const { data: session } = await supabase
    .from("audit_sessions")
    .select("id, status, question_count, business_name, industry, user_id")
    .eq("id", params.sessionId)
    .single();

  if (!session || session.user_id !== user.id) redirect("/dashboard");

  // If already complete, redirect to report
  if (session.status === "complete") {
    const { data: report } = await supabase
      .from("reports")
      .select("id")
      .eq("session_id", session.id)
      .single();
    if (report) redirect(`/report/${report.id}`);
  }

  const isProcessing = session.status === "processing";

  return (
    <AuditSession
      sessionId={session.id}
      businessName={session.business_name}
      initialAnswerCount={session.question_count ?? 0}
      startProcessing={isProcessing}
    />
  );
}
