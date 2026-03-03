import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { mode } = await req.json();
  const allowed = ["direct", "agency_owner", "clear"];
  if (!allowed.includes(mode)) {
    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true });
  if (mode === "clear") {
    res.cookies.delete("view_mode");
  } else {
    res.cookies.set("view_mode", mode, {
      path: "/",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30, // 30 days — persists across sessions
    });
  }
  return res;
}
