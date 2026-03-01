import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "~/lib/supabase/server";
import { stripe, PRICE_IDS } from "~/lib/stripe";

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }

  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { priceKey } = await req.json() as { priceKey: string };
  const priceId = PRICE_IDS[priceKey];

  if (!priceId) {
    return NextResponse.json(
      { error: `Price key "${priceKey}" is not configured. Add STRIPE_PRICE_${priceKey.toUpperCase()} to .env.local.` },
      { status: 400 }
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type, stripe_id, email")
    .eq("id", user.id)
    .single();

  const isAgency = profile?.user_type === "agency_owner";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;

  // For agency plans, use workspace's stripe_customer_id; for direct, use profile.stripe_id
  let customerId: string | undefined;

  if (isAgency) {
    const { data: workspace } = await supabase
      .from("workspaces")
      .select("id, stripe_customer_id")
      .eq("owner_id", user.id)
      .single();

    if (workspace?.stripe_customer_id) {
      customerId = workspace.stripe_customer_id;
    }
  } else {
    customerId = profile?.stripe_id ?? undefined;
  }

  // Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    ...(customerId ? { customer: customerId } : { customer_email: user.email }),
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/dashboard/billing`,
    metadata: {
      user_id: user.id,
      price_key: priceKey,
      user_type: profile?.user_type ?? "direct",
    },
    subscription_data: {
      metadata: {
        user_id: user.id,
        price_key: priceKey,
        user_type: profile?.user_type ?? "direct",
      },
    },
  });

  return NextResponse.json({ url: session.url });
}
