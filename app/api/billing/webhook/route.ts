import { NextRequest, NextResponse } from "next/server";
import { stripe, planFromPriceId } from "~/lib/stripe";
import { createSupabaseServerClient } from "~/lib/supabase/server";
import type Stripe from "stripe";

// Disable body parsing — Stripe needs the raw body for signature verification
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("[webhook] Invalid signature:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const userId = session.metadata?.user_id;
        const priceKey = session.metadata?.price_key;
        const userType = session.metadata?.user_type as "direct" | "agency_owner" | undefined;
        const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
        const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

        if (!userId || !priceKey || !userType) break;

        if (userType === "agency_owner") {
          const planKey = priceKey.replace("agency_", "");
          const { data: workspace } = await supabase
            .from("workspaces")
            .select("id")
            .eq("owner_id", userId)
            .single();

          if (workspace) {
            const { error: wsError } = await supabase
              .from("workspaces")
              .update({
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
                plan: planKey,
              })
              .eq("id", workspace.id);

            if (wsError) console.error("[webhook] Failed to update workspace plan:", wsError);
          }
        } else {
          const planKey = priceKey.replace("direct_", "");
          const { error: profileError } = await supabase
            .from("profiles")
            .update({
              stripe_id: customerId,
              stripe_subscription_id: subscriptionId,
              plan: planKey,
            })
            .eq("id", userId);

          if (profileError) console.error("[webhook] Failed to update profile plan:", profileError);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;
        const userType = subscription.metadata?.user_type as "direct" | "agency_owner" | undefined;

        if (!userId) break;

        const priceId = subscription.items.data[0]?.price?.id;
        const mapped = priceId ? planFromPriceId(priceId) : null;

        const isActive = ["active", "trialing"].includes(subscription.status);

        if (userType === "agency_owner") {
          const planKey = mapped?.plan ?? null;
          const { data: workspace } = await supabase
            .from("workspaces")
            .select("id")
            .eq("owner_id", userId)
            .single();

          if (workspace && planKey && isActive) {
            const { error: wsError } = await supabase
              .from("workspaces")
              .update({ plan: planKey })
              .eq("id", workspace.id);

            if (wsError) console.error("[webhook] Failed to update workspace subscription:", wsError);
          }
        } else {
          const planKey = mapped?.plan ?? null;
          if (planKey && isActive) {
            const { error: profileError } = await supabase
              .from("profiles")
              .update({ plan: planKey })
              .eq("id", userId);

            if (profileError) console.error("[webhook] Failed to update profile subscription:", profileError);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;
        const userType = subscription.metadata?.user_type as "direct" | "agency_owner" | undefined;

        if (!userId) break;

        if (userType === "agency_owner") {
          const { data: workspace } = await supabase
            .from("workspaces")
            .select("id")
            .eq("owner_id", userId)
            .single();

          if (workspace) {
            const { error: wsError } = await supabase
              .from("workspaces")
              .update({ plan: "starter", stripe_subscription_id: null })
              .eq("id", workspace.id);

            if (wsError) console.error("[webhook] Failed to downgrade workspace:", wsError);
          }
        } else {
          const { error: profileError } = await supabase
            .from("profiles")
            .update({ plan: "free", stripe_subscription_id: null })
            .eq("id", userId);

          if (profileError) console.error("[webhook] Failed to downgrade profile:", profileError);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.warn("[webhook] Payment failed for customer:", invoice.customer);
        break;
      }

      default:
        // Unhandled event — return 200 so Stripe doesn't retry
        break;
    }
  } catch (err) {
    console.error("[webhook] Handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
