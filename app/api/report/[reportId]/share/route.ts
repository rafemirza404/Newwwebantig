import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "~/lib/supabase/server";

export async function POST(
  _req: Request,
  { params }: { params: { reportId: string } }
) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify ownership
  const { data: report } = await supabase
    .from("reports")
    .select("id, user_id, share_token, is_shared")
    .eq("id", params.reportId)
    .single();

  if (!report || report.user_id !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Reuse existing token if already shared, otherwise generate new one
  let token: string = report.share_token;
  if (!token) {
    token = crypto.randomUUID();
    await supabase
      .from("reports")
      .update({ share_token: token, is_shared: true })
      .eq("id", params.reportId);
  } else if (!report.is_shared) {
    await supabase
      .from("reports")
      .update({ is_shared: true })
      .eq("id", params.reportId);
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const shareUrl = `${baseUrl}/report/${params.reportId}?token=${token}`;

  return NextResponse.json({ shareUrl });
}
