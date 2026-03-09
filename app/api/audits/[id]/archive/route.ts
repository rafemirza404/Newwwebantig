import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "~/lib/supabase/server";

// PATCH /api/audits/[id]/archive — toggle archived_at (archive or restore)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = params;

    // Verify ownership
    const { data: session } = await supabase
      .from("audit_sessions")
      .select("id, archived_at")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { action } = await req.json().catch(() => ({ action: null }));

    // If action is "restore" or current archived_at is set → restore; otherwise archive
    const isCurrentlyArchived = session.archived_at !== null;
    const shouldRestore = action === "restore" || isCurrentlyArchived;

    await supabase
      .from("audit_sessions")
      .update({ archived_at: shouldRestore ? null : new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id);

    return NextResponse.json({ ok: true, archived: !shouldRestore });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
