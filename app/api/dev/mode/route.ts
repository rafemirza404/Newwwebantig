import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { mode } = await req.json();
  const allowed = ["direct", "agency_owner", "clear"];
  if (!allowed.includes(mode)) {
    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true });
  if (mode === "clear") {
    res.cookies.delete("dev_mode_override");
  } else {
    res.cookies.set("dev_mode_override", mode, {
      path: "/",
      httpOnly: false,
      maxAge: 60 * 60 * 24, // 24 hours
    });
  }
  return res;
}
