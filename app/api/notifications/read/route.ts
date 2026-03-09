import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "~/lib/supabase/server";

export async function PATCH(req: NextRequest) {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    if (body.all) {
        await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("user_id", user.id)
            .eq("is_read", false);
    } else if (Array.isArray(body.ids) && body.ids.length > 0) {
        await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("user_id", user.id)
            .in("id", body.ids);
    }

    return NextResponse.json({ ok: true });
}
