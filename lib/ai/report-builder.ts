import OpenAI from "openai";
import { z } from "zod";
import type { Gap } from "./analysis-engine";
import type { Solution } from "./solution-mapper";

const SYSTEM_PROMPT = `You are a senior business report writer creating an AI audit report for a Solar/HVAC company.

Generate three things:

1. EXECUTIVE SUMMARY — 2–3 paragraphs, CEO-readable, plain English. Reference their specific situation, score, and top 2–3 findings. Be direct about what it means for their business revenue.

2. MERMAID DIAGRAMS — Show the #1 identified gap:
   - BEFORE: Current broken/manual process
   - AFTER: AI-automated version of the same process

   MERMAID RULES (strict):
   - Direction: flowchart LR
   - Max 7 nodes per diagram
   - Node labels: max 4 words, no special chars except spaces and hyphens
   - Use: (text) for actions, [text] for systems/data, {text} for decisions
   - Connections: --> with short labels when needed e.g. --> |yes|
   - NO semicolons inside node labels
   - NO quotes inside node labels

3. IMPLEMENTATION PLAN — Phased, 3 phases, bullet points, specific to their gaps/solutions

OUTPUT: Strict JSON only, no markdown fences:
{
  "summary": "Paragraph 1...\\n\\nParagraph 2...\\n\\nParagraph 3...",
  "mermaidBefore": "flowchart LR\\n    A[New Lead] --> B(Manual Call)\\n    B --> C{Answered}\\n    C --> |yes| D(Manual Note)\\n    C --> |no| E(Try Tomorrow)",
  "mermaidAfter": "flowchart LR\\n    A[New Lead] --> B[AI Voice Agent]\\n    B --> C(Instant Response)\\n    C --> D[CRM Updated]\\n    D --> E[Follow-up Sequence]",
  "implementationPlan": "Phase 1 — Quick Wins (Week 1–2):\\n• Item 1\\n• Item 2\\n\\nPhase 2 — Medium Term (Month 1–2):\\n• Item 1\\n\\nPhase 3 — Strategic (Month 3+):\\n• Item 1"
}

If you cannot produce valid Mermaid, set both diagram fields to null.`;

export interface ReportContent {
  summary: string;
  mermaidBefore: string | null;
  mermaidAfter: string | null;
  implementationPlan: string;
}

function validateMermaid(diagram: string | null): string | null {
  if (!diagram) return null;
  if (!diagram.includes("flowchart")) return null;
  // Basic sanity checks
  const lines = diagram.split("\\n").filter(Boolean);
  if (lines.length < 2) return null;
  return diagram;
}

function fallbackReport(params: {
  businessName: string;
  overallScore: number;
  gaps: Gap[];
  solutions: Solution[];
}): ReportContent {
  const { businessName, overallScore, gaps, solutions } = params;
  const topGap = gaps[0];
  const scoreLabel = overallScore >= 70 ? "strong" : overallScore >= 40 ? "developing" : "early-stage";

  const summary = `${businessName} received an AI maturity score of ${overallScore}/100, placing it in the ${scoreLabel} category for Solar/HVAC automation readiness. This audit identified ${gaps.length} specific automation gaps that are currently costing your team time and revenue every week.\n\nThe most critical finding is ${topGap?.name ?? "manual lead handling"} — ${topGap?.description ?? "a significant source of inefficiency that can be directly addressed with modern AI tools"}.\n\nAddressing your top Quick Wins alone could save your team ${solutions.filter((s) => s.priority === "quick_win").reduce((sum, s) => sum + s.timeSavedHrsMonthly, 0)} hours per month. The full implementation roadmap below shows a clear path from your current state to a fully automated, AI-first operation.`;

  const qw = solutions.filter((s) => s.priority === "quick_win");
  const med = solutions.filter((s) => s.priority === "medium");
  const str = solutions.filter((s) => s.priority === "strategic");

  const plan = [
    qw.length ? `Phase 1 — Quick Wins (Week 1–2):\n${qw.map((s) => `• ${s.solutionName} — ${s.roiEstimate}`).join("\n")}` : "",
    med.length ? `Phase 2 — Medium Term (Month 1–2):\n${med.map((s) => `• ${s.solutionName} — ${s.roiEstimate}`).join("\n")}` : "",
    str.length ? `Phase 3 — Strategic (Month 3+):\n${str.map((s) => `• ${s.solutionName} — ${s.roiEstimate}`).join("\n")}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  return { summary, mermaidBefore: null, mermaidAfter: null, implementationPlan: plan };
}

export async function buildReport(params: {
  businessName: string;
  industry: string | null;
  overallScore: number;
  functionScores: Record<string, number>;
  gaps: Gap[];
  solutions: Solution[];
}): Promise<ReportContent> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.warn("[ReportBuilder] No OPENAI_API_KEY — using fallback report");
    return fallbackReport(params);
  }

  const client = new OpenAI({ apiKey });

  const gapsSummary = params.gaps
    .slice(0, 6)
    .map((g) => `• ${g.name} (${g.severity}): ${g.description} Cost: ${g.timeCostEstimate}`)
    .join("\n");

  const solutionsSummary = params.solutions
    .slice(0, 6)
    .map((s) => `• [${s.priority}] ${s.solutionName}: ${s.roiEstimate}, saves ${s.timeSavedHrsMonthly}h/mo`)
    .join("\n");

  const userMessage = `Create an executive report for ${params.businessName} (${params.industry ?? "Solar/HVAC"}):

AI Maturity Score: ${params.overallScore}/100
Function Scores: ${JSON.stringify(params.functionScores)}

Identified Gaps:
${gapsSummary}

Mapped Solutions:
${solutionsSummary}`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 2500,
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: userMessage }],
    });

    const text = response.choices[0]?.message?.content?.trim() ?? "";
    const clean = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    const ReportSchema = z.object({
      summary: z.string(),
      mermaidBefore: z.string().nullable(),
      mermaidAfter: z.string().nullable(),
      implementationPlan: z.string(),
    });
    const parsed = ReportSchema.safeParse(JSON.parse(clean));
    if (!parsed.success) {
      console.error("[ReportBuilder] Invalid AI response shape:", parsed.error.flatten());
      return fallbackReport(params);
    }
    const result: ReportContent = parsed.data as ReportContent;

    // Validate mermaid
    result.mermaidBefore = validateMermaid(result.mermaidBefore);
    result.mermaidAfter = validateMermaid(result.mermaidAfter);

    return result;
  } catch (err) {
    console.error("[ReportBuilder] Error:", err);
    return fallbackReport(params);
  }
}
