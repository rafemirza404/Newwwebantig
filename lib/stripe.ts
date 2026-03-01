import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("[stripe] STRIPE_SECRET_KEY is not set — Stripe features will be disabled.");
}

// Singleton — re-used across hot reloads in dev
const globalForStripe = globalThis as unknown as { stripe?: Stripe };

export const stripe =
  globalForStripe.stripe ??
  (process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-12-18.acacia" })
    : null);

if (process.env.NODE_ENV !== "production" && stripe) {
  globalForStripe.stripe = stripe;
}

// ─── Price ID map ──────────────────────────────────────────────────────────
// Set these in .env.local after creating products in your Stripe dashboard.
export const PRICE_IDS: Record<string, string | undefined> = {
  // Direct plans
  direct_pro: process.env.STRIPE_PRICE_DIRECT_PRO,
  // Agency plans
  agency_starter: process.env.STRIPE_PRICE_AGENCY_STARTER,
  agency_growth: process.env.STRIPE_PRICE_AGENCY_GROWTH,
  agency_scale: process.env.STRIPE_PRICE_AGENCY_SCALE,
};

// Reverse map: priceId → { userType, plan }
export function planFromPriceId(priceId: string): { userType: "direct" | "agency_owner"; plan: string } | null {
  for (const [key, id] of Object.entries(PRICE_IDS)) {
    if (id === priceId) {
      if (key.startsWith("direct_")) {
        return { userType: "direct", plan: key.replace("direct_", "") };
      }
      if (key.startsWith("agency_")) {
        return { userType: "agency_owner", plan: key.replace("agency_", "") };
      }
    }
  }
  return null;
}
