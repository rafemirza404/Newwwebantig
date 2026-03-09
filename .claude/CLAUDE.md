# AgentBlue — Claude Context (Nested)

> This file is kept in sync with the root `CLAUDE.md`. Last updated: 2026-03-07.
> For full project memory, see root `CLAUDE.md` and `plans/applicationmajorfixes.md`.

## Project
Marketing/audit SaaS — `C:\Users\mirza abdul rafe\newwwebAntig`
Branch: `main` (single branch)
Stack: Next.js 14 App Router + TypeScript + Supabase + Tailwind + **OpenAI SDK** (migrated from Anthropic)

## What's Built ✅ (as of 2026-03-07)
- 7-agent AI pipeline (`lib/ai/agents/`) — question-engine, business-profiler, gap-analyzer, solution-mapper, report-assembler, diagram-architect, final-compiler
- Dual user types: Direct (B2C) + Agency (B2B) with `view_mode` cookie switching
- Full dashboard: agency + direct views, client management, audits, reports, analytics, progress, settings
- 5-step onboarding with auto-session creation
- Report page: all 7 sections (Score, Gaps, Solutions, ROI, Diagrams, Roadmap) — Pro-gated
- PDF export: `@react-pdf/renderer` (proper text PDF) + `html2canvas` for diagrams only
- Shareable report links: `share_token` + `is_shared` on reports, public `?token=` view
- Client portal: `/portal/*` with invite system, white-label support, RLS policies
- Archive & restore: `archived_at` on audit_sessions + reports
- Cmd+K command palette, real notification system
- **Data isolation fix**: direct mode queries scope by `workspace_id IS NULL` to exclude agency audits

## ⚠️ PROTECTED FILES — Never modify these when working on the marketing site
These files are **shared** between marketing AND dashboard/admin. Changing them breaks the entire app.

| File | Rule |
|------|------|
| `app/globals.css` | NEVER change CSS variables here for marketing purposes. Marketing has its own `app/(marketing)/marketing.css` with `--m-*` prefixed vars. |
| `tailwind.config.ts` | NEVER remove or change existing color tokens (`accent`, `app-accent`, `app-success`, `app-info`, `primary`). You may ADD new tokens. |
| `middleware.ts` | Do not touch unless explicitly asked. Affects auth for ALL routes. |
| `lib/supabase/server.ts` | Do not touch unless explicitly asked. |
| `app/auth/callback/route.ts` | Do not touch unless explicitly asked. |

## CSS Ownership — which file owns what
- **Marketing page** (`/`, `/about`, `/pricing`, `/solutions`, `/careers`): use ONLY `app/(marketing)/marketing.css` classes (`m-btn-primary`, `m-text`, `m-bg`, etc.)
- **Dashboard/admin** (`/dashboard/*`, `/audit/*`, `/report/*`): use Tailwind tokens from `tailwind.config.ts` + `globals.css` CSS vars
- **Portal** (`/portal/*`): uses dashboard tokens + `--brand-color` CSS var injected by layout

## Critical Architecture
- `workspace_id IS NULL` = direct/personal audit. `workspace_id IS NOT NULL` = agency client audit.
- `view_mode` cookie: `"direct"` or `"agency_owner"` — controls which dashboard/data shows
- Path aliases: `~/` → project root, `@/` → src/ (legacy marketing)
- OpenAI models: `gpt-4o-mini` (was haiku), `gpt-4o` (was sonnet)

## Key Env Vars
OPENAI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_APP_URL

## What's Left (Phases 7–12)
See `plans/applicationmajorfixes.md` for full detail.
- Phase 7: Performance optimization
- Phase 8: Re-Audit System (before/after comparison)
- Phase 9: Focused Progress Dashboard enhancements
- Phase 10: Client ROI Report
- Phase 11: AI Implementation Guides
- Phase 12: Client Portal Enhancements
- **Bigger**: Stripe integration, plan enforcement, production CI/CD
