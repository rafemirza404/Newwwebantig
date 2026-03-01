/**
 * Environment Configuration — Next.js compatible
 * Uses process.env with NEXT_PUBLIC_ prefix (replaces VITE_ prefix)
 */

const get = (key: string, fallback = ""): string =>
  (typeof process !== "undefined" && process.env[key]) || fallback;

export const ENV = {
  vapi: {
    apiKey: get("NEXT_PUBLIC_VAPI_API_KEY"),
    assistantId: get("NEXT_PUBLIC_VAPI_ASSISTANT_ID"),
  },
  webhooks: {
    checkEligibility: get("NEXT_PUBLIC_N8N_CHECK_ELIGIBILITY"),
    saveProfile: get("NEXT_PUBLIC_N8N_SAVE_PROFILE"),
    lookupUser: get("NEXT_PUBLIC_N8N_LOOKUP_USER"),
    saveCallRecord: get("NEXT_PUBLIC_N8N_SAVE_CALL_RECORD"),
    chatbot: get("NEXT_PUBLIC_N8N_CHATBOT"),
    contactForm: get("NEXT_PUBLIC_N8N_CONTACT_FORM"),
  },
  app: {
    name: get("NEXT_PUBLIC_APP_NAME", "AgentBlue"),
    contactEmail: get("NEXT_PUBLIC_CONTACT_EMAIL", "sophia@supportagentblue.in"),
  },
  supabase: {
    url: get("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: get("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  },
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
} as const;
