# Agent Implementation Plan
## AI Business Audit Platform — 7-Agent Pipeline

Replace all Solar/HVAC placeholder AI files with the full 7-agent architecture defined in `ai-agents-plan.md` and `Systemprompt.md`. The Anthropic SDK is already installed. No new dependencies required except the `mermaid` npm package for server-side diagram validation.

---

## What Exists Today (To Be Replaced)

| File | Status | Problem |
|------|--------|---------|
| `lib/ai/question-engine.ts` | ⚠️ Placeholder | Hardcoded Solar/HVAC prompt, multiple-choice only, no streaming, no sliding window, no coverage tracking |
| `lib/ai/analysis-engine.ts` | ⚠️ Placeholder | Solar/HVAC prompt, no business profiling, no dynamic function detection |
| `lib/ai/solution-mapper.ts` | ⚠️ Placeholder | Solar/HVAC prompt, all gaps in one call (no per-gap loop), no RAG |
| `lib/ai/report-builder.ts` | ⚠️ Placeholder | Old 4-agent structure, no parallel assembly, no Mermaid validation |
| `app/api/audit/answer/route.ts` | ⚠️ Needs update | Passes full history on every call, no SSE streaming, no coverage state |
| `app/api/audit/complete/route.ts` | ⚠️ Needs full rewrite | 4-agent synchronous pipeline, needs 7-agent async background job |

---

## Build Order

### Step 1 — Database (Supabase)

**New `case_studies` table:**
- Columns: `id`, `workspace_id` (nullable — null = platform-wide), `title`, `industry`, `business_function`, `problem`, `solution`, `result`, `tools_used`, `embedding` (vector 1536), `created_at`
- pgvector index for similarity search
- RLS: platform-wide rows readable by all; agency rows readable by their own workspace

**New columns on `audit_sessions`:**
- `coverage_status` (jsonb) — tracks 8 functions as covered/partial/uncovered/not_applicable
- `detected_tool_stack` (text[]) — tools mentioned during session
- `tool_stack_captured` (boolean) — true once dedicated tool stack question answered
- `detected_functions` (text[]) — confirmed present functions
- `pipeline_stage` (text) — which agent the background pipeline is currently on

---

### Step 2 — Agent 1: Question Engine (Live, SSE)

**[NEW] `lib/ai/agents/question-engine.ts`**
Implements the full `Systemprompt.md` prompt for "Alex" persona.
- Model: **Claude 3.5 Haiku**
- Input: `business_context` + sliding window (last 3-4 Q&A + compressed summary) + `coverage_status` + `session_state` + `past_report_summary`
- Output: `next_question`, `closing_message`, `is_complete`, updated `coverage_status`, `detected_tool_stack`, `tool_stack_captured`
- Uses Anthropic SDK `.stream()` for token-by-token streaming

**[MODIFY] `app/api/audit/answer/route.ts`**
- Response changes from JSON → **SSE stream** (`ReadableStream` + `TransformStream`)
- Route builds the sliding window (last 3-4 Q&A in full + simple concatenated summary of earlier Q&A — no extra LLM call)
- After answer saved: update `coverage_status`, `detected_tool_stack`, `tool_stack_captured` on the `audit_sessions` row
- Passes `coverage_status` + `session_state` to the new Agent 1

**[MODIFY] `app/audit/[sessionId]/_components/AuditSession.tsx`**
- Switch answer submission from `fetch` (JSON) → `EventSource` / SSE reader
- Show typing animation while streaming
- Question text renders progressively token-by-token
- On `is_complete: true`: display `closing_message`, then trigger complete API call

---

### Step 3 — Background Agents (Agents 2–7)

**[NEW] `lib/ai/agents/business-profiler.ts` — Agent 2**
- Model: Claude Sonnet
- Input: full Q&A transcript + session metadata + detected tool stack
- Output: full business profile (name, industry, team, tool_stack, key_business_context, function_profiles, detected_functions, zoomed_out_business_view, cross_function_observations)

**[NEW] `lib/ai/agents/gap-analyzer.ts` — Agent 3**
- Model: Claude Sonnet
- Input: trimmed Agent 2 output (key_business_context + function_profiles + tool_stack + cross_function_observations + company size)
- Output: overall_maturity_score, function_scores (with generic size-based baselines), gaps array, total time/cost, gap_analysis_narrative

**[NEW] `lib/ai/agents/solution-mapper.ts` — Agent 4**
- Model: Claude Sonnet
- **Per-gap loop** — one Claude call per gap, NOT all gaps at once
- Each call: embed gap → pgvector search case_studies (agency-first, then platform) → Claude with ONE gap + RAG results + relevant function_profile + tool_stack
- Gap calls run in batches of 3 via `Promise.all`
- Output: solutions array + total_roi_summary

**[NEW] `lib/ai/agents/report-assembler.ts` — Agent 5**
- Model: Claude Sonnet
- Input: structured outputs from Agents 2/3/4 (no raw transcripts)
- Output: complete report content JSON (sections 1-5, 7) — narratives, scores, gaps, solutions, roadmap

**[NEW] `lib/ai/agents/diagram-architect.ts` — Agent 6**
- Model: Claude Sonnet
- **Per-gap loop** — one Claude call per diagram
- After each generation: validate with `mermaid.parse()` (server-side, npm package)
- On invalid: retry up to 2x feeding the error back to the LLM
- On 2nd failure: skip diagram, keep `diagram_narrative` as text fallback
- Diagram calls run concurrently via `Promise.all`
- Output: diagrams array (each with `mermaid_script`, `is_validated`, `diagram_narrative`)

**[NEW] `lib/ai/agents/final-compiler.ts` — Agent 7**
- Model: Claude Haiku (structural task only)
- Merges Agent 5 content + Agent 6 diagrams
- Queries previous report from Supabase → generates comparison data if repeat audit
- Validates all sections present before writing
- Writes final report JSON to `reports` table
- Updates session status to `complete`
- Triggers Resend email ("Your report is ready")

**[NEW] `lib/ai/agents/pipeline.ts` — Orchestrator**
```
Agent 2 → Agent 3 → Agent 4 → Promise.all([Agent 5, Agent 6]) → Agent 7
```
- Each agent wrapped in try/catch with one auto-retry
- Logs `[Pipeline] Agent X starting / complete / failed` at every stage
- Updates `pipeline_stage` on `audit_sessions` row at each step

---

### Step 4 — API Route Updates

**[MODIFY] `app/api/audit/complete/route.ts`**
- Remove old synchronous `analyzeAudit → mapSolutions → buildReport` calls
- Mark session as `processing`, immediately return `{ status: "processing" }` to client
- Kick off `runPipeline(sessionId)` as **fire-and-forget** (non-blocking)
- Client polls `/api/audit/status/[id]` every 3s for completion
- Increase `maxDuration` from 60s → 300s

**[MODIFY] `app/api/audit/start/route.ts`** *(minor)*
- Write default `coverage_status` (all "uncovered") on session creation

---

### Step 5 — Report Page Components

**[MODIFY] `app/report/[reportId]/_components/ScoreSection.tsx`**
- Reads new `function_scores` shape with industry baseline comparison

**[MODIFY] `app/report/[reportId]/_components/GapsSection.tsx`**
- Reads new gaps shape: `current_situation`, `why_this_matters`, `time_cost_per_week_hours`, `estimated_annual_cost`

**[MODIFY] `app/report/[reportId]/_components/SolutionsSection.tsx`**
- Reads new solutions shape: `how_it_works`, `primary_tools`, `new_tools_required`, `implementation_complexity`

**[MODIFY] `app/report/[reportId]/_components/ROISection.tsx`**
- Reads `total_roi_summary` from Agent 4

**[NEW] `app/report/[reportId]/_components/DiagramSection.tsx`**
- Renders Mermaid diagrams from Agent 6 output
- Frontend try/catch: if `mermaid.render()` throws, shows `diagram_narrative` text instead

**[NEW] `app/report/[reportId]/_components/RoadmapSection.tsx`**
- Renders 3-phase roadmap (quick wins / medium-term / strategic) from Agent 5

**[MODIFY] `app/report/[reportId]/page.tsx`**
- Add DiagramSection and RoadmapSection to the render tree

---

### Step 6 — Seed Data

**[NEW] `scripts/seed-case-studies.ts`**
- 20 generic automation case studies across the 8 business functions
- Each gets an embedding via `anthropic.embeddings.create()` at seed time
- Run once: `npx ts-node scripts/seed-case-studies.ts`

---

## Verification Plan

### Agent 1 — Isolated Test
1. Start a new audit, answer 3 questions
2. DevTools → Network → `/api/audit/answer` → verify `Transfer-Encoding: chunked` (SSE)
3. Question text appears progressively (not all at once)
4. Supabase dashboard → `audit_sessions` row → `coverage_status` updates after each answer
5. After 5+ questions → server logs show compressed summary, not full history
6. Complete ~15 questions → verify `is_complete: true` + closing message appears

### Background Pipeline — Agents 2-7
1. Complete a full audit (trigger `is_complete`)
2. Server logs show: `[Pipeline] Starting Agent 2...` through `[Pipeline] Agent 7 complete`
3. `/api/audit/status/[sessionId]` returns `{ status: "processing" }` while running
4. On completion → returns `{ status: "complete", reportId: "..." }`
5. `/report/[reportId]` renders with real data in all sections

### Mermaid Validation
1. `reports` table → `diagrams` field → each entry has `"is_validated": true`
2. Force an invalid script in `diagram-architect.ts` → verify `diagram_narrative` shown as fallback on report page

### RAG (Agent 4)
1. After seeding, server logs show: `[SolutionMapper] Gap X: found 3 case studies`
2. Each solution in final report has `reference_case_study` populated
