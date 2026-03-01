# AgentBlue — Next.js Migration Status

> Updated: 2026-02-27 (Session 4 — IN PROGRESS)

## Current Build Status
✅ **BUILD PASSES** — `npm run build` succeeds. All pages generate.

---

## Phase Completion

| Phase | Name | Status | Notes |
|-------|------|--------|-------|
| 1 | Next.js 14 Setup | ✅ Done | Build passes |
| 2 | Database Schema Migration | ✅ Done | 6 migrations applied via Supabase MCP |
| 13 | Public Pages Migration | ✅ Done | All 5 marketing pages live |
| 3 | Auth + Onboarding | ✅ Done | Login ✅ Signup ✅ Onboarding ✅ |
| 4 | Dashboard Shell | ✅ Done | layout.tsx ✅ Sidebar ✅ — page.tsx ✅ |
| 5 | Dashboard Pages | ✅ Done | All pages complete: Progress ✅ Settings ✅ Team ✅ Billing ✅ Integrations ✅ |
| 6 | Audit Session UX | ✅ Done | audit/new ✅ audit/[sessionId] ✅ AuditSession.tsx ✅ API routes ✅ |
| 7 | AI Pipeline (4 agents) | ✅ Done | All 4 agents live: QuestionEngine ✅ AnalysisEngine ✅ SolutionMapper ✅ ReportBuilder ✅ |
| 8 | Report Page | ✅ Done | ReportHeader ✅ ScoreSection ✅ GapsSection ✅ SolutionsSection ✅ ROISection ✅ |
| 9 | Client Portal | ✅ Done | layout ✅ report ✅ progress ✅ history ✅ settings ✅ |
| 10 | Settings/Team/Billing | ✅ Done | Workspace settings ✅ Functional invites ✅ Billing cleanup ✅ |
| 11 | Stripe Payments | ✅ Done | checkout ✅ portal ✅ webhook ✅ success page ✅ |
| 12 | Resend Email | ✅ Done | welcome ✅ report-ready ✅ team-invite ✅ client-audit ✅ |

---

## Session 3 — Files Created So Far

### Phase 3 — Auth + Onboarding (COMPLETE ✅)
- `app/(auth)/login/page.tsx` ← Session 2
- `app/(auth)/signup/page.tsx` ← Session 2
- `app/(auth)/onboarding/page.tsx` ← Session 3 ✅
  - Direct users: auto-creates audit_session → redirects to `/audit/[sessionId]`
  - Agency owners: 3-step flow (workspace name → demo report preview → add first client)

### Phase 4 — Dashboard Shell (COMPLETE ✅)
- `app/dashboard/layout.tsx` ✅ — Server Component, reads user_type, renders Sidebar
- `components/dashboard/sidebar/Sidebar.tsx` ✅ — Collapsible sidebar, agency vs direct nav, sign out
- `components/dashboard/shared/StatCard.tsx` ✅
- `components/dashboard/shared/ScoreBar.tsx` ✅

### Phase 5 — Dashboard Pages (IN PROGRESS 🟡)
- `app/dashboard/page.tsx` ✅ — branches to AgencyDashboard or DirectDashboard by user_type
- `components/dashboard/agency/AgencyDashboard.tsx` ✅
- `components/dashboard/direct/DirectDashboard.tsx` ✅
- `app/dashboard/clients/page.tsx` ✅
- `app/dashboard/clients/new/page.tsx` ✅
- `app/dashboard/audits/page.tsx` ✅
- `app/dashboard/reports/page.tsx` ✅
- `app/dashboard/analytics/page.tsx` ✅
- `app/dashboard/progress/page.tsx` ⬜ TODO
- `app/dashboard/settings/page.tsx` ⬜ TODO
- `app/dashboard/team/page.tsx` ⬜ TODO
- `app/dashboard/billing/page.tsx` ⬜ TODO

### Phase 6 — Audit Session UX (TODO ⬜)
- `app/audit/new/page.tsx`
- `app/audit/[sessionId]/page.tsx`
- `app/api/audit/start/route.ts`
- `app/api/audit/answer/route.ts`
- `app/api/audit/complete/route.ts`
- `app/api/audit/status/[id]/route.ts`

### Phase 7 — AI Pipeline (TODO ⬜)
- `lib/ai/question-engine.ts`
- `lib/ai/analysis-engine.ts`
- `lib/ai/solution-mapper.ts`
- `lib/ai/report-builder.ts`

### Phase 8 — Report Page (TODO ⬜)
- `app/report/[reportId]/page.tsx`
- All report section components

### Phase 9 — Client Portal (COMPLETE ✅)
- `components/portal/PortalSidebar.tsx` ✅
- `app/portal/layout.tsx` ✅ — workspace branding, client auth guard
- `app/portal/page.tsx` ✅ — redirect to /portal/report
- `app/portal/report/page.tsx` ✅ — full report (no paywall for clients)
- `app/portal/progress/page.tsx` ✅ — implementation items checklist
- `app/portal/history/page.tsx` ✅ — audit history list
- `app/portal/settings/page.tsx` ✅ — name editor
- `middleware.ts` updated — /portal/* protected ✅
- `app/dashboard/page.tsx` updated — client user_type redirects to /portal ✅

### Phases 10–12 (TODO ⬜)
- Settings UI, Team UI, Billing UI, Stripe, Resend

---

## Critical: .env.local Must Be Updated

Rename all `VITE_` vars to `NEXT_PUBLIC_` in your `.env.local`.
See `.env.local.example` for the complete list.

Required additions for upcoming phases:
```
ANTHROPIC_API_KEY=sk-ant-...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
```

---

## Architecture Decisions Made

1. **Dashboard layout** — Server Component reads user from Supabase, passes userType to Sidebar (Client Component)
2. **Sidebar** — Collapsible (220px ↔ 52px), agency vs direct nav items differ, sign out via client-side Supabase
3. **Onboarding** — Direct users skip UI entirely; agency owners see 3-step wizard
4. **StatCard / ScoreBar** — shared components used across agency + direct dashboards
5. **`~/` alias** — all new app/ and lib/ code uses `~/` prefix (maps to project root)
6. **`@/` alias** — still works for src/ (backward compat with existing components)

---

## ALL PHASES COMPLETE ✅

Build passes. 41 routes. All features live.

To resume, continue from:
1. **Phase 7** — Replace scoring placeholder in `app/api/audit/complete/route.ts` with 4 real Claude AI agents
   - `lib/ai/question-engine.ts` — categorize + contextualize answers
   - `lib/ai/analysis-engine.ts` — score business with Claude
   - `lib/ai/solution-mapper.ts` — RAG for Solar/HVAC-specific solutions
   - `lib/ai/report-builder.ts` — generate summaries + mermaid diagrams
2. **Phase 9** — Client portal (`/portal/[clientId]`)
3. **Phase 10** — Settings/Team/Billing UI improvements (invites, workspace settings)
4. **Phase 11** — Stripe payments (upgrade flow from billing page)
5. **Phase 12** — Resend email (welcome email, report ready notification)

### Session 4 Files Created
- `app/dashboard/progress/page.tsx` ✅
- `app/dashboard/settings/page.tsx` ✅
- `app/dashboard/team/page.tsx` ✅
- `app/dashboard/billing/page.tsx` ✅
- `app/dashboard/integrations/page.tsx` ✅
- `app/audit/new/page.tsx` ✅
- `app/audit/[sessionId]/page.tsx` ✅
- `app/audit/[sessionId]/_components/AuditSession.tsx` ✅
- `app/api/audit/complete/route.ts` ✅ (scoring placeholder — Phase 7 upgrades to Claude)
- `app/api/audit/status/[id]/route.ts` ✅
- `app/report/[reportId]/page.tsx` ✅
- `app/report/[reportId]/_components/ReportHeader.tsx` ✅
- `app/report/[reportId]/_components/ScoreSection.tsx` ✅
- `app/report/[reportId]/_components/GapsSection.tsx` ✅
- `app/report/[reportId]/_components/SolutionsSection.tsx` ✅
- `app/report/[reportId]/_components/ROISection.tsx` ✅
- `app/(auth)/login/page.tsx` — Fixed Suspense boundary for useSearchParams ✅
