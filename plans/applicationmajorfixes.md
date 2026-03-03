# Application Major Fixes — Master Plan

> **Status:** Phase 1 ✅ complete, Phase 2.1 ✅ complete, Phases 2.2–7 pending.
> **Stack:** Next.js 14 App Router · TypeScript · Supabase · Tailwind · OpenAI
> **Last Updated:** 2026-03-03

---

## Database Schema Overview

12 tables in `public` schema. Key tables and their relationships:

```
profiles (5 rows)
  └── id → auth.users.id
  └── plan: 'free' | 'pro'
  └── user_type: 'direct' | 'agency_owner' | 'team_member' | 'client' | 'super_admin'
  └── has_agency, company_size, role, challenge, onboarding_completed_at

workspaces (2 rows)
  └── owner_id → auth.users.id
  └── plan: 'starter' | 'growth' | 'scale'
  └── name, logo_url, brand_color, stripe_customer_id

clients (1 row)
  └── workspace_id → workspaces.id
  └── client_user_id → auth.users.id (nullable)
  └── business_name, contact_email, industry, company_size

audit_sessions (19 rows)
  └── user_id → auth.users.id
  └── client_id → clients.id (nullable — null for direct mode)
  └── workspace_id → workspaces.id (nullable — null for direct mode)
  └── status: 'in_progress' | 'processing' | 'complete' | 'abandoned'
  └── business_name, industry, company_size, question_count
  └── started_at, completed_at, coverage_status (jsonb), detected_tool_stack, pipeline_stage

audit_answers (69 rows)
  └── session_id → audit_sessions.id
  └── question_text, answer_text, question_category, question_order

reports (3 rows)
  └── session_id → audit_sessions.id (unique — 1:1)
  └── user_id → auth.users.id
  └── overall_score, function_scores (jsonb), business_summary
  └── gaps_preview (jsonb), full_gaps (jsonb), solutions (jsonb)
  └── roi_analysis (jsonb), mermaid_before, mermaid_after
  └── diagrams (jsonb), roadmap (jsonb), business_profile (jsonb)
  └── total_roi_summary (jsonb), comparison_data (jsonb)

implementation_items (3 rows)
  └── report_id → reports.id
  └── user_id → auth.users.id
  └── gap_name, priority ('quick_win' | 'medium' | 'strategic')
  └── time_saved_hrs (numeric), status ('not_started' | 'in_progress' | 'done')
  └── completed_at (timestamptz) ← ALREADY EXISTS

Other tables: audits (legacy, 31 rows), audit_messages (legacy, 121 rows),
workspace_members (0 rows), case_studies (0 rows), invites (0 rows)
```

### What's missing from the schema (needed for planned features):
- **No `notifications` table** — needed for Phase 2.3
- **No `started_at` on `implementation_items`** — needed for progress timeline (Phase 3)
- **No archive columns** on `audit_sessions` or `reports` — needed for Phase 5
- **No `share_token` / `is_shared`** on `reports` — needed for Phase 6.2
- **`audit_sessions.status` enum** doesn't include `'archived'` — needs schema update for Phase 5

---

## What's Done ✅

### Phase 1 — Quick UI Fixes (COMPLETE)

| # | Fix | Files Modified | Status |
|---|-----|---------------|--------|
| 1.1 | **Upgrade Pro box X button alignment** — Repositioned from `top-2.5 right-2.5` to `top-3 right-3`, reduced size from `w-6 h-6` to `w-5 h-5` | `components/dashboard/sidebar/Sidebar.tsx` | ✅ Done |
| 1.2 | **Hide Upgrade Pro for Pro users** — Added `userPlan` prop to Sidebar, layout fetches `plan` from `profiles` table, widget hidden when plan is `'pro'` | `components/dashboard/sidebar/Sidebar.tsx`, `app/dashboard/layout.tsx` | ✅ Done |
| 1.3 | **Settings missing onboarding fields** — Added `company_size`, `role`, `challenge` fields to profile form. All three columns already exist on `profiles` table. | `app/dashboard/settings/page.tsx` | ✅ Done |

### Phase 2.1 — Global Header (COMPLETE)

| # | Fix | Files Modified | Status |
|---|-----|---------------|--------|
| 2.1 | **DashboardHeader on all pages** — Created `DashboardHeaderWrapper` client component, placed in `layout.tsx` with sticky positioning + backdrop blur. Removed duplicate from `DirectDashboard.tsx` and `AgencyDashboard.tsx`. | `DashboardHeaderWrapper.tsx` (NEW), `layout.tsx`, `DirectDashboard.tsx`, `AgencyDashboard.tsx` | ✅ Done |

---

## What's Left — Detailed Plans

---

### Phase 2.2 — Functional Search (Cmd+K Command Palette)

**Objective:** Replace the non-functional search stubs with a global Cmd+K command palette.

**Database impact:** None — reads existing `audit_sessions` and `clients` tables.

<task type="auto">
  <name>Create CommandPalette component</name>
  <files>
    components/dashboard/shared/CommandPalette.tsx (NEW)
  </files>
  <action>
    Build a modal overlay using the `cmdk` package.
    - Opens on Cmd+K (Mac) / Ctrl+K (Windows) keyboard shortcut
    - Groups results by type: Pages, Audits, Reports, Clients
    - "Pages" group has static entries: Dashboard, Settings, Billing, Progress, Analytics, Audits, Reports
    - "Audits" group: queries `audit_sessions` table (id, business_name, status)
    - "Reports" group: queries `reports` joined to `audit_sessions` for business_name
    - "Clients" group: queries `clients` table — only shown in agency mode
    - Each result item navigates to its page on click/Enter
    - Escape or clicking outside closes the palette
    - Styled to match existing card/border design tokens
    AVOID: Don't build a custom search — `cmdk` handles keyboard nav, filtering, and a11y.
  </action>
  <verify>
    - `npm run build` passes
    - Cmd+K opens palette on any dashboard page
    - Type a page name → filtered results → Enter navigates
    - Escape closes palette
  </verify>
  <done>Command palette opens globally, searches pages/audits/reports/clients, navigates on selection.</done>
</task>

<task type="auto">
  <name>Wire CommandPalette into layout + remove stubs</name>
  <files>
    app/dashboard/layout.tsx
    components/dashboard/sidebar/Sidebar.tsx
    components/dashboard/shared/DashboardHeader.tsx
  </files>
  <action>
    - Render `<CommandPalette />` in `layout.tsx` (once, globally)
    - In `Sidebar.tsx`: Replace the read-only search input (lines 154–167) with a button that triggers the command palette
    - In `DashboardHeader.tsx`: Replace the search dropdown (lines 141–207) with a button that triggers the command palette
    AVOID: Don't wire search results through props — palette fetches its own data.
  </action>
  <verify>Both sidebar search and header search button open the same command palette.</verify>
  <done>Search is functional everywhere. No more "coming soon" toasts.</done>
</task>

---

### Phase 2.3 — Notification System

**Objective:** Build a real notification system with clickable routing.

**Database impact:** Requires a NEW `notifications` table. No existing table supports this.

<task type="auto">
  <name>Create notifications table</name>
  <files>
    Supabase schema change (new table)
  </files>
  <action>
    Create a new `notifications` table with:
    - `id` (uuid PK, gen_random_uuid)
    - `user_id` (uuid FK → auth.users, NOT NULL, CASCADE delete)
    - `title` (text, NOT NULL)
    - `message` (text, nullable)
    - `type` (text, CHECK: 'audit_complete', 'report_ready', 'client_added', 'system')
    - `href` (text, NOT NULL — the URL to navigate to, e.g. '/report/abc-123')
    - `is_read` (boolean, default false)
    - `created_at` (timestamptz, default now())
    
    Add index on (user_id, created_at DESC). Enable RLS: users can only SELECT and UPDATE their own notifications.
    
    AVOID: Don't use Supabase Realtime yet — start with polling on page load.
  </action>
  <verify>
    - Table exists with correct columns and constraints
    - RLS policies prevent cross-user access
  </verify>
  <done>Notifications table exists with RLS.</done>
</task>

<task type="auto">
  <name>Insert notifications from pipeline + render in header</name>
  <files>
    lib/ai/agents/final-compiler.ts (or wherever report is saved)
    components/dashboard/shared/DashboardHeaderWrapper.tsx
    components/dashboard/shared/DashboardHeader.tsx
  </files>
  <action>
    **Pipeline integration:** After saving a report to the `reports` table, INSERT a notification with type='report_ready' and href='/report/{report_id}'.

    **Header integration:**
    - In `DashboardHeaderWrapper.tsx`: Fetch from `notifications` (order by created_at DESC, limit 10)
    - In `DashboardHeader.tsx`: Make each notification a clickable Link to `n.href`
    - Add "Mark all read" button
    - Show unread count badge on bell icon
    - Click notification → mark as read (UPDATE is_read=true) + navigate to href
    AVOID: Don't remove existing notification interface — extend it.
  </action>
  <verify>
    - Bell icon shows unread count
    - Clicking notification navigates correctly
    - "Mark all read" clears the badge
  </verify>
  <done>Notifications are real, clickable, and route to correct pages.</done>
</task>

---

### Phase 3 — Progress Tracking Redesign

**Objective:** Replace the click-to-cycle progress page with timeline tracking + KPI dashboard.

**Database impact:**
- `implementation_items` already has `completed_at` ✅ and `status` (not_started / in_progress / done) ✅
- **Needs:** `started_at` (timestamptz, nullable) column — to track when work begins
- **Needs:** `notes` (text, nullable) column — optional user notes per item

<task type="auto">
  <name>Add started_at and notes columns to implementation_items</name>
  <files>
    Supabase schema change (alter table)
  </files>
  <action>
    Add two nullable columns to `implementation_items`:
    - `started_at` (timestamptz) — set to now() when status changes to 'in_progress'
    - `notes` (text) — optional user notes per recommendation
    
    `completed_at` already exists on this table ✅ — no need to add it.
  </action>
  <verify>Both new columns exist on implementation_items.</verify>
  <done>Time tracking schema ready for UI integration.</done>
</task>

<task type="auto">
  <name>Redesign progress page with timeline + KPI overview</name>
  <files>
    app/dashboard/progress/page.tsx (REWRITE)
  </files>
  <action>
    Complete rewrite of the progress page. Data comes from `implementation_items` joined to `reports`.

    **1. KPI Summary Row (top):**
    - Total time saved (SUM of `time_saved_hrs` WHERE status='done')
    - Items completed this week / this month (based on `completed_at`)
    - Completion rate (done / total %)
    - Trend arrow (up/down vs previous period)

    **2. Status change with confirmation:**
    - Replace click-to-cycle with dropdown (Not Started → In Progress → Done)
    - "Mark as Done" shows confirmation dialog
    - In Progress → auto-sets `started_at = now()`
    - Done → auto-sets `completed_at = now()`
    - Reverting to Not Started → clears both timestamps

    **3. Timeline view (bottom):**
    - Filter: Week | Month | Quarter | All Time
    - Shows completed items chronologically (ordered by `completed_at`)
    - Summary cards: "X hours saved this week" etc.

    **4. Priority grouping:**
    - Keep Quick Wins / Medium / Strategic groups (from `priority` column)
    - Each group shows progress bar (done/total)
    
    Also fix pre-existing TypeScript error on line 72 (ImplItem type mismatch).
    AVOID: Don't just add timestamps to existing UI — needs full redesign.
  </action>
  <verify>
    - `npm run build` passes (TS error also fixed)
    - Status changes set timestamps correctly
    - Timeline filter shows correct items
    - KPI cards show accurate numbers
  </verify>
  <done>Progress page shows real timeline tracking with KPIs and confirmation flows.</done>
</task>

---

### Phase 4 — Agency Mode Fixes

**Database impact:** No schema changes — all data already exists in `clients`, `audit_sessions` (has `client_id` FK), and `reports` (has `session_id` FK).

#### Plan 4.1 — Per-Client Detail Dashboard

**Objective:** Give agency users a full dashboard per client.

<task type="auto">
  <name>Build per-client detail page with tabs</name>
  <files>
    app/dashboard/clients/[id]/page.tsx (REWRITE)
    components/dashboard/agency/ClientDetailTabs.tsx (NEW)
  </files>
  <action>
    Rewrite client detail page with tabbed navigation. Data chain: `clients.id` → `audit_sessions.client_id` → `reports.session_id`.

    - **Overview tab:** Client info from `clients` table (business_name, industry, company_size, contact_email), latest audit score from `reports.overall_score`, recent activity
    - **Audits tab:** `audit_sessions` WHERE client_id = params.id, with status badges
    - **Reports tab:** `reports` JOIN `audit_sessions` WHERE client_id = params.id
    - **Analytics tab:** `reports.function_scores` (jsonb) for this client's audits

    Use searchParams for tab state (e.g. `?tab=audits`).
    AVOID: Don't create separate pages per tab — single page with tab state.
  </action>
  <verify>
    - `/dashboard/clients/[id]` shows tabbed interface
    - Each tab shows correct client-specific data
    - `npm run build` passes
  </verify>
  <done>Agency users see a full dashboard for each client.</done>
</task>

#### Plan 4.2 — Filter Bars on Audits & Reports Pages

<task type="auto">
  <name>Add business name + status filters</name>
  <files>
    app/dashboard/audits/page.tsx
    app/dashboard/reports/page.tsx
  </files>
  <action>
    For both pages, add a filter bar (agency mode only):
    - **Business filter:** "All" pill + one pill per unique `business_name` from `audit_sessions`. Includes count, e.g. "Acme Corp (3)"
    - **Status filter (Audits only):** Pills for each value in `audit_sessions.status` enum: In Progress, Processing, Complete, Abandoned
    - Client-side filtering with useState (data already fetched)
    
    Only show when `profiles.user_type === 'agency_owner'`.
    AVOID: Don't use server-side filtering — data is already fetched.
  </action>
  <verify>
    - Filter pills appear on audits/reports pages in agency mode
    - Clicking a pill filters correctly
    - "All" shows everything
  </verify>
  <done>Agency audits/reports pages have working filter bars.</done>
</task>

#### Plan 4.3 — Analytics Per-Client Navigation

<task type="auto">
  <name>Add client drill-down from agency Analytics page</name>
  <files>
    app/dashboard/analytics/page.tsx
  </files>
  <action>
    Add "Client Breakdown" section to agency analytics:
    - Query: `clients` JOIN `audit_sessions` (on client_id) JOIN `reports` (on session_id)
    - Each row: client business_name, latest `reports.overall_score`, trend
    - Clickable link → `/dashboard/clients/[id]?tab=analytics` (connects to Plan 4.1)
    AVOID: Don't duplicate analytics UI — show summary cards that link to detail page.
  </action>
  <verify>
    - Client breakdown section visible in agency mode
    - Clicking a client navigates to their detail page
  </verify>
  <done>Agency analytics → per-client drill-down navigation works.</done>
</task>

---

### Phase 5 — Archive & Restore System

**Objective:** Soft-delete audits and reports with restore capability.

**Database impact:**
- `audit_sessions` needs: `archived_at` (timestamptz, nullable) column
- `audit_sessions.status` CHECK constraint currently: `'in_progress'`, `'processing'`, `'complete'`, `'abandoned'` — may need to add `'archived'` OR use the separate `archived_at` column approach (recommended — avoids touching the status enum)
- `reports` needs: `archived_at` (timestamptz, nullable) column

<task type="auto">
  <name>Add archived_at columns to audit_sessions and reports</name>
  <files>
    Supabase schema change (alter tables)
  </files>
  <action>
    Add `archived_at` (timestamptz, nullable, default null) to both `audit_sessions` and `reports` tables.
    
    Use `archived_at IS NOT NULL` as the archive indicator — this avoids modifying the existing `status` CHECK constraint on `audit_sessions`.
    AVOID: Don't modify the status enum — use a separate archived_at timestamp column instead independent of status.
  </action>
  <verify>Both tables have archived_at column.</verify>
  <done>Archive schema ready.</done>
</task>

<task type="auto">
  <name>Add archive API routes + UI toggles</name>
  <files>
    app/api/audits/[id]/archive/route.ts (NEW)
    app/api/reports/[id]/archive/route.ts (NEW)
    app/dashboard/audits/page.tsx
    app/dashboard/reports/page.tsx
  </files>
  <action>
    **API Routes:**
    - PATCH `/api/audits/[id]/archive` — Sets `archived_at = now()` or `null` (toggle)
    - PATCH `/api/reports/[id]/archive` — Same pattern
    - Both verify user ownership via `user_id` match

    **UI Changes:**
    - Default queries: filter WHERE `archived_at IS NULL`
    - "Show Archived" toggle at the top
    - Each item: "Archive" action (three-dot menu)
    - Archived items: "Restore" button
    AVOID: Don't hard-delete — always soft-delete via archived_at.
  </action>
  <verify>
    - Archive → item disappears from default view
    - "Show Archived" → item reappears with "Restore"
    - Restore → returns to default view
  </verify>
  <done>Audits and reports can be archived and restored.</done>
</task>

---

### Phase 6 — Report Download & Share

**Database impact:**
- `reports` needs: `share_token` (uuid, nullable) and `is_shared` (boolean, default false) for Plan 6.2
- No schema changes for Plan 6.1 (PDF is client-side only)

#### Plan 6.1 — PDF Export

<task type="auto">
  <name>Add PDF download button to report page</name>
  <files>
    app/report/[reportId]/_components/ReportHeader.tsx
    lib/pdf/generateReportPDF.ts (NEW)
  </files>
  <action>
    **Recommended approach:** Client-side with `html2canvas` + `jsPDF`.
    - Add "Download PDF" button in ReportHeader
    - On click: capture report container as canvas → PDF → trigger download
    
    Gate behind Pro plan — check `profiles.plan === 'pro'`. Free users see disabled button with upgrade prompt.
    
    Report data comes from `reports` table (overall_score, function_scores, full_gaps, solutions, roi_analysis, roadmap, etc).
    AVOID: Don't recreate report layout in a PDF template — screenshot the rendered page.
  </action>
  <verify>
    - "Download PDF" visible for Pro users
    - Clicking generates and downloads a PDF
    - Free users see disabled button with upgrade prompt
  </verify>
  <done>Pro users can download reports as PDF.</done>
</task>

#### Plan 6.2 — Shareable Report Links

<task type="auto">
  <name>Add share_token and is_shared columns to reports</name>
  <files>
    Supabase schema change (alter table)
  </files>
  <action>
    Add to `reports` table:
    - `share_token` (uuid, nullable) — the secret token for public access
    - `is_shared` (boolean, default false) — whether sharing is enabled
  </action>
  <verify>Both columns exist on reports table.</verify>
  <done>Share schema ready.</done>
</task>

<task type="auto">
  <name>Build share API + public report access</name>
  <files>
    app/api/report/[reportId]/share/route.ts (NEW)
    app/report/[reportId]/page.tsx
    app/report/[reportId]/_components/ReportHeader.tsx
  </files>
  <action>
    **API route:** POST `/api/report/[reportId]/share`
    - Generate UUID share_token, UPDATE on `reports` table, set is_shared=true
    - Return public URL: `/report/[reportId]?token=[share_token]`

    **Report page:** If `?token=X` present, validate against `reports.share_token` (bypass auth). If valid → render read-only. If invalid → redirect to login.

    **UI:** "Share" button in ReportHeader → modal with the link + copy button.
    AVOID: Don't make reports public by default — only when user clicks Share.
  </action>
  <verify>
    - "Share" generates a copyable link
    - Link works in incognito without login
    - Invalid token redirects to login
  </verify>
  <done>Reports shareable via public tokenized link.</done>
</task>

---

### Phase 7 — Performance Optimization

**Objective:** Profile and fix performance bottlenecks.

**Database impact:** Potential index additions on frequently queried columns:
- `audit_sessions(user_id, started_at DESC)` — dashboard loads
- `reports(session_id)` — already unique, should be fast
- `implementation_items(report_id)` — progress page

<task type="checkpoint:human-verify">
  <name>Performance audit + targeted fixes</name>
  <files>
    Determined after profiling
  </files>
  <action>
    **Step 1 — Profile:**
    - Lighthouse audit on dashboard, report, audits list pages
    - Bundle analyzer to identify large client-side bundles
    - Supabase query logs for slow queries

    **Step 2 — Common Next.js fixes:**
    - Dynamic imports for heavy client components (next/dynamic)
    - loading.tsx skeleton screens for slow pages
    - next/image instead of raw img tags
    - Add indexes on frequently filtered Supabase columns
    - React Server Components for data-heavy pages
    - Check for N+1 query patterns

    **Step 3 — Caching:**
    - revalidate on static-ish pages
    - unstable_cache for expensive queries

    AVOID: Don't optimize blindly — profile first.
  </action>
  <verify>
    - Lighthouse performance score ≥ 80
    - Bundle size reduction measurable
    - Key pages load noticeably faster
  </verify>
  <done>Application feels snappy. No perceivable lag.</done>
</task>

---

## Execution Order & Dependencies

```
Wave 1 (independent, no schema changes needed):
├── Phase 2.2: Command Palette Search (reads existing tables)

Wave 2 (schema changes needed, independent of each other):
├── Phase 2.3: Notification System (NEW notifications table)
├── Phase 3: Progress Tracking (ADD started_at, notes to implementation_items)
└── Phase 5: Archive & Restore (ADD archived_at to audit_sessions + reports)

Wave 3 (no schema changes, depends on existing data):
├── Phase 4.1: Per-Client Detail Dashboard
├── Phase 4.2: Audits/Reports Filter Bars
└── Phase 4.3: Analytics Per-Client Navigation (depends on 4.1)

Wave 4 (schema change for 6.2):
├── Phase 6.1: PDF Export (no schema change)
└── Phase 6.2: Shareable Report Links (ADD share_token, is_shared to reports)

Wave 5:
└── Phase 7: Performance Optimization (last — profile after all features built)
```

---

## Summary Table

| Phase | Item | Schema Change? | Status | Wave |
|-------|------|---------------|--------|------|
| 1.1 | Upgrade Pro X button fix | No | ✅ Done | — |
| 1.2 | Hide upgrade for Pro users | No | ✅ Done | — |
| 1.3 | Settings missing fields | No (columns exist) | ✅ Done | — |
| 2.1 | Global header on all pages | No | ✅ Done | — |
| 2.2 | Cmd+K command palette | No | ⬜ Pending | 1 |
| 2.3 | Notification system | **NEW table** | ⬜ Pending | 2 |
| 3.1 | Progress redesign | **ADD 2 columns** to implementation_items | ⬜ Pending | 2 |
| 4.1 | Per-client dashboard | No | ⬜ Pending | 3 |
| 4.2 | Audits/Reports filters | No | ⬜ Pending | 3 |
| 4.3 | Analytics navigation | No | ⬜ Pending | 3 |
| 5.1 | Archive & restore | **ADD column** to audit_sessions + reports | ⬜ Pending | 2 |
| 6.1 | PDF export | No | ⬜ Pending | 4 |
| 6.2 | Shareable links | **ADD 2 columns** to reports | ⬜ Pending | 4 |
| 7.1 | Performance optimization | Possible indexes | ⬜ Pending | 5 |

### Total Schema Changes Required

| Table | Change | For Phase |
|-------|--------|-----------|
| (new) `notifications` | Create entire table | 2.3 |
| `implementation_items` | Add `started_at`, `notes` | 3 |
| `audit_sessions` | Add `archived_at` | 5 |
| `reports` | Add `archived_at` | 5 |
| `reports` | Add `share_token`, `is_shared` | 6.2 |
