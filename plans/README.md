> ⚠️ **HISTORICAL DOCUMENT** — This is the original product vision spec. It reflects intended design and features but is NOT current state. For current progress, see `plans/applicationmajorfixes.md`. Tech stack listed here (Anthropic, 4 agents) is outdated — we use OpenAI + 7 agents.

# COMPLETE PRODUCT MASTER PLAN
## AI Business Audit Platform — Mevolut UI Edition
**Every page. Every navigation item. Final version.**

---

## PART 1 — WHAT WE'RE BUILDING

**One Sentence:** A multi-tenant AI-powered business audit platform where agency owners manage clients and business owners audit themselves — generating professional, interactive reports that identify automation gaps, map specific solutions, track ROI over time, and grow smarter with every audit.

### The Two Products Inside One Platform

| Product | Who | What |
|---------|-----|------|
| **Direct (B2C)** | Business owner signs up, audits their own business, gets a report, tracks implementation, re-audits over time. |
| **Agency (B2B)** | AI agency owner gets their own workspace, adds clients, runs audits, manages reports, tracks ROI across all clients. White-labeled. |

Both share the same audit engine, AI pipeline, and database. The experience layer is different per user type.

---

## PART 2 — USER TYPES & PERMISSIONS

```
SUPER ADMIN (You)
├── Full platform access
├── Manage question taxonomy
├── Manage case study library
├── View all platform analytics
└── Manage all workspaces + users

AGENCY OWNER
├── Their own isolated workspace
├── Invite team members (Admin, Analyst, Viewer)
├── Create and manage clients
├── Run audits (guided or self-serve links)
├── View all client reports
├── Track ROI across all clients
├── White-label branding (logo, colors)
└── Analytics across their book of business

TEAM MEMBER (belongs to Agency)
├── Admin: everything except billing
├── Analyst: view + run audits, cannot manage team
└── Viewer: read-only access to reports

CLIENT (belongs to Agency)
├── Receives audit link via email
├── Completes audit themselves
├── Views their own report (what agency shares)
└── Tracks their own implementation progress

DIRECT USER (no agency)
├── Signs up themselves
├── Audits their own business
├── Free: 1 audit, partial report
└── Paid: unlimited audits, full reports, history + comparison
```

---

## PART 3 — DESIGN SYSTEM (MEVOLUT DARK MODE)

### Theme DNA
The entire dashboard operates in a deep dark mode aesthetic inspired by Mevolut / Qiespend. All colors are driven via CSS variables in `globals.css` and consumed through Tailwind semantic tokens. **No hardcoded hex values anywhere in components.**

### CSS Variable Tokens (Dark Mode — Primary Theme)

| Token | HSL Value | Usage |
|-------|-----------|-------|
| `--background` | `240 5% 6%` | Page background (`#0F0F11`) |
| `--foreground` | `0 0% 95%` | Primary text |
| `--card` | `240 5% 10%` | Card surfaces |
| `--card-foreground` | `0 0% 95%` | Card text |
| `--primary` | `221 100% 65%` | Brand accent (electric blue `#4D88FF`) |
| `--primary-foreground` | `0 0% 100%` | Text on primary |
| `--secondary` | `240 5% 15%` | Subtle backgrounds, inputs |
| `--muted-foreground` | `240 5% 60%` | Subdued text |
| `--border` | `240 5% 15%` | Borders (`border-border/50` for subtlety) |
| `--destructive` | `0 62% 50%` | Error/delete states |

### Typography
- **Font:** Outfit (loaded via `next/font/google` — replaces Inter)
- **Sizes:** `text-[11px]` labels / `text-[13px]` body / `text-[15px]` section titles / `text-[28px]` hero
- **Weight:** `font-medium` (500) for most, `font-semibold` (600) for headings, `font-bold` (700) for hero only

### Icons
- **Library:** Lucide React (`lucide-react`)
- **Size:** `w-4 h-4` (16px standard)
- **Inactive:** `text-muted-foreground`
- **Active:** `text-primary` (lime green)

### Spacing & Shape
- **Cards:** `rounded-2xl`, no visible border (`border-none`), inner inset shadow (`shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]`)
- **Buttons:** `rounded-lg` for secondary, `rounded-full` for primary CTAs
- **Spacing:** Tailwind's spacing scale (`gap-5`, `mb-8`, `p-6`)
- **Tables:** Very subtle dividers (`divide-border/20`), uppercase `text-xs tracking-wide` column headers
- **Status badges:** `text-[10px] uppercase tracking-wider font-semibold` + semantic colors with `border` and transparent tinted backgrounds

### Layout Structure
```
┌──────────────────────────────────────────────────────────┐
│  SIDEBAR (260px, collapsible to 60px)                    │
│  ┌─────────┬────────────────────────────────────────────┐│
│  │         │                                            ││
│  │  NAV    │        MAIN CONTENT (flex-1, scrollable)   ││
│  │         │        max-w-[1400px] mx-auto              ││
│  │         │                                            ││
│  └─────────┴────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────┘
```

---

## PART 4 — SIDEBAR NAVIGATION

### Current Sidebar Structure (Sidebar.tsx)
Three grouped sections: **MENU**, **FEATURES**, **TOOLS** + bottom Upgrade widget + user profile.

### Agency Owner Sidebar
```
┌────────────────────────────┐
│  [•] AgentBlue          ◂  │  ← logo + collapse toggle
├────────────────────────────┤
│  🔍 Search Anything...     │  ← search input
├── MENU ────────────────────┤
│  ⊞  Dashboard             │  → /dashboard
│  🔔 Notification          │  → /dashboard/notifications   ⚠️ NO PAGE EXISTS
│  👥 Clients               │  → /dashboard/clients
│  📈 Analytics             │  → /dashboard/analytics
│  📄 Transaction           │  → /dashboard/transactions    ⚠️ NO PAGE EXISTS
├── FEATURES ────────────────┤
│  🔗 Integration           │  → /dashboard/integrations
│  ⚡ Automation            │  → /dashboard/automation      ⚠️ NO PAGE EXISTS
├── TOOLS ───────────────────┤
│  ⚙️  Settings              │  → /dashboard/settings
│  ❓ Help Center            │  → /dashboard/help            ⚠️ NO PAGE EXISTS
├────────────────────────────┤
│  ⚡ Upgrade Pro!           │  ← CTA card
│  [Avatar] User  🚪        │  ← user + sign out
│  DIR / AGN  🌙            │  ← dev toggle + theme switch
└────────────────────────────┘
```

### Direct User Sidebar
Same structure but without `Clients` in MENU.

---

## PART 5 — PAGE INVENTORY & STATUS

### ✅ = Styled (Mevolut dark mode)   ⚠️ = Exists but light-mode hardcoded   ❌ = No page exists

| # | Route | Page File | Status | Notes |
|---|-------|-----------|--------|-------|
| 1 | `/dashboard` | `app/dashboard/page.tsx` | ✅ | `AgencyDashboard.tsx` + `DirectDashboard.tsx` restyled |
| 2 | `/dashboard/clients` | `app/dashboard/clients/page.tsx` | ⚠️ | Hardcoded `text-gray-900`, `bg-white`, `border-gray-100` |
| 3 | `/dashboard/clients/new` | `app/dashboard/clients/new/page.tsx` | ⚠️ | Add client form — needs dark mode tokens |
| 4 | `/dashboard/audits` | `app/dashboard/audits/page.tsx` | ⚠️ | Hardcoded light colors throughout |
| 5 | `/dashboard/reports` | `app/dashboard/reports/page.tsx` | ⚠️ | Hardcoded light colors throughout |
| 6 | `/dashboard/analytics` | `app/dashboard/analytics/page.tsx` | ⚠️ | Uses old StatCard props (`icon`, `accent`, `href`) that no longer exist |
| 7 | `/dashboard/progress` | `app/dashboard/progress/page.tsx` | ⚠️ | Direct user only — hardcoded light colors |
| 8 | `/dashboard/settings` | `app/dashboard/settings/page.tsx` | ⚠️ | Full settings form — hardcoded light colors |
| 9 | `/dashboard/team` | `app/dashboard/team/page.tsx` | ⚠️ | Agency only — uses `TeamClient` component |
| 10 | `/dashboard/billing` | `app/dashboard/billing/page.tsx` | ⚠️ | Partly themed (`text-white`) but `BillingClient` sub-component not checked |
| 11 | `/dashboard/integrations` | `app/dashboard/integrations/page.tsx` | ⚠️ | Hardcoded light colors, integration cards |
| 12 | `/dashboard/notifications` | — | ❌ | Sidebar links here but **no page exists** |
| 13 | `/dashboard/transactions` | — | ❌ | Sidebar links here but **no page exists** |
| 14 | `/dashboard/automation` | — | ❌ | Sidebar links here but **no page exists** |
| 15 | `/dashboard/help` | — | ❌ | Sidebar links here but **no page exists** |

### Standalone Pages (No Sidebar)

| Route | Status | Notes |
|-------|--------|-------|
| `/audit/new` + `/audit/[id]` | ⚠️ | Audit session flow — needs dark mode pass |
| `/report/[id]` | ⚠️ | Report viewer — needs dark mode pass |
| `/portal/*` | ⚠️ | Client portal — needs dark mode pass |
| `/login`, `/signup` | ⚠️ | Auth pages — needs dark mode pass |
| `/(marketing)/*` | Light mode | Homepage, About, Services, Contact — **keep light mode** |

---

## PART 6 — SIDEBAR NAVIGATION FIX PLAN

### Problem
The sidebar currently links to 4 routes that **don't have pages**: `/dashboard/notifications`, `/dashboard/transactions`, `/dashboard/automation`, `/dashboard/help`. Meanwhile, existing pages like **Audits**, **Reports**, **Progress**, **Team**, and **Billing** are **not in the sidebar** at all.

### Solution — Restore Correct Navigation

**Agency Owner Sidebar:**
```
┌────────────────────────────┐
│  [•] AgentBlue          ◂  │
├────────────────────────────┤
│  🔍 Search Anything...     │
├── MENU ────────────────────┤
│  ⊞  Dashboard             │  → /dashboard
│  👥 Clients               │  → /dashboard/clients
│  📋 Audits                │  → /dashboard/audits
│  📄 Reports               │  → /dashboard/reports
│  📈 Analytics             │  → /dashboard/analytics
├── WORKSPACE ───────────────┤
│  ⚙️  Settings              │  → /dashboard/settings
│  👤 Team                  │  → /dashboard/team
│  💳 Billing               │  → /dashboard/billing
│  🔗 Integrations          │  → /dashboard/integrations
├────────────────────────────┤
│  ⚡ Upgrade Pro!           │
│  [Avatar] User  🚪        │
│  DIR / AGN  🌙            │  ← dev only
└────────────────────────────┘
```

**Direct User Sidebar:**
```
┌────────────────────────────┐
│  [•] AgentBlue          ◂  │
├────────────────────────────┤
│  🔍 Search Anything...     │
├── MENU ────────────────────┤
│  ⊞  Dashboard             │  → /dashboard
│  📋 My Audits             │  → /dashboard/audits
│  📄 My Reports            │  → /dashboard/reports
│  ✅ Progress              │  → /dashboard/progress
│  📈 My Score              │  → /dashboard/analytics
├── ACCOUNT ─────────────────┤
│  ⚙️  Settings              │  → /dashboard/settings
│  💳 Billing               │  → /dashboard/billing
├────────────────────────────┤
│  ⚡ Upgrade Pro!           │
│  [Avatar] User  🚪        │
│  DIR / AGN  🌙            │  ← dev only
└────────────────────────────┘
```

**What gets removed from sidebar:** Notification, Transaction, Automation, Help Center (no pages exist).
**What gets added to sidebar:** Audits, Reports, Team, Billing, Progress.

---

## PART 7 — RESTYLING PLAN (ALL PAGES)

Every page below needs the same treatment: replace all hardcoded `gray-*`, `white`, `border-gray-*` classes with semantic Tailwind tokens that respect dark/light mode.

### Pattern to Apply on Every Page

| Old Class | New Class |
|-----------|-----------|
| `bg-white` | `bg-card` |
| `text-gray-900` | `text-foreground` |
| `text-gray-500` / `text-gray-400` | `text-muted-foreground` |
| `border-gray-100` / `border-gray-200` | `border-border` or `border-border/50` |
| `bg-gray-50` / `bg-gray-100` | `bg-secondary` |
| `hover:bg-gray-50` | `hover:bg-secondary/20` |
| `bg-gray-900 text-white` (buttons) | `bg-primary text-primary-foreground` |
| `max-w-5xl` / `max-w-4xl` | `max-w-[1400px]` |
| `rounded-xl` (cards) | `rounded-2xl` |
| `border border-gray-100 shadow-sm` | `border-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]` |
| `text-2xl font-semibold` (page titles) | `text-[28px] font-bold tracking-tight` |
| Table headers `text-xs` | `text-xs tracking-wide uppercase` |

### Page-by-Page Restyling Notes

#### 1. `/dashboard/clients` — Clients Page
- Replace hardcoded light colors with semantic tokens
- Add Mevolut table styling (uppercase headers, subtle dividers, rounded-2xl card)
- Add page hero section (title + subtitle + action buttons)
- Update the "Add Client" button to `rounded-full bg-primary`

#### 2. `/dashboard/clients/new` — Add Client Form
- Convert form inputs to use `bg-secondary border-transparent` styling
- Convert submit button to primary style

#### 3. `/dashboard/audits` — Audits Page
- Replace all light-mode hardcoded classes
- Convert status badge colors to use semantic dark-mode-aware tokens
- Apply Mevolut table styling

#### 4. `/dashboard/reports` — Reports Page
- Replace all light-mode hardcoded classes
- Apply Mevolut table styling
- Convert score colors to use theme-aware classes

#### 5. `/dashboard/analytics` — Analytics Page
- **Fix broken StatCard props** — remove old `icon`, `accent`, `href`, `hrefLabel` props that no longer exist
- Replace hardcoded chart/bar colors with CSS variable references
- Convert both cards (Score History + Most Common Gaps) to dark mode

#### 6. `/dashboard/progress` — Progress Tracker (Direct User)
- Replace all light-mode hardcoded classes
- Convert summary stat boxes to dark mode card style
- Convert progress bar to use `bg-primary` fill
- Convert checkbox/item groups to dark mode

#### 7. `/dashboard/settings` — Settings Page
- Replace all `bg-white`, `border-gray-*`, `text-gray-*` with semantic tokens
- Convert form inputs to `bg-secondary border-transparent`
- Convert buttons to `bg-primary text-primary-foreground`
- Update danger zone to use `border-destructive/20` style

#### 8. `/dashboard/team` — Team Page (Agency Only)
- Check `TeamClient` component for hardcoded colors
- Apply semantic token replacement

#### 9. `/dashboard/billing` — Billing Page
- Page header partly themed already
- Check `BillingClient` component for hardcoded colors
- Apply semantic token replacement

#### 10. `/dashboard/integrations` — Integrations Page
- Replace integration card styling from light to dark
- Convert status badges and buttons to semantic tokens
- Style API key section with dark mode tokens

---

## PART 8 — THE AUDIT SESSION (Standalone, No Sidebar)

Distraction-free, full screen, consultant-feel. Dark mode forced.

```
┌──────────────────────────────────────────────────────────┐
│  [Logo]                             Question 7 of ~15    │
│  Progress: ████████████░░░░░░  Sales ✓  Ops ✓  Finance  │
│──────────────────────────────────────────────────────────│
│                                                          │
│     How does [Business Name] currently handle            │
│     customer follow-up after a sales call?               │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Type your answer here...                          │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  [← Back]                            [Continue →]       │
│  🔒 Your answers are private and encrypted              │
└──────────────────────────────────────────────────────────┘
```

**Key UX:**
- Business name used in questions throughout
- Branch coverage tracker at top
- Save & resume (resumable audits)
- Abandoned → auto email reminder
- ~15–20 questions, AI signals completion → processing screen

**Two Audit Modes:**
- **Self-serve** — client fills it out via unique link
- **Guided** — agency fills during live discovery call

---

## PART 9 — THE REPORT PAGE (Standalone, No Sidebar)

Immersive scrollable report with sticky inner nav.

**Sections In Order:**
1. Executive Summary (free)
2. Automation Maturity Score (free: overall only / paid: per-function)
3. Identified Gaps (free: names + 1-line / paid: full cards)
4. Solutions & Blueprints 🔒 Paid
5. Process Diagrams 🔒 Paid (Mermaid before/after)
6. Implementation Roadmap 🔒 Paid
7. Audit History Comparison (repeat audits only)

**Floating bottom bar** for free users: "Unlock solutions" + Upgrade CTA.

---

## PART 10 — CLIENT PORTAL (Agency Clients)

Minimal. Clean. Branded with agency's logo. Forced dark mode.

**Portal Sidebar:**
```
[Agency Logo]
├── My Report
├── Progress Tracker
├── Audit History
└── Settings
```

---

## PART 11 — THE QUESTION ENGINE

**8 Business Function Categories:**
1. Sales & Lead Generation
2. Customer Onboarding & Communication
3. Operations & Project Management
4. Finance & Administration
5. Customer Support & Retention
6. Marketing & Content
7. HR & Team Management
8. Data & Reporting

Agent 1 generates contextual follow-ups. Drills into detected gaps. Completion is AI-signaled, not fixed question count.

---

## PART 12 — AI PIPELINE (4 Agents)

| Agent | Input | Output |
|-------|-------|--------|
| **1 — Question Engine** | Previous Q&A + context | Next question OR completion signal |
| **2 — Analysis Engine** | Full Q&A transcript | Ranked gaps with severity |
| **3 — Solution Mapper (RAG)** | Each gap + pgvector search | Specific solution + ROI estimate |
| **4 — Report Builder** | Gaps + solutions + context | Structured report JSON + Mermaid diagrams |

Processing is async — background job, status polling every 3s.

---

## PART 13 — DATABASE SCHEMA

*(Unchanged — see original schema in codebase)*

Key tables: `profiles`, `workspaces`, `workspace_members`, `clients`, `audit_sessions`, `audit_answers`, `reports`, `implementation_items`, `case_studies`, `invites`.

---

## PART 14 — FREE vs PAID

### Direct User
| | Free | Pro ($29/mo) |
|---|---|---|
| Audits | 1/month | Unlimited |
| Report | Partial (3 gaps preview) | Full (all sections) |
| Function scores | Overall only | Per-function |
| Solutions | ❌ | ✅ |
| Diagrams | ❌ | ✅ |
| Roadmap | ❌ | ✅ |
| History | ❌ | ✅ |

### Agency
| | Starter ($99) | Growth ($249) | Scale ($499) |
|---|---|---|---|
| Clients | 10 | 50 | Unlimited |
| Team seats | 2 | 5 | Unlimited |
| White-label | ❌ | ✅ | ✅ |
| Analytics | Basic | Full | Full |
| API | ❌ | ❌ | ✅ |

---

## PART 15 — TECH STACK

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14 (App Router) |
| UI | Tailwind CSS 3 + shadcn/ui |
| Icons | Lucide React |
| Charts | Recharts |
| Diagrams | Mermaid.js |
| State | React Context + URL params |
| Backend | Next.js API Routes + Server Actions |
| Validation | Zod |
| AI | Anthropic Claude (all 4 agents) |
| Embeddings | Anthropic Embeddings API |
| Database | Supabase PostgreSQL |
| Vector | Supabase pgvector (RAG) |
| Auth | Supabase Auth (Google OAuth + Email) |
| Storage | Supabase Storage |
| Security | Row Level Security on all tables |
| Payments | Stripe |
| Email | Resend |
| Booking | Cal.com |
| Deployment | Vercel |

---

## PART 16 — IMPLEMENTATION ORDER

### Phase 1 — Fix Navigation (Sidebar.tsx)
1. Restore correct nav items matching existing routes
2. Remove links to non-existent pages (notifications, transactions, automation, help)
3. Add missing links (audits, reports, team, billing, progress)
4. Keep the Mevolut styling already applied

### Phase 2 — Restyle All Existing Pages (Semantic Token Pass)
Apply the dark mode token replacement pattern to every page:
- [x] `/dashboard/agency` (Restyled)
- [x] `/dashboard/direct` (Restyled)
- [x] `/dashboard/clients` (Restyled)
- [x] `/dashboard/clients/new` (Restyled)
- [x] `/dashboard/audits` (Restyled)
- [x] `/dashboard/reports` (Restyled)
- [x] `/dashboard/analytics` (Restyled)
- [x] `/dashboard/progress` (Restyled)
- [x] `/dashboard/settings` (Restyled)
- [x] `/dashboard/team` (Restyled)
- [x] `/dashboard/billing` (Restyled)
- [x] `/dashboard/integrations` (Restyled)
### Phase 3 — Standalone Pages
- [x] Audit session pages (`/audit/*`) (Restyled)
- [x] Report viewer (`/report/*`) (Restyled)
- [x] Client portal (`/portal/*`) (Restyled)
- [x] Auth pages (`/login`, `/signup`) (Restyled)

### Phase 4 — V2 Features (Don't Build Yet)
- Voice input during audit
- Client acquisition page
- Document upload
- Collaborative audit
- Automation marketplace
- API access
- White-label mobile app
