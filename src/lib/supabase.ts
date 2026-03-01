"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _instance: SupabaseClient | null = null;

function getUrl() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.VITE_SUPABASE_URL ??
    ""
  );
}

function getKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.VITE_SUPABASE_ANON_KEY ??
    ""
  );
}

export function getSupabase(): SupabaseClient {
  if (!_instance) {
    const url = getUrl();
    const key = getKey();
    if (!url || !key) {
      // During SSR / build — return a stub that won't explode
      // Real client created client-side when env vars are available
      if (typeof window === "undefined") {
        // Return a safe placeholder during server render
        return {} as SupabaseClient;
      }
    }
    _instance = createClient(url, key);
  }
  return _instance;
}

// Named export for backward compat — always call via function, never module-scope
export const supabase = {
  get auth() { return getSupabase().auth; },
  get from() { return getSupabase().from.bind(getSupabase()); },
  get rpc() { return getSupabase().rpc.bind(getSupabase()); },
  get storage() { return getSupabase().storage; },
  get realtime() { return getSupabase().realtime; },
  get channel() { return getSupabase().channel.bind(getSupabase()); },
  get removeChannel() { return getSupabase().removeChannel.bind(getSupabase()); },
};

// Types
export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  company_name: string | null;
  industry: string | null;
  user_type?: string;
  plan?: string;
  audit_count?: number;
  stripe_id?: string | null;
  created_at: string;
};

export type Audit = {
  id: string;
  user_id: string;
  status: "in_progress" | "completed";
  recommendations: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type AuditMessage = {
  id: string;
  audit_id: string;
  role: "bot" | "user";
  content: string;
  created_at: string;
};
