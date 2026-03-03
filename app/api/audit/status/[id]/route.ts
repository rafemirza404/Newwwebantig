import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "~/lib/supabase/server";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: session } = await supabase
    .from("audit_sessions")
    .select("id, status, pipeline_stage, user_id")
    .eq("id", params.id)
    .single();

  if (!session || session.user_id !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (session.status === "complete") {
    const { data: report } = await supabase
      .from("reports")
      .select("id")
      .eq("session_id", session.id)
      .single();
    return NextResponse.json({ status: "complete", reportId: report?.id ?? null });
  }

  // Surface pipeline failure or stuck state to client so it can stop polling
  if (session.pipeline_stage === "failed") {
    return NextResponse.json({ status: "failed" });
  }

  // Detect stuck state: pipeline never got off the ground on a previous attempt
  // (pipeline_stage="starting" + status="in_progress" means the retry itself failed)
  if (session.status === "in_progress" && session.pipeline_stage === "starting") {
    return NextResponse.json({ status: "failed" });
  }

  return NextResponse.json({ status: session.status });
}
