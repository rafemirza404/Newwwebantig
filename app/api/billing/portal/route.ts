import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "~/lib/supabase/server";
import { stripe } from "~/lib/stripe";

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }

  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type, stripe_id")
    .eq("id", user.id)
    .single();

  const isAgency = profile?.user_type === "agency_owner";
  let customerId: string | null = null;

  if (isAgency) {
    const { data: workspace } = await supabase
      .from("workspaces")
      .select("stripe_customer_id")
      .eq("owner_id", user.id)
      .single();
    customerId = workspace?.stripe_customer_id ?? null;
  } else {
    customerId = profile?.stripe_id ?? null;
  }

  if (!customerId) {
    return NextResponse.json({ error: "No Stripe customer found" }, { status: 404 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${baseUrl}/dashboard/billing`,
  });

  return NextResponse.json({ url: session.url });
}
