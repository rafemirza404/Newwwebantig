# AgentBlue Project Memory

## Project
Marketing/audit SaaS — `C:\Users\mirza abdul rafe\newwwebAntig`
Branch: `main` (single branch)
Stack: Next.js 14 App Router + TypeScript + Supabase + Tailwind + OpenAI SDK

## 7-Agent Pipeline (IMPLEMENTED ✅)
All 6 background agents + pipeline orchestrator written in `lib/ai/agents/`:
- `question-engine.ts` — Agent 1, SSE streaming, Haiku model, sliding window
- `business-profiler.ts` — Agent 2, Sonnet
- `gap-analyzer.ts` — Agent 3, Sonnet
- `solution-mapper.ts` — Agent 4, Sonnet, per-gap loop + RAG
- `report-assembler.ts` — Agent 5, Sonnet
- `diagram-architect.ts` — Agent 6, Sonnet, Mermaid generation (server basic validation, client mermaid.js)
- `final-compiler.ts` — Agent 7, Haiku, saves to Supabase
- `pipeline.ts` — Orchestrator: 2→3→4→Promise.all([5,6])→7

## Key Architecture Decisions
- `app/api/audit/answer/route.ts` — Returns SSE stream (not JSON). Agent 1 streams question text then `<|META|>` separator then JSON metadata.
- `app/api/audit/complete/route.ts` — Fire-and-forget pipeline. Creates empty report placeholder, returns `{status:"processing", reportId}` immediately. Client polls `/api/audit/status/[id]`.
- `AuditSession.tsx` — Open-ended text input (not multiple choice). Reads SSE stream token-by-token for typing animation.
- `mermaid` npm package installed for client-side diagram rendering in `DiagramSection.tsx`. Server uses basic regex validation only.

## Database Schema (new columns added)
- `case_studies`: workspace_id, business_function added; existing table enhanced
- `audit_sessions`: coverage_status (jsonb), detected_tool_stack (text[]), tool_stack_captured (bool), detected_functions (text[]), pipeline_stage (text)
- `reports`: diagrams (jsonb), roadmap (jsonb), business_profile (jsonb), total_roi_summary (jsonb), comparison_data (jsonb)

## Report Page
`app/report/[reportId]/page.tsx` — Now renders DiagramSection + RoadmapSection for Pro users. Handles both old flat number format and new `{score, industry_average, status}` format for functionScores.

## Seed Script
`scripts/seed-case-studies.ts` — 20 case studies across 8 business functions. Run with `npx ts-node scripts/seed-case-studies.ts`. Embeddings set to null until embedding model configured.

## OpenAI Migration (COMPLETE ✅)
All files switched from Anthropic → OpenAI. Build passes.
Model mapping: claude-haiku → gpt-4o-mini, claude-sonnet → gpt-4o

**Key pattern used:**
- Module-level: `const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? "" });` (needs `?? ""` to avoid build-time throw)
- API call: `client.chat.completions.create({ model, max_tokens, response_format: {type:"json_object"}, messages: [{role:"system",...},{role:"user",...}] })`
- Response text: `response.choices[0]?.message?.content?.trim() ?? ""`
- diagram-architect does NOT use `response_format` (non-JSON output)
- `lib/env.ts` updated: `SERVER_ENV.openai.apiKey` (was `anthropic`)
- `final-compiler.ts` had unused Anthropic client — removed entirely

## Dynamic User Type Plan (COMPLETE ✅)
Plan file: `C:\Users\mirza abdul rafe\.claude\plans\splendid-jumping-wozniak.md`
All items shipped and build passes.
- `dev_mode_override` cookie renamed to `view_mode` everywhere
- `DEMO_AUDITS` split into `DEMO_DIRECT_AUDITS` + `DEMO_AGENCY_AUDITS` (combined re-export kept)
- `DEMO_PROFILE.has_agency = true` added
- Mode switcher pill in `DashboardHeader` — shown when `hasAgency=true`, `[ Business ] [ Agency ]`
- `hasAgency` + `currentMode` props flow: page.tsx → AgencyDashboard/DirectDashboard → DashboardHeader
- "Account Type" section in settings — shows active modes, deactivate flow with confirmation
- Signup step 2 replaced forced choice with optional "I also manage clients" checkbox
- `/pricing` public pricing page created
- `/api/dev/mode` cookie maxAge extended to 30 days

## Dashboard Architecture (CRITICAL)
- `app/dashboard/layout.tsx` — Renders sidebar. MUST read `dev_mode_override` cookie (same as page.tsx) so sidebar nav matches page content. Real `user_type` from DB is the fallback.
- `app/dashboard/page.tsx` — Uses `dev_mode_override` cookie to switch between DirectDashboard/AgencyDashboard. Also checks `searchParams.mode`.
- **Root bug fixed**: Layout was using raw DB `user_type` for sidebar while page used cookie override → sidebar showed wrong nav items for the shown content.
- Sidebar AGN/DIR toggle buttons (dev-only) set `dev_mode_override` cookie → now both layout AND page respect it.
- Agency audits query: by `workspace_id`. Direct audits query: by `user_id`.
- API routes added: `/api/progress` (PATCH status), `/api/reports` (PATCH rename, DELETE archive/delete)

## Onboarding Redesign (COMPLETE ✅)
5-step split-layout onboarding at `app/(auth)/onboarding/page.tsx`.
- Uses `fixed inset-0 z-50` to escape auth layout centering
- Left panel (42%, dark `#0B0F1A`): logo, step-specific headline/sub, feature bullets on step 1
- Right panel: progress bar segments, pill-grid step content, Back/Continue nav
- Steps: name → business (company + industry pills + size pills) → role + challenge (pills) → usage mode → workspace (agency/both only)
- New API: `app/api/auth/complete-onboarding/route.ts` — saves all fields to profiles, creates workspace, creates audit session for direct users, returns `{ redirect }` URL
- DB migration: added `company_size`, `role`, `challenge` columns to `profiles` table
- `usageMode` "self" → user_type: direct | "clients" → agency_owner | "both" → direct + has_agency
- Direct users: auto-creates audit session server-side → redirects to `/audit/[id]`
- Agency/both users: creates workspace → redirects to `/dashboard`

## Build Status
✅ BUILD PASSES — onboarding redesign complete, verified with `npm run build`

## Path Aliases
- `~/` → project root (app/, lib/, etc.)
- `@/` → src/ (legacy marketing site components)

## Key Env Vars Needed
OPENAI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY (for seed script), NEXT_PUBLIC_APP_URL

## What's Ahead (as of 2026-03-03)

### Done ✅
- 7-agent AI pipeline, OpenAI migration, dual user types (Direct/Agency)
- Dashboard (agency + direct views), client management, audits list
- 5-step onboarding with auto-session creation
- Pricing page (`/pricing`) — Free/Pro for direct, Starter/Growth/Scale for agency
- Agency upgrade API (`/api/upgrade/agency`) — flips `has_agency` + creates workspace
- Agency audit creation (`/audit/agency/new`) — creates session linked to a client

### Missing / Next Steps (priority order)
1. **Stripe integration** — Pricing CTAs all go to `/signup`, no payment wall. Upgrade API flips DB flag for free right now.
2. **Plan enforcement** — Nothing checks Free vs Pro vs agency tier before running audits or gating premium report sections.
3. **Report gating** — `app/report/[reportId]` needs to actually block diagrams/roadmap/ROI behind Pro plan check.
4. **PDF export** — Listed as Pro feature, not built.
5. **Email notifications** — No emails on audit complete, report ready, etc.
6. **White-label client portal** — Agency feature listed on pricing, not built.
7. **Production deployment** — No CI/CD or deploy config yet.
