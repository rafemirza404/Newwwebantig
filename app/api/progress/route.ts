import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "~/lib/supabase/server";

// PATCH /api/progress — update status of an implementation item
export async function PATCH(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { itemId, status } = await req.json();
    const validStatuses = ["not_started", "in_progress", "done"];
    if (!itemId || !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid itemId or status" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const updates: Record<string, unknown> = { status };

    if (status === "in_progress") {
      updates.started_at = now;
    } else if (status === "done") {
      updates.completed_at = now;
    } else if (status === "not_started") {
      updates.started_at = null;
      updates.completed_at = null;
    }

    const { error } = await supabase
      .from("implementation_items")
      .update(updates)
      .eq("id", itemId)
      .eq("user_id", user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
