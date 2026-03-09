import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "~/lib/supabase/server";

// PATCH /api/reports — rename a report (sets custom_name on audit_sessions)
// DELETE /api/reports — archive or delete a report
export async function PATCH(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { reportId, name } = await req.json();
    if (!reportId || typeof name !== "string") {
      return NextResponse.json({ error: "Missing reportId or name" }, { status: 400 });
    }

    // Verify ownership
    const { data: report } = await supabase
      .from("reports")
      .select("id, session_id")
      .eq("id", reportId)
      .eq("user_id", user.id)
      .single();

    if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Update the business_name on the linked audit session (as a rename)
    if (report.session_id) {
      await supabase
        .from("audit_sessions")
        .update({ business_name: name.trim() })
        .eq("id", report.session_id)
        .eq("user_id", user.id);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { reportId, action } = await req.json();
    if (!reportId) return NextResponse.json({ error: "Missing reportId" }, { status: 400 });

    // Verify ownership
    const { data: report } = await supabase
      .from("reports")
      .select("id")
      .eq("id", reportId)
      .eq("user_id", user.id)
      .single();

    if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (action === "delete") {
      await supabase.from("reports").delete().eq("id", reportId).eq("user_id", user.id);
    }
    if (action === "archive") {
      await supabase.from("reports").update({ archived_at: new Date().toISOString() }).eq("id", reportId).eq("user_id", user.id);
    }
    if (action === "restore") {
      await supabase.from("reports").update({ archived_at: null }).eq("id", reportId).eq("user_id", user.id);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
