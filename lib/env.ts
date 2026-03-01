/**
 * Environment Configuration for Next.js
 * NEXT_PUBLIC_ vars are safe to use client-side.
 * Non-prefixed vars are server-only (API routes / Server Components).
 */

// Client-safe env vars
export const CLIENT_ENV = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  },
  vapi: {
    apiKey: process.env.NEXT_PUBLIC_VAPI_API_KEY ?? "",
    assistantId: process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID ?? "",
  },
  webhooks: {
    checkEligibility: process.env.NEXT_PUBLIC_N8N_CHECK_ELIGIBILITY ?? "",
    saveProfile: process.env.NEXT_PUBLIC_N8N_SAVE_PROFILE ?? "",
    lookupUser: process.env.NEXT_PUBLIC_N8N_LOOKUP_USER ?? "",
    saveCallRecord: process.env.NEXT_PUBLIC_N8N_SAVE_CALL_RECORD ?? "",
    chatbot: process.env.NEXT_PUBLIC_N8N_CHATBOT ?? "",
    contactForm: process.env.NEXT_PUBLIC_N8N_CONTACT_FORM ?? "",
  },
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME ?? "AgentBlue",
    contactEmail:
      process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "sophia@supportagentblue.in",
  },
  stripe: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
  },
} as const;

// Server-only env vars (never import from client components)
export const SERVER_ENV = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY ?? "",
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY ?? "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY ?? "",
  },
} as const;
