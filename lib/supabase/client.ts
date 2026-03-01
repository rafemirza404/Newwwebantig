"use client";

import { createBrowserClient } from "@supabase/ssr";

// Singleton browser client for Client Components
let client: ReturnType<typeof createBrowserClient> | null = null;

export function createSupabaseClient() {
  if (client) return client;

  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return client;
}

// Shared types
export type UserType =
  | "direct"
  | "agency_owner"
  | "team_member"
  | "client"
  | "super_admin";

export type UserPlan = "free" | "pro";

export type WorkspacePlan = "starter" | "growth" | "scale";

export type AuditStatus =
  | "in_progress"
  | "processing"
  | "complete"
  | "abandoned";

export type AuditMode = "self_serve" | "guided";

export type ItemPriority = "quick_win" | "medium" | "strategic";

export type ItemStatus = "not_started" | "in_progress" | "done";

export type WorkspaceMemberRole = "admin" | "analyst" | "viewer";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  company_name: string | null;
  industry: string | null;
  user_type: UserType;
  plan: UserPlan;
  audit_count: number;
  stripe_id: string | null;
  created_at: string;
}

export interface Workspace {
  id: string;
  owner_id: string;
  name: string;
  logo_url: string | null;
  brand_color: string | null;
  plan: WorkspacePlan;
  created_at: string;
}

export interface Client {
  id: string;
  workspace_id: string;
  business_name: string;
  contact_email: string;
  industry: string | null;
  company_size: string | null;
  client_user_id: string | null;
  created_at: string;
}

export interface AuditSession {
  id: string;
  user_id: string;
  client_id: string | null;
  workspace_id: string | null;
  mode: AuditMode;
  status: AuditStatus;
  business_name: string;
  industry: string | null;
  company_size: string | null;
  question_count: number;
  started_at: string;
  completed_at: string | null;
}

export interface AuditAnswer {
  id: string;
  session_id: string;
  question_text: string;
  answer_text: string;
  question_category: string | null;
  question_order: number;
  created_at: string;
}

export interface Report {
  id: string;
  session_id: string;
  user_id: string;
  overall_score: number | null;
  function_scores: Record<string, number>;
  business_summary: string | null;
  gaps_preview: unknown[];
  teaser_gap: unknown | null;
  full_gaps: unknown[];
  solutions: unknown[];
  roi_analysis: Record<string, unknown>;
  mermaid_before: string | null;
  mermaid_after: string | null;
  implementation_plan: string | null;
  created_at: string;
}

export interface ImplementationItem {
  id: string;
  report_id: string;
  user_id: string;
  gap_name: string;
  priority: ItemPriority;
  time_saved_hrs: number | null;
  status: ItemStatus;
  completed_at: string | null;
}
