# 7-Agent AI Audit Pipeline — OpenAI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the 4-agent placeholder pipeline (Solar/HVAC-specific, Anthropic SDK) with the full 7-agent business audit pipeline using OpenAI API.

**Architecture:** Agent 1 runs live during audit (SSE streaming), Agents 2–7 run as a fire-and-forget background job after audit completes. Agents 5+6 run in parallel. Agent 4+6 use per-gap looping with RAG from Supabase pgvector.

**Tech Stack:** OpenAI SDK (`openai` npm), Next.js App Router, Supabase (pgvector), Zod, Server-Sent Events

---

## Model Mapping (Anthropic → OpenAI)

| Agent | Old Model | New Model |
|-------|-----------|-----------|
| Agent 1 (live, fast) | claude-haiku | `gpt-4o-mini` |
| Agents 2–6 (reasoning) | claude-sonnet | `gpt-4o` |
| Agent 7 (structural) | claude-haiku | `gpt-4o-mini` |
| Embeddings | anthropic.embeddings | `text-embedding-3-small` (1536 dims) |

---

## Phase A — Infrastructure

### Task 1: Install OpenAI SDK

**Files:**
- Modify: `package.json`

**Step 1: Install the package**
```bash
npm install openai
```

**Step 2: Add env var to `.env.local`**
Add this line (replace `ANTHROPIC_API_KEY` references throughout the codebase):
```
OPENAI_API_KEY=sk-...
```

Also add to `.env.local.example`:
```
# ─── OpenAI (server-only — NEVER expose to client) ───────────────────────
OPENAI_API_KEY=
```

**Step 3: Create shared OpenAI client helper**
Create `lib/ai/openai-client.ts`:
```typescript
import OpenAI from "openai";

export function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
  return new OpenAI({ apiKey });
}
```

**Step 4: Verify no build error**
```bash
npm run build 2>&1 | head -20
```

---

### Task 2: DB Migration — audit_sessions new columns

**Files:**
- Supabase migration (use mcp__supabase__apply_migration)

**Step 1: Apply migration**
```sql
ALTER TABLE audit_sessions
  ADD COLUMN IF NOT EXISTS coverage_status jsonb DEFAULT '{
    "sales": "uncovered",
    "operations": "uncovered",
    "finance": "uncovered",
    "customer_support": "uncovered",
    "marketing": "uncovered",
    "hr": "uncovered",
    "data_reporting": "uncovered",
    "technology": "uncovered"
  }'::jsonb,
  ADD COLUMN IF NOT EXISTS detected_tool_stack text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tool_stack_captured boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS detected_functions text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS pipeline_stage text DEFAULT null;
```

---

### Task 3: DB Migration — case_studies columns + RLS + pgvector search

**Step 1: Apply migration**
```sql
-- Add missing columns to case_studies
ALTER TABLE case_studies
  ADD COLUMN IF NOT EXISTS workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS business_function text,
  ADD COLUMN IF NOT EXISTS result text;

-- Create pgvector index for similarity search
CREATE INDEX IF NOT EXISTS case_studies_embedding_idx
  ON case_studies USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- RLS: platform-wide rows (workspace_id IS NULL) readable by all authenticated users
-- Agency rows readable by their own workspace members
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "case_studies_select" ON case_studies
  FOR SELECT USING (
    workspace_id IS NULL
    OR workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "case_studies_insert_admin" ON case_studies
  FOR INSERT WITH CHECK (
    workspace_id IS NULL -- only service role inserts platform-wide
    OR workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Semantic search function (agency-first, then platform-wide)
CREATE OR REPLACE FUNCTION match_case_studies(
  query_embedding vector(1536),
  match_count int DEFAULT 3,
  p_workspace_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  title text,
  industry text,
  business_function text,
  problem text,
  solution text,
  result text,
  tools_used text[],
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  -- Agency-specific case studies first
  SELECT
    cs.id, cs.title, cs.industry, cs.business_function,
    cs.problem, cs.solution, cs.result, cs.tools_used,
    1 - (cs.embedding <=> query_embedding) AS similarity
  FROM case_studies cs
  WHERE p_workspace_id IS NOT NULL AND cs.workspace_id = p_workspace_id
  ORDER BY cs.embedding <=> query_embedding
  LIMIT match_count

  UNION ALL

  -- Platform-wide case studies
  SELECT
    cs.id, cs.title, cs.industry, cs.business_function,
    cs.problem, cs.solution, cs.result, cs.tools_used,
    1 - (cs.embedding <=> query_embedding) AS similarity
  FROM case_studies cs
  WHERE cs.workspace_id IS NULL
  ORDER BY cs.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

---

### Task 4: DB Migration — reports table new columns

**Step 1: Apply migration**
```sql
ALTER TABLE reports
  ADD COLUMN IF NOT EXISTS diagrams jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS roadmap jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS comparison jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS gap_analysis_narrative text,
  ADD COLUMN IF NOT EXISTS pipeline_stage text DEFAULT 'complete';
```

---

## Phase B — Agent 1 + Live Streaming

### Task 5: Create Agent 1 — Question Engine (OpenAI + SSE)

**Files:**
- Create: `lib/ai/agents/question-engine.ts`

**Step 1: Write the file**
```typescript
import { z } from "zod";
import { getOpenAIClient } from "~/lib/ai/openai-client";

const SYSTEM_PROMPT = `You are Alex, an expert AI business consultant conducting a structured automation audit.

Your job: generate the NEXT most relevant question to discover automation opportunities.

THE 8 BUSINESS FUNCTIONS (your question taxonomy):
1. sales — lead generation, follow-up, pipeline, proposals
2. operations — project management, scheduling, delivery, field work
3. finance — invoicing, payments, bookkeeping, payroll
4. customer_support — tickets, complaints, onboarding, retention
5. marketing — content, ads, social, email campaigns
6. hr — hiring, onboarding staff, time tracking, performance
7. data_reporting — analytics, reporting, dashboards, decisions
8. technology — current tools, integrations, IT management

RULES:
1. Ask ONE focused question (max 15 words)
2. Always multiple-choice — exactly 3-4 options (short labels, 3-6 words each)
3. First 2 questions MUST cover: (1) company overview, (2) full tool stack
4. Use the business name to feel personalised
5. Only cover functions that likely exist given company size + prior answers
6. Drill deeper when you detect a gap or manual process in any answer
7. Signal completion (is_complete: true) after 12-18 questions when sufficient coverage
8. Hard maximum: if question_count >= 18, always set is_complete: true

OUTPUT: Strict JSON only, no markdown fences:
{
  "next_question": "Question text?",
  "question_category": "sales|operations|finance|customer_support|marketing|hr|data_reporting|technology",
  "options": [
    { "label": "Short label", "value": "snake_case_key" },
    { "label": "Short label", "value": "snake_case_key" }
  ],
  "is_complete": false,
  "closing_message": null,
  "coverage_status": {
    "sales": "covered|partial|uncovered|not_applicable",
    "operations": "covered|partial|uncovered|not_applicable",
    "finance": "covered|partial|uncovered|not_applicable",
    "customer_support": "covered|partial|uncovered|not_applicable",
    "marketing": "covered|partial|uncovered|not_applicable",
    "hr": "covered|partial|uncovered|not_applicable",
    "data_reporting": "covered|partial|uncovered|not_applicable",
    "technology": "covered|partial|uncovered|not_applicable"
  },
  "detected_tool_stack": ["array of tools mentioned so far"]
}

When is_complete is true, set closing_message to a personalised 1-sentence thank-you.`;

export const QuestionOutputSchema = z.object({
  next_question: z.string(),
  question_category: z.string(),
  options: z.array(z.object({ label: z.string(), value: z.string() })),
  is_complete: z.boolean(),
  closing_message: z.string().nullable(),
  coverage_status: z.record(z.string()),
  detected_tool_stack: z.array(z.string()),
});

export type QuestionOutput = z.infer<typeof QuestionOutputSchema>;

export interface PreviousQA {
  question: string;
  answer: string;
  category: string;
}

function buildSlidingWindowContext(previousAnswers: PreviousQA[]): string {
  if (previousAnswers.length === 0) {
    return "(No questions asked yet — generate the first question)";
  }

  const WINDOW_SIZE = 4;
  const recent = previousAnswers.slice(-WINDOW_SIZE);
  const older = previousAnswers.slice(0, -WINDOW_SIZE);

  let context = "";

  if (older.length > 0) {
    // Simple concatenated summary — no extra LLM call
    const summary = older
      .map((a) => `[${a.category}] Q: ${a.question} → A: ${a.answer}`)
      .join(" | ");
    context += `EARLIER Q&A SUMMARY: ${summary}\n\n`;
  }

  context += "RECENT Q&A (full detail):\n";
  context += recent
    .map((a, i) => `Q${previousAnswers.length - recent.length + i + 1} [${a.category}]: ${a.question}\nA: ${a.answer}`)
    .join("\n\n");

  return context;
}

export async function getNextQuestion(params: {
  businessName: string;
  industry: string | null;
  companySize: string | null;
  previousAnswers: PreviousQA[];
  questionCount: number;
  coverageStatus: Record<string, string>;
}): Promise<QuestionOutput> {
  if (params.questionCount >= 18) {
    return {
      next_question: "",
      question_category: "complete",
      options: [],
      is_complete: true,
      closing_message: `Thank you ${params.businessName} — we have everything we need to build your report.`,
      coverage_status: params.coverageStatus,
      detected_tool_stack: [],
    };
  }

  const client = getOpenAIClient();
  const conversationContext = buildSlidingWindowContext(params.previousAnswers);

  const userMessage = `Business: ${params.businessName}
Industry: ${params.industry ?? "General Business"}
Company Size: ${params.companySize ?? "Unknown"}
Questions Asked: ${params.questionCount}
Current Coverage Status: ${JSON.stringify(params.coverageStatus)}

${conversationContext}

Generate the next question.`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 600,
      temperature: 0.3,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
    });

    const text = response.choices[0].message.content?.trim() ?? "";
    const clean = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    const parsed = QuestionOutputSchema.safeParse(JSON.parse(clean));

    if (!parsed.success) {
      console.error("[Agent1] Invalid response shape:", parsed.error.flatten());
      return buildFallback(params.questionCount, params.coverageStatus);
    }

    return parsed.data;
  } catch (err) {
    console.error("[Agent1] Error:", err);
    return buildFallback(params.questionCount, params.coverageStatus);
  }
}

function buildFallback(questionCount: number, coverageStatus: Record<string, string>): QuestionOutput {
  if (questionCount >= 10) {
    return {
      next_question: "",
      question_category: "complete",
      options: [],
      is_complete: true,
      closing_message: "Thank you — we have enough information to build your report.",
      coverage_status: coverageStatus,
      detected_tool_stack: [],
    };
  }
  return {
    next_question: "What tools does your team currently use day-to-day?",
    question_category: "technology",
    options: [
      { label: "CRM + email tools", value: "crm_email" },
      { label: "Spreadsheets mainly", value: "spreadsheets" },
      { label: "Industry-specific software", value: "industry_specific" },
      { label: "Mostly manual / paper", value: "manual" },
    ],
    is_complete: false,
    closing_message: null,
    coverage_status: coverageStatus,
    detected_tool_stack: [],
  };
}
```

---

### Task 6: Update answer/route.ts — SSE Streaming

**Files:**
- Modify: `app/api/audit/answer/route.ts`

**Step 1: Full rewrite**
```typescript
import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "~/lib/supabase/server";
import { getNextQuestion } from "~/lib/ai/agents/question-engine";
import { z } from "zod";

const AnswerSchema = z.object({
  sessionId: z.string().min(1),
  questionText: z.string().min(1).max(2000),
  answerText: z.string().min(1).max(2000),
  category: z.string().min(1).max(100),
  questionOrder: z.number().int().min(0),
});

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  let body: z.infer<typeof AnswerSchema>;
  try {
    const raw = await req.json();
    const parsed = AnswerSchema.safeParse(raw);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Invalid input" }), { status: 400 });
    }
    body = parsed.data;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const { sessionId, questionText, answerText, category, questionOrder } = body;

  // Verify session belongs to user
  const { data: session } = await supabase
    .from("audit_sessions")
    .select("id, user_id, business_name, industry, company_size, status, coverage_status, detected_tool_stack")
    .eq("id", sessionId)
    .single();

  if (!session || session.user_id !== user.id) {
    return new Response(JSON.stringify({ error: "Session not found" }), { status: 404 });
  }

  if (session.status === "complete" || session.status === "processing") {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, isComplete: true })}\n\n`));
        controller.close();
      },
    });
    return new Response(stream, { headers: sseHeaders() });
  }

  // Save the answer
  await supabase.from("audit_answers").insert({
    session_id: sessionId,
    question_text: questionText,
    answer_text: answerText,
    question_category: category,
    question_order: questionOrder,
  });

  const newQuestionCount = questionOrder + 1;
  await supabase.from("audit_sessions")
    .update({ question_count: newQuestionCount })
    .eq("id", sessionId);

  // Load all previous answers for sliding window
  const { data: allAnswers } = await supabase
    .from("audit_answers")
    .select("question_text, answer_text, question_category")
    .eq("session_id", sessionId)
    .order("question_order", { ascending: true });

  const previousAnswers = (allAnswers ?? []).map((a) => ({
    question: a.question_text,
    answer: a.answer_text,
    category: a.question_category ?? "general",
  }));

  const coverageStatus = (session.coverage_status as Record<string, string>) ?? {};

  // Stream the next question generation
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const next = await getNextQuestion({
          businessName: session.business_name,
          industry: session.industry,
          companySize: session.company_size,
          previousAnswers,
          questionCount: newQuestionCount,
          coverageStatus,
        });

        // Update coverage_status and tool_stack on session
        const toolStack = [
          ...(session.detected_tool_stack ?? []),
          ...next.detected_tool_stack,
        ].filter((v, i, a) => a.indexOf(v) === i);

        await supabase.from("audit_sessions").update({
          coverage_status: next.coverage_status,
          detected_tool_stack: toolStack,
          ...(next.detected_tool_stack.length > 0 && category === "technology"
            ? { tool_stack_captured: true }
            : {}),
        }).eq("id", sessionId);

        // Simulate word-by-word streaming for typing effect
        if (!next.is_complete && next.next_question) {
          const words = next.next_question.split(" ");
          for (const word of words) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ token: word + " " })}\n\n`)
            );
            await new Promise((r) => setTimeout(r, 25));
          }
        }

        // Final complete event
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              done: true,
              isComplete: next.is_complete,
              closingMessage: next.closing_message,
              nextQuestion: next.is_complete
                ? null
                : {
                    text: next.next_question,
                    category: next.question_category,
                    options: next.options,
                    order: newQuestionCount,
                  },
            })}\n\n`
          )
        );
      } catch (err) {
        console.error("[audit/answer] Stream error:", err);
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: "Failed to generate question" })}\n\n`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: sseHeaders() });
}

function sseHeaders() {
  return {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  };
}
```

---

### Task 7: Update AuditSession.tsx — SSE Stream Reader

**Files:**
- Modify: `app/audit/[sessionId]/_components/AuditSession.tsx`

**Step 1: Replace `handleAnswer` function** (keep all UI JSX the same, only change the `handleAnswer` logic and add `streamingText` state)

Add these state variables after the existing ones:
```typescript
const [streamingText, setStreamingText] = useState<string>("");
const [isStreaming, setIsStreaming] = useState(false);
```

Replace `handleAnswer` function entirely:
```typescript
const handleAnswer = async (optionValue: string) => {
  if (submitting || loadingNext || animating) return;
  setSubmitting(true);
  setStreamingText("");
  setError(null);

  try {
    const res = await fetch("/api/audit/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        questionText: currentQuestion.text,
        answerText: optionValue,
        category: currentQuestion.category,
        questionOrder: currentQuestion.order,
      }),
    });

    if (!res.ok || !res.body) throw new Error("Failed to save answer");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    setIsStreaming(true);
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        try {
          const data = JSON.parse(line.slice(6)) as {
            token?: string;
            done?: boolean;
            isComplete?: boolean;
            closingMessage?: string | null;
            nextQuestion?: { text: string; category: string; options: Array<{ label: string; value: string }>; order: number } | null;
            error?: string;
          };

          if (data.token) {
            setStreamingText((prev) => prev + data.token);
          }

          if (data.done) {
            setIsStreaming(false);
            if (data.isComplete) {
              await triggerCompletion();
              return;
            }
            if (data.nextQuestion) {
              setAnimating(true);
              setTimeout(() => {
                setCurrentQuestion(data.nextQuestion!);
                setQuestionCount((c) => c + 1);
                setStreamingText("");
                setAnimating(false);
                setSubmitting(false);
              }, 220);
            }
          }

          if (data.error) {
            throw new Error(data.error);
          }
        } catch {
          // ignore parse errors on individual lines
        }
      }
    }
  } catch (err) {
    console.error(err);
    setIsStreaming(false);
    setError("Something went wrong. Please try again.");
    setSubmitting(false);
  }
};
```

Also update the question display in JSX to show `streamingText` when streaming:
```tsx
// In the question card, replace the h2 that shows currentQuestion.text:
<h2 className="text-foreground text-[28px] sm:text-[32px] font-bold leading-tight mb-10 relative z-10">
  {isStreaming && streamingText ? streamingText : currentQuestion.text}
  {isStreaming && <span className="animate-pulse">|</span>}
</h2>

// Hide options while streaming
{!isStreaming && (
  <div className="space-y-3 relative z-10">
    {currentQuestion.options.map((option) => (
      // ... existing option buttons
    ))}
  </div>
)}
```

---

## Phase C — Background Agents 2–7

### Task 8: Agent 2 — Business Profiler

**Files:**
- Create: `lib/ai/agents/business-profiler.ts`

```typescript
import { z } from "zod";
import { getOpenAIClient } from "~/lib/ai/openai-client";

const SYSTEM_PROMPT = `You are a senior management consultant building a comprehensive business profile from an audit Q&A transcript.

Transform the raw Q&A into a deeply structured profile. This is NOT a summary — it is a rich operational picture of how this business actually works, detailed enough for someone who has never spoken to this business to fully understand their operations.

Detect which of the 8 functions actually exist in this business (based on company size and answers):
1. sales, 2. operations, 3. finance, 4. customer_support, 5. marketing, 6. hr, 7. data_reporting, 8. technology

For each DETECTED function, write a comprehensive profile covering:
- Step-by-step process description
- Who is responsible
- What tools they use
- What's working vs where the friction is
- What's manual vs automated
- Volume and time estimates
- Where handoffs happen and what falls through the cracks

OUTPUT: Strict JSON only, no markdown fences. Follow this exact schema.`;

const BusinessProfileSchema = z.object({
  business_profile: z.object({
    name: z.string(),
    industry: z.string(),
    company_size: z.string(),
    business_model: z.enum(["B2B", "B2C", "B2B2C", "unknown"]),
    revenue_stage: z.enum(["pre-revenue", "early", "growing", "established", "unknown"]),
    team_structure: z.string(),
    primary_services_or_products: z.string(),
    current_tool_stack: z.array(z.string()),
    key_business_context: z.string(),
  }),
  detected_functions: z.array(z.string()),
  undetected_functions: z.record(z.string()),
  function_profiles: z.record(z.object({
    exists: z.boolean(),
    profile: z.string(),
  })),
  cross_function_observations: z.string(),
  zoomed_out_business_view: z.string(),
});

export type BusinessProfile = z.infer<typeof BusinessProfileSchema>;

export async function runBusinessProfiler(params: {
  businessName: string;
  industry: string | null;
  companySize: string | null;
  answers: Array<{ question: string; answer: string; category: string }>;
  detectedToolStack: string[];
}): Promise<BusinessProfile> {
  console.log("[Pipeline] Agent 2 starting — Business Profiler");
  const client = getOpenAIClient();

  const transcript = params.answers
    .map((a, i) => `Q${i + 1} [${a.category}]: ${a.question}\nA: ${a.answer}`)
    .join("\n\n");

  const userMessage = `Build a comprehensive business profile for:

Business Name: ${params.businessName}
Industry: ${params.industry ?? "General Business"}
Company Size: ${params.companySize ?? "Unknown"}
Known Tool Stack: ${params.detectedToolStack.join(", ") || "Not yet captured"}

AUDIT TRANSCRIPT:
${transcript}

Output the full business profile JSON.`;

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 4000,
    temperature: 0.2,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
  });

  const text = response.choices[0].message.content?.trim() ?? "";
  const clean = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  const parsed = BusinessProfileSchema.safeParse(JSON.parse(clean));

  if (!parsed.success) {
    console.error("[Agent2] Invalid shape:", parsed.error.flatten());
    throw new Error("Agent 2 (Business Profiler) returned invalid output");
  }

  console.log("[Pipeline] Agent 2 complete");
  return parsed.data;
}
```

---

### Task 9: Agent 3 — Gap Analyzer

**Files:**
- Create: `lib/ai/agents/gap-analyzer.ts`

```typescript
import { z } from "zod";
import { getOpenAIClient } from "~/lib/ai/openai-client";
import type { BusinessProfile } from "./business-profiler";

const SYSTEM_PROMPT = `You are an AI automation expert identifying automation gaps in a business.

An automation gap is any process that is:
- Done manually when it could be automated
- Repeated on a schedule when it could be event-driven
- Dependent on a person remembering when it could be system-driven
- Causing delays, errors, or inconsistency because humans are in the loop
- Consuming significant time from people for low-value repetitive work

MATURITY SCORING (0-100):
- 0-30: Critical — no automation, fully manual, major revenue leakage
- 31-50: Early Stage — basic tools only, large opportunity
- 51-70: Developing — some automation, clear improvement areas
- 71-85: Good — solid processes, targeted optimisation needed
- 86-100: Advanced — industry-leading

INDUSTRY BASELINES (for benchmarking):
- Small (1-10 people): baseline 35/100
- Mid-market (11-50 people): baseline 50/100
- Enterprise (50+ people): baseline 65/100

SEVERITY:
- high: costs >5 hrs/week OR >$2k/month OR directly kills revenue
- medium: costs 2-5 hrs/week OR $500-2k/month
- low: costs <2 hrs/week OR <$500/month

Find 4-8 gaps. Rank by priority (1 = highest). Assume $35/hr for cost calculations.

OUTPUT: Strict JSON only, no markdown fences.`;

const GapSchema = z.object({
  gap_id: z.string(),
  gap_name: z.string(),
  business_function: z.string(),
  current_situation: z.string(),
  affected_team_members: z.string(),
  time_cost_per_week_hours: z.number(),
  estimated_annual_cost: z.number(),
  severity: z.enum(["high", "medium", "low"]),
  automation_potential: z.enum(["high", "medium", "low"]),
  why_this_matters: z.string(),
  priority_rank: z.number(),
});

const FunctionScoreSchema = z.object({
  score: z.number(),
  industry_average: z.number(),
  status: z.enum(["below", "on_par", "above"]),
  score_rationale: z.string(),
});

const GapAnalysisSchema = z.object({
  overall_maturity_score: z.number(),
  function_scores: z.record(FunctionScoreSchema),
  gaps: z.array(GapSchema),
  total_estimated_weekly_hours_lost: z.number(),
  total_estimated_annual_cost: z.number(),
  gap_analysis_narrative: z.string(),
});

export type GapAnalysis = z.infer<typeof GapAnalysisSchema>;
export type Gap = z.infer<typeof GapSchema>;

export async function runGapAnalyzer(profile: BusinessProfile): Promise<GapAnalysis> {
  console.log("[Pipeline] Agent 3 starting — Gap Analyzer");
  const client = getOpenAIClient();

  // Pass only what Agent 3 needs (token optimization)
  const functionProfilesText = Object.entries(profile.function_profiles)
    .filter(([, v]) => v.exists)
    .map(([fn, v]) => `### ${fn.toUpperCase()}\n${v.profile}`)
    .join("\n\n");

  const userMessage = `Identify all automation gaps for this business.

COMPANY SIZE: ${profile.business_profile.company_size}
KEY CONTEXT: ${profile.business_profile.key_business_context}
TOOL STACK: ${profile.business_profile.current_tool_stack.join(", ")}
DETECTED FUNCTIONS: ${profile.detected_functions.join(", ")}
CROSS-FUNCTION OBSERVATIONS: ${profile.cross_function_observations}

FUNCTION PROFILES:
${functionProfilesText}

Output the complete gap analysis JSON.`;

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 4000,
    temperature: 0.2,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
  });

  const text = response.choices[0].message.content?.trim() ?? "";
  const clean = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  const parsed = GapAnalysisSchema.safeParse(JSON.parse(clean));

  if (!parsed.success) {
    console.error("[Agent3] Invalid shape:", parsed.error.flatten());
    throw new Error("Agent 3 (Gap Analyzer) returned invalid output");
  }

  console.log("[Pipeline] Agent 3 complete —", parsed.data.gaps.length, "gaps found");
  return parsed.data;
}
```

---

### Task 10: Agent 4 — Solution Mapper (RAG + per-gap loop)

**Files:**
- Create: `lib/ai/agents/solution-mapper.ts`

```typescript
import { z } from "zod";
import { getOpenAIClient } from "~/lib/ai/openai-client";
import { createSupabaseServerClient } from "~/lib/supabase/server";
import type { BusinessProfile } from "./business-profiler";
import type { GapAnalysis, Gap } from "./gap-analyzer";

const GAP_SYSTEM_PROMPT = `You are an AI automation consultant designing specific, actionable solutions.

TOOL PRIORITY:
1. Can this be solved with tools they already have? → Recommend automation within existing stack
2. Can this be solved by connecting two existing tools? → Recommend integration
3. Is there a new tool that integrates with their stack? → Recommend new tool
4. Does this require a fully new stack? → Only if no existing option

COMMON TOOLS TO REFERENCE:
- CRM/automation: GoHighLevel, HubSpot, Salesforce
- Workflow: n8n, Zapier, Make.com
- AI voice: VAPI, Bland AI, Synthflow
- Email/SMS: ActiveCampaign, Twilio, Klaviyo
- Scheduling: Cal.com, Calendly, Jobber
- Finance: QuickBooks, Xero, Stripe
- Docs: PandaDoc, Proposify, DocuSign
- AI chatbots: Custom GPT, Intercom, Drift

Design ONE solution for the ONE gap provided.

OUTPUT: Strict JSON only, no markdown fences.`;

const SolutionSchema = z.object({
  gap_id: z.string(),
  solution_name: z.string(),
  solution_description: z.string(),
  uses_existing_tools: z.boolean(),
  primary_tools: z.array(z.string()),
  new_tools_required: z.array(z.string()),
  why_these_tools: z.string(),
  how_it_works: z.string(),
  implementation_complexity: z.enum(["simple", "medium", "complex"]),
  estimated_setup_hours: z.number(),
  who_implements_this: z.string(),
  roi: z.object({
    hours_saved_per_week: z.number(),
    cost_saved_per_year: z.number(),
    breakeven_weeks: z.number(),
    additional_roi_notes: z.string(),
  }),
  reference_case_study: z.object({
    title: z.string(),
    industry: z.string(),
    problem: z.string(),
    solution: z.string(),
    result: z.string(),
  }).nullable(),
});

const SolutionsOutputSchema = z.object({
  solutions: z.array(SolutionSchema),
  total_roi_summary: z.object({
    total_hours_saved_per_week: z.number(),
    total_cost_saved_per_year: z.number(),
    total_setup_hours_required: z.number(),
    overall_roi_narrative: z.string(),
  }),
});

export type SolutionsOutput = z.infer<typeof SolutionsOutputSchema>;

async function getEmbedding(text: string): Promise<number[]> {
  const client = getOpenAIClient();
  const response = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}

async function fetchCaseStudies(
  gap: Gap,
  keyContext: string,
  workspaceId: string | null
): Promise<Array<{ title: string; industry: string; problem: string; solution: string; result: string }>> {
  try {
    const embeddingText = `${gap.gap_name}: ${gap.current_situation}. ${keyContext.slice(0, 200)}`;
    const embedding = await getEmbedding(embeddingText);

    const supabase = createSupabaseServerClient();
    const { data } = await supabase.rpc("match_case_studies", {
      query_embedding: embedding,
      match_count: 3,
      p_workspace_id: workspaceId,
    });

    if (!data || data.length === 0) return [];

    console.log(`[Agent4] Gap "${gap.gap_name}": found ${data.length} case studies`);
    return data.map((cs: { title: string; industry: string; problem: string; solution: string; result: string }) => ({
      title: cs.title,
      industry: cs.industry,
      problem: cs.problem,
      solution: cs.solution,
      result: cs.result,
    }));
  } catch (err) {
    console.error("[Agent4] RAG fetch error:", err);
    return [];
  }
}

async function mapSolutionForGap(
  gap: Gap,
  profile: BusinessProfile,
  workspaceId: string | null
): Promise<z.infer<typeof SolutionSchema>> {
  const client = getOpenAIClient();

  const caseStudies = await fetchCaseStudies(
    gap,
    profile.business_profile.key_business_context,
    workspaceId
  );

  const functionProfile = profile.function_profiles[gap.business_function];
  const caseStudyContext = caseStudies.length > 0
    ? `\nRELEVANT CASE STUDIES:\n${caseStudies.map((cs, i) =>
        `Case ${i + 1}: ${cs.title} (${cs.industry})\nProblem: ${cs.problem}\nSolution: ${cs.solution}\nResult: ${cs.result}`
      ).join("\n\n")}`
    : "";

  const userMessage = `Design an AI automation solution for this specific gap:

GAP: ${gap.gap_name}
FUNCTION: ${gap.business_function}
CURRENT SITUATION: ${gap.current_situation}
WHY IT MATTERS: ${gap.why_this_matters}
TIME COST: ${gap.time_cost_per_week_hours} hrs/week (~$${gap.estimated_annual_cost}/year)
SEVERITY: ${gap.severity}
GAP ID: ${gap.gap_id}

BUSINESS TOOL STACK: ${profile.business_profile.current_tool_stack.join(", ")}
KEY CONTEXT: ${profile.business_profile.key_business_context.slice(0, 500)}

${functionProfile?.exists ? `FUNCTION PROFILE (${gap.business_function}): ${functionProfile.profile.slice(0, 400)}` : ""}
${caseStudyContext}

Output the solution JSON for this one gap. Include gap_id: "${gap.gap_id}".`;

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 1500,
    temperature: 0.2,
    messages: [
      { role: "system", content: GAP_SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
  });

  const text = response.choices[0].message.content?.trim() ?? "";
  const clean = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  const parsed = SolutionSchema.safeParse(JSON.parse(clean));

  if (!parsed.success) {
    throw new Error(`Solution for gap "${gap.gap_name}" returned invalid shape`);
  }

  // Attach case study reference if found
  if (caseStudies.length > 0) {
    parsed.data.reference_case_study = caseStudies[0];
  }

  return parsed.data;
}

export async function runSolutionMapper(
  profile: BusinessProfile,
  gapAnalysis: GapAnalysis,
  workspaceId: string | null
): Promise<SolutionsOutput> {
  console.log("[Pipeline] Agent 4 starting — Solution Mapper");

  const client = getOpenAIClient();
  const BATCH_SIZE = 3;
  const allSolutions: z.infer<typeof SolutionSchema>[] = [];

  // Process gaps in batches of 3 (parallel within batch)
  for (let i = 0; i < gapAnalysis.gaps.length; i += BATCH_SIZE) {
    const batch = gapAnalysis.gaps.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map((gap) => mapSolutionForGap(gap, profile, workspaceId))
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        allSolutions.push(result.value);
      } else {
        console.error("[Agent4] Gap solution failed:", result.reason);
      }
    }
  }

  // Generate total ROI summary
  const totalHrs = allSolutions.reduce((s, sol) => s + sol.roi.hours_saved_per_week, 0);
  const totalCost = allSolutions.reduce((s, sol) => s + sol.roi.cost_saved_per_year, 0);
  const totalSetup = allSolutions.reduce((s, sol) => s + sol.estimated_setup_hours, 0);

  const roiResponse = await client.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 400,
    messages: [
      {
        role: "user",
        content: `Write a compelling 2-paragraph ROI narrative for ${profile.business_profile.name}.
Total hours saved: ${totalHrs}/week. Total annual savings: $${totalCost}. Setup hours: ${totalSetup}.
Solutions: ${allSolutions.map((s) => s.solution_name).join(", ")}.
Be specific and motivating. Plain text only, no JSON.`,
      },
    ],
  });

  const roiNarrative = roiResponse.choices[0].message.content?.trim() ?? "";

  console.log("[Pipeline] Agent 4 complete —", allSolutions.length, "solutions mapped");

  return {
    solutions: allSolutions,
    total_roi_summary: {
      total_hours_saved_per_week: totalHrs,
      total_cost_saved_per_year: totalCost,
      total_setup_hours_required: totalSetup,
      overall_roi_narrative: roiNarrative,
    },
  };
}
```

---

### Task 11: Agent 5 — Report Assembler

**Files:**
- Create: `lib/ai/agents/report-assembler.ts`

```typescript
import { z } from "zod";
import { getOpenAIClient } from "~/lib/ai/openai-client";
import type { BusinessProfile } from "./business-profiler";
import type { GapAnalysis } from "./gap-analyzer";
import type { SolutionsOutput } from "./solution-mapper";

const SYSTEM_PROMPT = `You are a senior business report writer. Assemble a complete audit report from the structured data provided.

Write in a direct, confident, CEO-readable style. Use the business name throughout. Be specific — not generic.

OUTPUT: Strict JSON only, no markdown fences. Follow this exact schema with ALL fields populated.`;

export const ReportContentSchema = z.object({
  section_1_business_snapshot: z.object({
    headline: z.string(),
    narrative: z.string(),
  }),
  section_2_maturity_score: z.object({
    score_headline: z.string(),
    score_narrative: z.string(),
  }),
  section_3_gaps: z.object({
    gaps_overview_narrative: z.string(),
    gaps_free_preview: z.array(z.object({ name: z.string(), one_line: z.string() })),
    teaser_gap: z.object({
      name: z.string(),
      severity: z.string(),
      current_situation: z.string(),
      why_this_matters: z.string(),
      time_cost_per_week_hours: z.number(),
      estimated_annual_cost: z.number(),
    }).nullable(),
  }),
  section_4_blueprints: z.object({
    blueprints_intro_narrative: z.string(),
  }),
  section_5_roi: z.object({
    roi_headline: z.string(),
    roi_narrative: z.string(),
  }),
  section_7_roadmap: z.object({
    roadmap_intro: z.string(),
    quick_wins: z.array(z.object({ name: z.string(), description: z.string(), timeline: z.string() })),
    medium_term: z.array(z.object({ name: z.string(), description: z.string(), timeline: z.string() })),
    strategic: z.array(z.object({ name: z.string(), description: z.string(), timeline: z.string() })),
    roadmap_closing: z.string(),
  }),
});

export type ReportContent = z.infer<typeof ReportContentSchema>;

export async function runReportAssembler(
  profile: BusinessProfile,
  gapAnalysis: GapAnalysis,
  solutions: SolutionsOutput
): Promise<ReportContent> {
  console.log("[Pipeline] Agent 5 starting — Report Assembler");
  const client = getOpenAIClient();

  const gapsSummary = gapAnalysis.gaps.slice(0, 6).map((g) =>
    `• ${g.gap_name} (${g.severity}, ${g.time_cost_per_week_hours}h/week, $${g.estimated_annual_cost}/year): ${g.why_this_matters}`
  ).join("\n");

  const solutionsSummary = solutions.solutions.slice(0, 6).map((s) =>
    `• ${s.solution_name} (${s.implementation_complexity}): saves ${s.roi.hours_saved_per_week}h/week, $${s.roi.cost_saved_per_year}/year`
  ).join("\n");

  const userMessage = `Assemble a complete audit report for ${profile.business_profile.name}.

BUSINESS OVERVIEW:
${profile.business_profile.key_business_context.slice(0, 600)}
Zoomed-out view: ${profile.zoomed_out_business_view.slice(0, 400)}

MATURITY SCORES:
Overall: ${gapAnalysis.overall_maturity_score}/100
By function: ${JSON.stringify(gapAnalysis.function_scores)}
Narrative: ${gapAnalysis.gap_analysis_narrative.slice(0, 400)}

GAPS FOUND (${gapAnalysis.gaps.length} total):
${gapsSummary}

SOLUTIONS DESIGNED (${solutions.solutions.length} total):
${solutionsSummary}

ROI TOTAL: ${solutions.total_roi_summary.total_hours_saved_per_week}h/week, $${solutions.total_roi_summary.total_cost_saved_per_year}/year

Output the full report_content JSON with all 6 sections.`;

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 3500,
    temperature: 0.3,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
  });

  const text = response.choices[0].message.content?.trim() ?? "";
  const clean = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  const parsed = ReportContentSchema.safeParse(JSON.parse(clean));

  if (!parsed.success) {
    console.error("[Agent5] Invalid shape:", parsed.error.flatten());
    throw new Error("Agent 5 (Report Assembler) returned invalid output");
  }

  console.log("[Pipeline] Agent 5 complete");
  return parsed.data;
}
```

---

### Task 12: Agent 6 — Diagram Architect (per-gap loop, validation)

**Files:**
- Create: `lib/ai/agents/diagram-architect.ts`

```typescript
import { z } from "zod";
import { getOpenAIClient } from "~/lib/ai/openai-client";
import type { BusinessProfile } from "./business-profiler";
import type { GapAnalysis, Gap } from "./gap-analyzer";
import type { SolutionsOutput } from "./solution-mapper";

const DIAGRAM_SYSTEM_PROMPT = `You are a systems architect designing Mermaid flowchart diagrams for automated business processes.

MERMAID RULES (strict — violations cause parse errors):
- Start with exactly: flowchart LR
- Node shapes: [text] for systems/data, (text) for actions/processes, {text} for decisions
- Connections: --> or --> |label|
- Node IDs: single word or camelCase, NO spaces
- Labels in nodes: max 5 words, NO quotes, NO semicolons, NO special chars except hyphens
- Max 15 nodes
- Each line is ONE connection: A --> B (not multiple arrows on one line)
- NO subgraph unless absolutely needed

GOOD EXAMPLE:
flowchart LR
    Lead[New Lead] --> Trigger(Webhook Trigger)
    Trigger --> CRM[HubSpot CRM]
    CRM --> Check{Lead Exists?}
    Check --> |yes| Update(Update Record)
    Check --> |no| Create(Create Contact)
    Create --> Email(Send Welcome Email)
    Update --> Notify(Notify Sales Rep)

Show the FUTURE automated state only. Not the old manual process.
Include specific tool names from their stack.

Output ONLY the mermaid script — no explanation, no JSON, no markdown fences.`;

function validateMermaidScript(script: string): { valid: boolean; error?: string } {
  if (!script.trim().startsWith("flowchart")) {
    return { valid: false, error: "Must start with 'flowchart'" };
  }
  const lines = script.split("\n").filter((l) => l.trim());
  if (lines.length < 3) {
    return { valid: false, error: "Too few lines" };
  }
  // Check for common syntax errors
  for (const line of lines.slice(1)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    // Detect semicolons inside node labels
    if (/"[^"]*;[^"]*"/.test(trimmed) || /\[[^\]]*;[^\]]*\]/.test(trimmed)) {
      return { valid: false, error: `Semicolon inside node label: ${trimmed}` };
    }
    // Detect unclosed brackets
    const openBrackets = (trimmed.match(/\[/g) || []).length;
    const closeBrackets = (trimmed.match(/\]/g) || []).length;
    if (openBrackets !== closeBrackets) {
      return { valid: false, error: `Unclosed bracket in: ${trimmed}` };
    }
  }
  return { valid: true };
}

const DiagramSchema = z.object({
  gap_id: z.string(),
  gap_name: z.string(),
  system_title: z.string(),
  mermaid_script: z.string(),
  is_validated: z.boolean(),
  node_count: z.number(),
  diagram_narrative: z.string(),
});

export type Diagram = z.infer<typeof DiagramSchema>;

async function generateDiagramForGap(
  gap: Gap,
  matchingSolution: SolutionsOutput["solutions"][number] | undefined,
  profile: BusinessProfile
): Promise<Diagram> {
  const client = getOpenAIClient();

  const functionProfile = profile.function_profiles[gap.business_function];
  const tools = [
    ...(matchingSolution?.primary_tools ?? []),
    ...(matchingSolution?.new_tools_required ?? []),
    ...profile.business_profile.current_tool_stack,
  ].slice(0, 6);

  const buildPrompt = (errorFeedback?: string) => {
    const base = `Design a Mermaid flowchart for this automated system:

GAP: ${gap.gap_name}
HOW IT WORKS: ${matchingSolution?.how_it_works ?? gap.current_situation}
TOOLS TO USE: ${tools.join(", ")}
TEAM STRUCTURE: ${profile.business_profile.team_structure.slice(0, 200)}
${functionProfile?.exists ? `FUNCTION CONTEXT: ${functionProfile.profile.slice(0, 200)}` : ""}

Output ONLY the mermaid script. Start with: flowchart LR`;

    if (errorFeedback) {
      return `${base}\n\nPREVIOUS ATTEMPT HAD THIS SYNTAX ERROR: ${errorFeedback}\nFix it and output only the corrected mermaid script.`;
    }
    return base;
  };

  // Generate narrative separately (always succeeds)
  const narrativeResponse = await client.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: `Write a 3-paragraph plain-language walkthrough of this automated system for ${profile.business_profile.name}:
Gap: ${gap.gap_name}
Solution: ${matchingSolution?.how_it_works ?? "Automated workflow"}
Tools: ${tools.join(", ")}
Write as if explaining to a non-technical business owner. Reference specific tools and steps.`,
      },
    ],
  });
  const diagramNarrative = narrativeResponse.choices[0].message.content?.trim() ?? "";

  // Attempt diagram generation with 2 retries
  let mermaidScript = "";
  let isValidated = false;

  for (let attempt = 0; attempt < 3; attempt++) {
    const errorFeedback = attempt > 0 ? validateMermaidScript(mermaidScript).error : undefined;
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 600,
      temperature: attempt === 0 ? 0.2 : 0.1,
      messages: [
        { role: "system", content: DIAGRAM_SYSTEM_PROMPT },
        { role: "user", content: buildPrompt(errorFeedback) },
      ],
    });

    mermaidScript = response.choices[0].message.content?.trim() ?? "";
    // Strip any accidental fences
    mermaidScript = mermaidScript.replace(/^```mermaid\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

    const validation = validateMermaidScript(mermaidScript);
    if (validation.valid) {
      isValidated = true;
      break;
    }
    console.warn(`[Agent6] Diagram attempt ${attempt + 1} invalid for "${gap.gap_name}":`, validation.error);
  }

  if (!isValidated) {
    console.warn(`[Agent6] Skipping diagram for "${gap.gap_name}" after 3 failed attempts`);
  }

  const nodeCount = (mermaidScript.match(/-->/g) || []).length + 1;

  return {
    gap_id: gap.gap_id,
    gap_name: gap.gap_name,
    system_title: `Automated ${gap.gap_name} System`,
    mermaid_script: isValidated ? mermaidScript : "",
    is_validated: isValidated,
    node_count: nodeCount,
    diagram_narrative: diagramNarrative,
  };
}

export async function runDiagramArchitect(
  profile: BusinessProfile,
  gapAnalysis: GapAnalysis,
  solutions: SolutionsOutput
): Promise<{ diagrams: Diagram[] }> {
  console.log("[Pipeline] Agent 6 starting — Diagram Architect");

  // Take top 4 gaps by priority rank
  const topGaps = gapAnalysis.gaps
    .sort((a, b) => a.priority_rank - b.priority_rank)
    .slice(0, 4);

  const results = await Promise.allSettled(
    topGaps.map((gap) => {
      const matchingSolution = solutions.solutions.find((s) => s.gap_id === gap.gap_id);
      return generateDiagramForGap(gap, matchingSolution, profile);
    })
  );

  const diagrams: Diagram[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      diagrams.push(result.value);
    } else {
      console.error("[Agent6] Diagram generation failed:", result.reason);
    }
  }

  console.log("[Pipeline] Agent 6 complete —", diagrams.length, "diagrams,", diagrams.filter((d) => d.is_validated).length, "validated");
  return { diagrams };
}
```

---

### Task 13: Agent 7 — Final Compiler

**Files:**
- Create: `lib/ai/agents/final-compiler.ts`

```typescript
import { createSupabaseServerClient } from "~/lib/supabase/server";
import { sendEmail } from "~/lib/email";
import { reportReadyEmail } from "~/lib/emails/report-ready";
import type { BusinessProfile } from "./business-profiler";
import type { GapAnalysis } from "./gap-analyzer";
import type { SolutionsOutput } from "./solution-mapper";
import type { ReportContent } from "./report-assembler";
import type { Diagram } from "./diagram-architect";

interface FinalCompilerParams {
  sessionId: string;
  userId: string;
  userEmail: string | null;
  profile: BusinessProfile;
  gapAnalysis: GapAnalysis;
  solutions: SolutionsOutput;
  reportContent: ReportContent;
  diagrams: Diagram[];
}

export async function runFinalCompiler(params: FinalCompilerParams): Promise<{ reportId: string }> {
  console.log("[Pipeline] Agent 7 starting — Final Compiler");
  const supabase = createSupabaseServerClient();

  // Validate all required sections present
  const requiredChecks = [
    { field: "section_1", value: params.reportContent.section_1_business_snapshot.narrative },
    { field: "section_2", value: params.reportContent.section_2_maturity_score.score_narrative },
    { field: "section_3", value: params.reportContent.section_3_gaps.gaps_overview_narrative },
    { field: "section_7", value: params.reportContent.section_7_roadmap.roadmap_intro },
    { field: "gaps", value: params.gapAnalysis.gaps.length > 0 ? "ok" : "" },
    { field: "solutions", value: params.solutions.solutions.length > 0 ? "ok" : "" },
  ];

  for (const check of requiredChecks) {
    if (!check.value) {
      throw new Error(`Agent 7: Required section "${check.field}" is missing or empty`);
    }
  }

  // Check for previous report (for comparison)
  const { data: previousReport } = await supabase
    .from("reports")
    .select("id, overall_score, function_scores, created_at")
    .eq("user_id", params.userId)
    .neq("session_id", params.sessionId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const comparison = previousReport
    ? {
        has_previous_audit: true,
        previous_report_id: previousReport.id,
        previous_audit_date: previousReport.created_at,
        overall_score_change: params.gapAnalysis.overall_maturity_score - (previousReport.overall_score ?? 0),
        function_score_changes: Object.fromEntries(
          Object.entries(params.gapAnalysis.function_scores).map(([fn, data]) => [
            fn,
            data.score - ((previousReport.function_scores as Record<string, { score: number }>)?.[fn]?.score ?? 0),
          ])
        ),
      }
    : { has_previous_audit: false };

  // Map data to the existing reports table columns + new columns
  const gapsPreview = params.gapAnalysis.gaps.slice(0, 2).map((g) => ({
    name: g.gap_name,
    severity: g.severity,
    description: g.current_situation,
    why_this_matters: g.why_this_matters,
    time_cost_per_week_hours: g.time_cost_per_week_hours,
    estimated_annual_cost: g.estimated_annual_cost,
    priority_rank: g.priority_rank,
  }));

  const teaserGap = params.gapAnalysis.gaps[2]
    ? {
        name: params.gapAnalysis.gaps[2].gap_name,
        severity: params.gapAnalysis.gaps[2].severity,
        description: params.gapAnalysis.gaps[2].current_situation,
        why_this_matters: params.gapAnalysis.gaps[2].why_this_matters,
      }
    : null;

  const quickWinSolutions = params.solutions.solutions.filter((s) => s.implementation_complexity === "simple");
  const roiAnalysis = {
    estimated_hrs_saved_monthly: params.solutions.total_roi_summary.total_hours_saved_per_week * 4,
    potential_revenue_lift: params.gapAnalysis.overall_maturity_score < 50 ? "30–50%" : "15–25%",
    payback_period: "30–60 days",
    total_hrs_saved_monthly: params.solutions.total_roi_summary.total_hours_saved_per_week * 4,
    total_cost_saved_per_year: params.solutions.total_roi_summary.total_cost_saved_per_year,
  };

  // Build roadmap text for implementation_plan column
  const rc = params.reportContent.section_7_roadmap;
  const roadmapText = [
    rc.roadmap_intro,
    rc.quick_wins.length ? `Quick Wins (1 Week):\n${rc.quick_wins.map((w) => `• ${w.name}: ${w.description}`).join("\n")}` : "",
    rc.medium_term.length ? `Medium Term (1 Month):\n${rc.medium_term.map((w) => `• ${w.name}: ${w.description}`).join("\n")}` : "",
    rc.strategic.length ? `Strategic (1–3 Months):\n${rc.strategic.map((w) => `• ${w.name}: ${w.description}`).join("\n")}` : "",
    rc.roadmap_closing,
  ].filter(Boolean).join("\n\n");

  const { data: report, error: reportError } = await supabase
    .from("reports")
    .insert({
      session_id: params.sessionId,
      user_id: params.userId,
      overall_score: params.gapAnalysis.overall_maturity_score,
      function_scores: params.gapAnalysis.function_scores,
      business_summary: `${params.reportContent.section_1_business_snapshot.headline}\n\n${params.reportContent.section_1_business_snapshot.narrative}`,
      gaps_preview: gapsPreview,
      teaser_gap: teaserGap,
      full_gaps: params.gapAnalysis.gaps.map((g) => ({
        name: g.gap_name,
        severity: g.severity,
        description: g.current_situation,
        why_this_matters: g.why_this_matters,
        time_cost_per_week_hours: g.time_cost_per_week_hours,
        estimated_annual_cost: g.estimated_annual_cost,
        priority_rank: g.priority_rank,
        business_function: g.business_function,
        automation_potential: g.automation_potential,
      })),
      solutions: params.solutions.solutions.map((s) => ({
        name: s.solution_name,
        hrs: s.roi.hours_saved_per_week * 4,
        type: s.implementation_complexity === "simple" ? "quick_win" : s.implementation_complexity === "medium" ? "medium" : "strategic",
        locked: s.implementation_complexity !== "simple",
        gapName: params.gapAnalysis.gaps.find((g) => g.gap_id === s.gap_id)?.gap_name ?? "",
        howItWorks: s.how_it_works,
        toolsRecommended: [...s.primary_tools, ...s.new_tools_required],
        roiEstimate: `Save ~$${Math.round(s.roi.cost_saved_per_year / 12)}/month`,
        setupTimeHrs: s.estimated_setup_hours,
      })),
      roi_analysis: roiAnalysis,
      mermaid_before: null,
      mermaid_after: null,
      implementation_plan: roadmapText,
      diagrams: params.diagrams,
      roadmap: params.reportContent.section_7_roadmap,
      comparison,
      gap_analysis_narrative: params.gapAnalysis.gap_analysis_narrative,
    })
    .select("id")
    .single();

  if (reportError || !report) {
    console.error("[Agent7] Report insert failed:", reportError);
    throw new Error("Agent 7: Failed to save report to database");
  }

  // Create implementation items
  const implItems = params.solutions.solutions.map((s) => ({
    report_id: report.id,
    user_id: params.userId,
    gap_name: s.solution_name,
    priority: s.implementation_complexity === "simple" ? "quick_win" : s.implementation_complexity === "medium" ? "medium" : "strategic",
    time_saved_hrs: s.roi.hours_saved_per_week * 4,
    status: "not_started" as const,
  }));

  if (implItems.length > 0) {
    await supabase.from("implementation_items").insert(implItems).then(({ error }) => {
      if (error) console.error("[Agent7] Implementation items insert failed:", error);
    });
  }

  // Mark session complete
  await supabase.from("audit_sessions").update({
    status: "complete",
    completed_at: new Date().toISOString(),
    pipeline_stage: "complete",
  }).eq("id", params.sessionId);

  // Send report-ready email (non-blocking)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:8080";
  if (params.userEmail) {
    sendEmail({
      to: params.userEmail,
      subject: `Your ${params.profile.business_profile.name} audit report is ready`,
      html: reportReadyEmail({
        businessName: params.profile.business_profile.name,
        reportUrl: `${baseUrl}/report/${report.id}`,
        overallScore: params.gapAnalysis.overall_maturity_score,
        hrsPerMonth: params.solutions.total_roi_summary.total_hours_saved_per_week * 4,
      }),
    }).catch((err) => console.error("[Agent7] Email send failed:", err));
  }

  console.log("[Pipeline] Agent 7 complete — Report ID:", report.id);
  return { reportId: report.id };
}
```

---

### Task 14: Create Pipeline Orchestrator

**Files:**
- Create: `lib/ai/agents/pipeline.ts`

```typescript
import { createSupabaseServerClient } from "~/lib/supabase/server";
import { runBusinessProfiler } from "./business-profiler";
import { runGapAnalyzer } from "./gap-analyzer";
import { runSolutionMapper } from "./solution-mapper";
import { runReportAssembler } from "./report-assembler";
import { runDiagramArchitect } from "./diagram-architect";
import { runFinalCompiler } from "./final-compiler";

async function withRetry<T>(
  fn: () => Promise<T>,
  label: string,
  retries = 1
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retries > 0) {
      console.warn(`[Pipeline] ${label} failed, retrying...`, err);
      return withRetry(fn, label, retries - 1);
    }
    throw err;
  }
}

async function updateStage(sessionId: string, stage: string) {
  const supabase = createSupabaseServerClient();
  await supabase
    .from("audit_sessions")
    .update({ pipeline_stage: stage })
    .eq("id", sessionId);
}

export async function runPipeline(params: {
  sessionId: string;
  userId: string;
  userEmail: string | null;
  workspaceId: string | null;
}): Promise<{ reportId: string }> {
  const { sessionId, userId, userEmail, workspaceId } = params;
  const supabase = createSupabaseServerClient();

  console.log("[Pipeline] Starting for session:", sessionId);

  // Load session data
  const { data: session } = await supabase
    .from("audit_sessions")
    .select("business_name, industry, company_size, detected_tool_stack")
    .eq("id", sessionId)
    .single();

  if (!session) throw new Error("Session not found");

  // Load all answers
  const { data: dbAnswers } = await supabase
    .from("audit_answers")
    .select("question_text, answer_text, question_category")
    .eq("session_id", sessionId)
    .order("question_order", { ascending: true });

  const answers = (dbAnswers ?? []).map((a) => ({
    question: a.question_text,
    answer: a.answer_text,
    category: a.question_category ?? "general",
  }));

  if (answers.length === 0) {
    throw new Error("No answers found for session");
  }

  // ── Agent 2 ───────────────────────────────────────────────────────────────
  await updateStage(sessionId, "profiling");
  const profile = await withRetry(
    () => runBusinessProfiler({
      businessName: session.business_name,
      industry: session.industry,
      companySize: session.company_size,
      answers,
      detectedToolStack: session.detected_tool_stack ?? [],
    }),
    "Agent 2"
  );

  // ── Agent 3 ───────────────────────────────────────────────────────────────
  await updateStage(sessionId, "analyzing");
  const gapAnalysis = await withRetry(() => runGapAnalyzer(profile), "Agent 3");

  // ── Agent 4 ───────────────────────────────────────────────────────────────
  await updateStage(sessionId, "mapping_solutions");
  const solutions = await withRetry(
    () => runSolutionMapper(profile, gapAnalysis, workspaceId),
    "Agent 4"
  );

  // ── Agents 5 + 6 in parallel ──────────────────────────────────────────────
  await updateStage(sessionId, "assembling_report");
  const [reportContent, diagramsResult] = await Promise.all([
    withRetry(() => runReportAssembler(profile, gapAnalysis, solutions), "Agent 5"),
    withRetry(() => runDiagramArchitect(profile, gapAnalysis, solutions), "Agent 6"),
  ]);

  // ── Agent 7 ───────────────────────────────────────────────────────────────
  await updateStage(sessionId, "compiling");
  const result = await withRetry(
    () => runFinalCompiler({
      sessionId,
      userId,
      userEmail,
      profile,
      gapAnalysis,
      solutions,
      reportContent,
      diagrams: diagramsResult.diagrams,
    }),
    "Agent 7"
  );

  console.log("[Pipeline] Complete. Report:", result.reportId);
  return result;
}
```

---

## Phase D — API Route Updates

### Task 15: Update complete/route.ts — Fire-and-Forget Pipeline

**Files:**
- Modify: `app/api/audit/complete/route.ts`

**Step 1: Full rewrite**
```typescript
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "~/lib/supabase/server";
import { runPipeline } from "~/lib/ai/agents/pipeline";
import { z } from "zod";

const CompleteSchema = z.object({
  sessionId: z.string().min(1),
});

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: z.infer<typeof CompleteSchema>;
  try {
    const raw = await req.json();
    const parsed = CompleteSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    body = parsed.data;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { sessionId } = body;

  const { data: session } = await supabase
    .from("audit_sessions")
    .select("id, status, user_id, workspace_id")
    .eq("id", sessionId)
    .single();

  if (!session || session.user_id !== user.id) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // Already complete
  if (session.status === "complete") {
    const { data: report } = await supabase
      .from("reports")
      .select("id")
      .eq("session_id", sessionId)
      .single();
    return NextResponse.json({ status: "complete", reportId: report?.id });
  }

  // Already processing — just tell client to poll
  if (session.status === "processing") {
    return NextResponse.json({ status: "processing" });
  }

  // Mark as processing immediately
  await supabase.from("audit_sessions")
    .update({ status: "processing", pipeline_stage: "starting" })
    .eq("id", sessionId);

  // Fire-and-forget pipeline
  runPipeline({
    sessionId,
    userId: user.id,
    userEmail: user.email ?? null,
    workspaceId: session.workspace_id ?? null,
  }).catch(async (err) => {
    console.error("[Complete] Pipeline failed:", err);
    await supabase.from("audit_sessions")
      .update({ status: "in_progress", pipeline_stage: null })
      .eq("id", sessionId);
  });

  return NextResponse.json({ status: "processing" });
}
```

---

## Phase E — Report Page Components

### Task 16: Create DiagramSection.tsx

**Files:**
- Create: `app/report/[reportId]/_components/DiagramSection.tsx`

```tsx
"use client";

import { useEffect, useRef } from "react";

interface Diagram {
  gap_id: string;
  gap_name: string;
  system_title: string;
  mermaid_script: string;
  is_validated: boolean;
  diagram_narrative: string;
}

interface DiagramSectionProps {
  diagrams: Diagram[];
}

function DiagramCard({ diagram }: { diagram: Diagram }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!diagram.is_validated || !diagram.mermaid_script || !containerRef.current) return;
    let cancelled = false;

    import("mermaid").then((mermaidMod) => {
      if (cancelled || !containerRef.current) return;
      const mermaid = mermaidMod.default;
      mermaid.initialize({ startOnLoad: false, theme: "dark", securityLevel: "loose" });
      const id = `diagram-${diagram.gap_id.replace(/[^a-z0-9]/gi, "")}`;
      try {
        mermaid.render(id, diagram.mermaid_script).then(({ svg }) => {
          if (!cancelled && containerRef.current) {
            containerRef.current.innerHTML = svg;
          }
        }).catch(() => {
          if (!cancelled && containerRef.current) {
            containerRef.current.innerHTML = "";
          }
        });
      } catch {
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = "";
        }
      }
    });

    return () => { cancelled = true; };
  }, [diagram]);

  return (
    <div className="bg-card shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl p-8">
      <h3 className="text-foreground font-medium text-[18px] mb-2 tracking-tight">
        {diagram.system_title}
      </h3>
      <p className="text-muted-foreground text-[13px] uppercase tracking-widest mb-6">
        {diagram.gap_name}
      </p>

      {diagram.is_validated && diagram.mermaid_script ? (
        <div
          ref={containerRef}
          className="w-full overflow-x-auto bg-background/50 rounded-xl p-4 min-h-[120px] flex items-center justify-center"
        />
      ) : null}

      <div className="mt-6 border-t border-border/20 pt-6">
        <p className="text-muted-foreground text-[13px] uppercase tracking-widest mb-3 font-medium">
          How This Works
        </p>
        <p className="text-muted-foreground text-[15px] leading-relaxed whitespace-pre-line">
          {diagram.diagram_narrative}
        </p>
      </div>
    </div>
  );
}

export default function DiagramSection({ diagrams }: DiagramSectionProps) {
  if (!diagrams || diagrams.length === 0) return null;

  return (
    <section>
      <h2 className="text-foreground font-medium text-[24px] mb-6 tracking-tight">
        Automation Blueprints
      </h2>
      <div className="space-y-6">
        {diagrams.map((diagram) => (
          <DiagramCard key={diagram.gap_id} diagram={diagram} />
        ))}
      </div>
    </section>
  );
}
```

---

### Task 17: Create RoadmapSection.tsx

**Files:**
- Create: `app/report/[reportId]/_components/RoadmapSection.tsx`

```tsx
import { Zap, Clock, TrendingUp } from "lucide-react";

interface RoadmapItem {
  name: string;
  description: string;
  timeline: string;
}

interface Roadmap {
  roadmap_intro: string;
  quick_wins: RoadmapItem[];
  medium_term: RoadmapItem[];
  strategic: RoadmapItem[];
  roadmap_closing: string;
}

interface RoadmapSectionProps {
  roadmap: Roadmap | null;
}

const PHASES = [
  {
    key: "quick_wins" as const,
    label: "Quick Wins",
    sublabel: "Implement within 1 week",
    icon: <Zap className="w-5 h-5" />,
    color: "#4ADE80",
  },
  {
    key: "medium_term" as const,
    label: "Medium Term",
    sublabel: "Implement within 1 month",
    icon: <Clock className="w-5 h-5" />,
    color: "#F59E0B",
  },
  {
    key: "strategic" as const,
    label: "Strategic",
    sublabel: "Implement within 1–3 months",
    icon: <TrendingUp className="w-5 h-5" />,
    color: "#7C6EF8",
  },
];

export default function RoadmapSection({ roadmap }: RoadmapSectionProps) {
  if (!roadmap) return null;

  return (
    <section>
      <h2 className="text-foreground font-medium text-[24px] mb-6 tracking-tight">
        Implementation Roadmap
      </h2>

      {roadmap.roadmap_intro && (
        <p className="text-muted-foreground text-[15px] leading-relaxed mb-8 max-w-3xl">
          {roadmap.roadmap_intro}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {PHASES.map((phase) => {
          const items = roadmap[phase.key];
          if (!items || items.length === 0) return null;
          return (
            <div key={phase.key} className="bg-card shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5" style={{ color: phase.color }}>
                {phase.icon}
                <div>
                  <p className="font-semibold text-[15px] text-foreground">{phase.label}</p>
                  <p className="text-[12px] text-muted-foreground">{phase.sublabel}</p>
                </div>
              </div>
              <div className="space-y-4">
                {items.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: `${phase.color}20`, color: phase.color }}
                    >
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-foreground text-[14px] font-medium">{item.name}</p>
                      <p className="text-muted-foreground text-[13px] leading-relaxed mt-1">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {roadmap.roadmap_closing && (
        <div className="mt-8 bg-primary/5 border border-primary/20 rounded-2xl p-6">
          <p className="text-foreground text-[15px] leading-relaxed">{roadmap.roadmap_closing}</p>
        </div>
      )}
    </section>
  );
}
```

---

### Task 18: Update report/[reportId]/page.tsx — Add new sections + new data shapes

**Files:**
- Modify: `app/report/[reportId]/page.tsx`

Replace the imports and JSX to include DiagramSection and RoadmapSection, and pass new columns:

```tsx
import DiagramSection from "./_components/DiagramSection";
import RoadmapSection from "./_components/RoadmapSection";
```

In the data query, add new columns:
```tsx
const { data: report } = await supabase
  .from("reports")
  .select(`
    id, overall_score, function_scores, business_summary,
    gaps_preview, teaser_gap, full_gaps, solutions, roi_analysis,
    diagrams, roadmap, gap_analysis_narrative,
    created_at,
    audit_sessions (
      id, business_name, industry, company_size
    )
  `)
  .eq("id", params.reportId)
  .single();
```

Add these type declarations and variable extractions after existing ones:
```tsx
const diagrams = (report?.diagrams as Diagram[]) ?? [];
const roadmap = (report?.roadmap as Roadmap) ?? null;
```

Add to the JSX render tree (after ROISection):
```tsx
<DiagramSection diagrams={diagrams} />
<RoadmapSection roadmap={roadmap} />
```

Also add type interfaces:
```tsx
export interface Diagram {
  gap_id: string;
  gap_name: string;
  system_title: string;
  mermaid_script: string;
  is_validated: boolean;
  diagram_narrative: string;
}

export interface Roadmap {
  roadmap_intro: string;
  quick_wins: Array<{ name: string; description: string; timeline: string }>;
  medium_term: Array<{ name: string; description: string; timeline: string }>;
  strategic: Array<{ name: string; description: string; timeline: string }>;
  roadmap_closing: string;
}
```

---

## Phase F — Seed Data

### Task 19: Create Seed Script

**Files:**
- Create: `scripts/seed-case-studies.ts`

```typescript
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CASE_STUDIES = [
  {
    title: "Automated Lead Follow-Up with AI Voice Agent",
    industry: "general",
    business_function: "sales",
    problem: "Sales team manually called every new lead within 24-48 hours, missing 40% due to volume",
    solution: "Deployed VAPI AI voice agent to call every new lead within 60 seconds of form submission, qualify them, and book meetings directly into Cal.com",
    result: "Lead response time dropped from 24hrs to 60 seconds. Meeting booking rate increased 3x. Sales team now only handles qualified calls.",
    tools_used: ["VAPI", "Cal.com", "GoHighLevel", "n8n"],
  },
  {
    title: "Invoice Processing Automation with QuickBooks + Make.com",
    industry: "general",
    business_function: "finance",
    problem: "Finance team spent 8 hours/week manually creating invoices, reconciling payments, and chasing late payers",
    solution: "Built automated workflow: completed job triggers invoice creation in QuickBooks, payment link sent via email, automated follow-up sequence for late payments",
    result: "Invoice processing time reduced from 8hrs to 20 minutes/week. Late payment rate dropped 60%. Cash flow improved significantly.",
    tools_used: ["QuickBooks", "Make.com", "Stripe", "Gmail"],
  },
  {
    title: "Customer Onboarding Email Sequence Automation",
    industry: "general",
    business_function: "customer_support",
    problem: "New customers received inconsistent onboarding — some got calls, some got nothing, churn in first 90 days was high",
    solution: "Built 12-touch email sequence triggered on contract signing, personalised by service type, with automated check-in calls at day 7 and day 30",
    result: "First-90-day churn dropped 45%. Customer satisfaction scores increased. Onboarding team freed from 6hrs/week of manual emails.",
    tools_used: ["ActiveCampaign", "Zapier", "DocuSign", "VAPI"],
  },
  {
    title: "Social Media Content Scheduling Pipeline",
    industry: "general",
    business_function: "marketing",
    problem: "Marketing team spent 5 hours/week manually writing, formatting, and posting social media content across 4 platforms",
    solution: "Built AI content pipeline: GPT-4 generates weekly content from business updates, human reviews in 30 mins, n8n schedules posts across all platforms automatically",
    result: "Content creation time reduced from 5hrs to 45 minutes/week. Posting consistency increased from 3x/week to daily. Engagement up 40%.",
    tools_used: ["n8n", "OpenAI", "Buffer", "Notion"],
  },
  {
    title: "Field Service Scheduling Automation",
    industry: "general",
    business_function: "operations",
    problem: "Operations manager spent 3 hours/day manually scheduling field technicians, leading to conflicts and missed appointments",
    solution: "Integrated Jobber with Google Calendar and SMS automation — customers self-book via Cal.com, system auto-assigns nearest available technician",
    result: "Scheduling time reduced from 3hrs/day to 20 minutes. Double-bookings eliminated. Customer satisfaction improved with automated appointment reminders.",
    tools_used: ["Jobber", "Cal.com", "Twilio", "Google Calendar"],
  },
  {
    title: "Proposal Generation with AI + PandaDoc",
    industry: "general",
    business_function: "sales",
    problem: "Sales team took 2-4 hours to manually create each proposal, limiting them to 3-4 proposals/week",
    solution: "Built GPT-4 powered proposal generator: sales rep fills 10-field form, AI generates full proposal draft, auto-populated into PandaDoc template and sent for e-signature",
    result: "Proposal creation time reduced from 3hrs to 20 minutes. Sales team now delivers 15+ proposals/week. Win rate unchanged, but volume 4x.",
    tools_used: ["PandaDoc", "OpenAI", "Zapier", "HubSpot"],
  },
  {
    title: "HR Onboarding Workflow Automation",
    industry: "general",
    business_function: "hr",
    problem: "HR team spent 6 hours per new hire on paperwork, access provisioning, and first-week check-ins",
    solution: "Built end-to-end onboarding workflow: offer letter e-signed triggers account creation, equipment request, 30-60-90 day check-in schedule, and buddy assignment automatically",
    result: "HR onboarding time reduced from 6hrs to 1hr per hire. New hire satisfaction scores improved. HR team now handles 3x more hires without additional staff.",
    tools_used: ["BambooHR", "Zapier", "Slack", "Google Workspace"],
  },
  {
    title: "Sales Pipeline Reporting Dashboard",
    industry: "general",
    business_function: "data_reporting",
    problem: "Sales manager spent 4 hours every Monday pulling data from 3 systems to create weekly pipeline report",
    solution: "Built automated data pipeline: HubSpot + Stripe + Jobber data auto-synced to Google Sheets every night, dashboard auto-emails Monday 8am",
    result: "Weekly reporting time eliminated entirely. Manager now reviews live dashboard in 15 minutes. Data accuracy improved with no manual entry.",
    tools_used: ["HubSpot", "Stripe", "Make.com", "Google Sheets", "Looker Studio"],
  },
  {
    title: "CRM Data Entry Automation from Calls",
    industry: "general",
    business_function: "technology",
    problem: "Sales team manually typed call notes into CRM after every call, taking 15 minutes per call and often forgetting critical details",
    solution: "Integrated call recording with AI transcription — every call auto-transcribed, GPT-4 extracts key info, CRM record updated automatically within 2 minutes of call ending",
    result: "Post-call admin eliminated. CRM data quality improved dramatically. Sales team gained 1.5 hours/day. Follow-up accuracy increased.",
    tools_used: ["Fireflies.ai", "OpenAI", "HubSpot", "Zapier"],
  },
  {
    title: "Customer Support Ticket Triage with AI",
    industry: "general",
    business_function: "customer_support",
    problem: "Support team spent 2 hours/day manually reading, categorising, and routing incoming support tickets",
    solution: "Built AI triage system: incoming emails classified by urgency and type, auto-routed to correct team member, FAQs auto-answered without human intervention",
    result: "Ticket triage time eliminated. First-response time improved from 4hrs to 15 minutes for urgent tickets. 35% of tickets resolved by AI without human involvement.",
    tools_used: ["Intercom", "OpenAI", "Zapier", "Zendesk"],
  },
  {
    title: "Payment Collection Automation for Recurring Clients",
    industry: "general",
    business_function: "finance",
    problem: "Accounts team manually chased 20-30 overdue invoices per month, spending 5 hours and often damaging client relationships",
    solution: "Built automated payment reminder sequence: 7-day, 3-day, 1-day pre-due reminders via email and SMS, post-due escalation at day 3, 7, 14 with auto-call at day 30",
    result: "Overdue accounts reduced 70%. Manual collection calls eliminated for 80% of cases. Average payment time reduced from 45 days to 18 days.",
    tools_used: ["Stripe", "Twilio", "ActiveCampaign", "QuickBooks"],
  },
  {
    title: "Job Completion Follow-Up and Review Request Automation",
    industry: "general",
    business_function: "marketing",
    problem: "Company rarely asked for reviews and follow-up was inconsistent — missing upsell opportunities and leaving revenue on the table",
    solution: "Job completion triggers: automated satisfaction survey, Google review request (if satisfied), and upsell sequence for complementary services",
    result: "Google review volume increased 8x. Upsell revenue from existing customers increased 25%. NPS improved from 42 to 71.",
    tools_used: ["Jobber", "Twilio", "n8n", "Google Business Profile"],
  },
  {
    title: "Automated Estimate-to-Job Conversion Follow-Up",
    industry: "general",
    business_function: "sales",
    problem: "Sales team sent estimates but rarely followed up systematically — losing 30% of warm leads to competitors",
    solution: "Estimate sent triggers 5-touch follow-up sequence over 14 days via SMS and email, auto-personalised with estimate details, stops immediately on acceptance",
    result: "Estimate conversion rate improved from 35% to 52%. No additional sales headcount. Follow-up consistency reached 100% vs 40% previously.",
    tools_used: ["GoHighLevel", "Twilio", "n8n", "Jobber"],
  },
  {
    title: "Team Time Tracking and Payroll Automation",
    industry: "general",
    business_function: "hr",
    problem: "Payroll took 6 hours every fortnight — manually collecting timesheets from field staff, calculating pay, and entering into accounting system",
    solution: "Field staff clock in/out via mobile app, hours auto-calculated with overtime rules, approved hours auto-export to Xero for payroll processing",
    result: "Payroll processing time reduced from 6hrs to 45 minutes. Timesheet errors eliminated. Staff paid accurately and on time every cycle.",
    tools_used: ["Deputy", "Xero", "Zapier"],
  },
  {
    title: "Lead Source Attribution and Marketing ROI Tracking",
    industry: "general",
    business_function: "data_reporting",
    problem: "Marketing team couldn't identify which channels drove revenue — spending budget without knowing what worked",
    solution: "Built UTM tracking system across all channels, connected to CRM and invoicing — every closed deal now attributed to original marketing source",
    result: "Marketing team identified that 60% of revenue came from Google Ads and referrals. Reallocated budget, reducing CAC by 40%. First data-driven marketing decisions made.",
    tools_used: ["HubSpot", "Google Analytics", "Looker Studio", "Stripe"],
  },
  {
    title: "Automated Subcontractor Compliance Tracking",
    industry: "general",
    business_function: "operations",
    problem: "Operations manager manually tracked insurance certificates and licenses for 15 subcontractors — often discovering expiries only after assigning jobs",
    solution: "Built compliance tracker: expiry dates in database, automated renewal reminders to subs at 60/30/7 days, job assignment blocked if sub is non-compliant",
    result: "Compliance violations eliminated. Operations manager saves 2hrs/week. Subcontractors now self-manage renewals proactively.",
    tools_used: ["Airtable", "n8n", "Twilio", "Zapier"],
  },
  {
    title: "Customer Referral Program Automation",
    industry: "general",
    business_function: "marketing",
    problem: "Had no formal referral program — relying on word-of-mouth without tracking or incentivising referrals",
    solution: "Built automated referral system: unique referral link per customer, tracking dashboard, automated reward payment when referred customer completes first job",
    result: "Referrals went from 5/month to 22/month within 90 days. Referral became highest-converting channel. Cost per acquisition via referral is 80% lower than paid ads.",
    tools_used: ["ReferralHero", "Stripe", "ActiveCampaign", "n8n"],
  },
  {
    title: "Property/Site Assessment Report Automation",
    industry: "general",
    business_function: "operations",
    problem: "Field staff took 90 minutes per site assessment to complete paperwork, transfer photos, and write up reports back at the office",
    solution: "Mobile form with photo capture, voice-to-text notes, auto-populates report template, generates PDF report and emails client within 5 minutes of assessment completion",
    result: "Assessment report time reduced from 90 minutes to 10 minutes. Reports delivered same-day vs next-day. Client satisfaction with speed improved dramatically.",
    tools_used: ["Jobtread", "n8n", "OpenAI", "DocuSign"],
  },
  {
    title: "Staff Performance and Feedback Loop Automation",
    industry: "general",
    business_function: "hr",
    problem: "Performance reviews happened once a year with no ongoing feedback loop — issues festered and top performers weren't recognised",
    solution: "Monthly automated pulse surveys to all staff, manager alerts for low scores, automated recognition messages for high performance, quarterly review reminders",
    result: "Staff turnover reduced 30%. Issues identified and resolved faster. Employee satisfaction scores increased. Manager overhead for HR reduced significantly.",
    tools_used: ["Lattice", "Slack", "n8n", "Google Forms"],
  },
  {
    title: "Chatbot Lead Capture and Qualification",
    industry: "general",
    business_function: "sales",
    problem: "Website visitors left without engaging — no way to capture leads outside business hours, losing 60% of enquiries",
    solution: "Deployed AI chatbot on website: qualifies visitors, captures contact details, books consultations directly, passes qualified leads to CRM with full conversation context",
    result: "Lead capture rate from website increased 4x. 40% of bookings now happen outside business hours. Sales team receives pre-qualified leads with full context.",
    tools_used: ["Intercom", "OpenAI", "Cal.com", "HubSpot"],
  },
];

async function embed(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}

async function main() {
  console.log("Seeding case studies...");

  for (const cs of CASE_STUDIES) {
    const embeddingText = `${cs.title}. Problem: ${cs.problem}. Solution: ${cs.solution}. Function: ${cs.business_function}.`;
    const embedding = await embed(embeddingText);

    const { error } = await supabase.from("case_studies").upsert({
      title: cs.title,
      industry: cs.industry,
      business_function: cs.business_function,
      problem: cs.problem,
      solution: cs.solution,
      result: cs.result,
      tools_used: cs.tools_used,
      embedding,
      workspace_id: null, // platform-wide
    }, { onConflict: "title" });

    if (error) {
      console.error(`Failed to insert "${cs.title}":`, error.message);
    } else {
      console.log(`✓ ${cs.title}`);
    }

    // Rate limit: 1 embedding per 100ms
    await new Promise((r) => setTimeout(r, 100));
  }

  console.log("Done! Seeded", CASE_STUDIES.length, "case studies.");
}

main().catch(console.error);
```

**Step 2: Run seed script**
```bash
OPENAI_API_KEY=your_key NEXT_PUBLIC_SUPABASE_URL=your_url SUPABASE_SERVICE_ROLE_KEY=your_key npx ts-node --project tsconfig.json scripts/seed-case-studies.ts
```

---

## Verification Checklist

### Agent 1 (Live SSE)
1. Start a new audit, answer 3 questions
2. DevTools → Network → `/api/audit/answer` → verify `Transfer-Encoding: chunked`
3. Question text appears progressively (typing animation)
4. Supabase → `audit_sessions` → `coverage_status` updates after each answer
5. After completing audit → `is_complete: true` triggers completion

### Background Pipeline (Agents 2–7)
1. Complete a full audit
2. Server logs show: `[Pipeline] Agent 2 starting` through `[Pipeline] Agent 7 complete`
3. `/api/audit/status/[sessionId]` returns `{ status: "processing" }` while running
4. On completion → returns `{ status: "complete", reportId: "..." }`
5. `/report/[reportId]` renders with real data in all sections including DiagramSection and RoadmapSection

### RAG (Agent 4)
1. After seeding: server logs show `[Agent4] Gap "X": found N case studies`
2. Each solution in report has `reference_case_study` populated

### Mermaid Diagrams (Agent 6)
1. `reports` table → `diagrams` field → entries with `"is_validated": true`
2. DiagramSection renders diagrams on the report page
3. For invalid diagrams: `diagram_narrative` text shown as fallback
