import OpenAI from "openai";
import { z } from "zod";

const SYSTEM_PROMPT = `You are an expert AI business analyst specialising in Solar and HVAC company automation.

Analyse the provided audit Q&A transcript and identify automation gaps and AI maturity scores.

SCORING GUIDE (0–100):
- 0–30:  Critical — no automation, fully manual, major revenue leakage
- 31–50: Early stage — basic tools only, large automation opportunity
- 51–70: Developing — some automation, clear improvement areas
- 71–85: Good — solid processes, targeted optimisation needed
- 86–100: Advanced — industry-leading automation

SEVERITY:
- high: Costs >5 hrs/week or >$2k/month or directly kills revenue
- medium: Costs 2–5 hrs/week or $500–2k/month
- low: Costs <2 hrs/week or <$500/month

OUTPUT: Strict JSON only, no markdown, no explanation:
{
  "overallScore": 45,
  "functionScores": {
    "sales": 40,
    "operations": 55,
    "technology": 30,
    "marketing": 50,
    "customer_service": 65
  },
  "gaps": [
    {
      "name": "Gap name (3–6 words, title case)",
      "category": "sales|operations|technology|marketing|customer_service|finance",
      "severity": "high|medium|low",
      "severityScore": 8,
      "description": "What the problem is and why it matters (2–3 sentences, Solar/HVAC context).",
      "currentState": "What they're doing today (1 sentence).",
      "timeCostEstimate": "e.g. ~6 hrs/week of manual effort",
      "automationPotential": "Specific AI fix available (1–2 sentences)."
    }
  ]
}

Identify 4–7 gaps. Be specific and Solar/HVAC-relevant. Rank by severityScore descending.`;

export interface Gap {
  name: string;
  category: string;
  severity: "high" | "medium" | "low";
  severityScore: number;
  description: string;
  currentState: string;
  timeCostEstimate: string;
  automationPotential: string;
}

export interface AnalysisResult {
  overallScore: number;
  functionScores: Record<string, number>;
  gaps: Gap[];
}

function fallbackAnalysis(answers: Array<{ answer: string; category: string }>): AnalysisResult {
  // Simple rule-based scoring as fallback
  let score = 50;
  const byCategory: Record<string, string[]> = {};
  for (const a of answers) {
    if (!byCategory[a.category]) byCategory[a.category] = [];
    byCategory[a.category].push(a.answer);
  }
  if (Object.values(byCategory).flat().includes("nothing") || Object.values(byCategory).flat().includes("no_system")) score -= 15;
  if (Object.values(byCategory).flat().includes("has_automation")) score += 15;
  score = Math.min(90, Math.max(20, score));

  return {
    overallScore: score,
    functionScores: { sales: score - 5, operations: score, technology: score - 10, marketing: score + 5, customer_service: score + 5 },
    gaps: [
      {
        name: "Manual Lead Follow-Up",
        category: "sales",
        severity: "high",
        severityScore: 8,
        description: "Your leads are being followed up manually, creating delays and inconsistency that cost you revenue every day.",
        currentState: "Team manually calls or emails each lead without a standardised sequence.",
        timeCostEstimate: "~5–8 hrs/week",
        automationPotential: "AI voice agent or automated SMS/email sequence can respond to every lead within 60 seconds, 24/7.",
      },
    ],
  };
}

export async function analyzeAudit(params: {
  businessName: string;
  industry: string | null;
  answers: Array<{ question: string; answer: string; category: string }>;
}): Promise<AnalysisResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.warn("[AnalysisEngine] No OPENAI_API_KEY — using fallback analysis");
    return fallbackAnalysis(params.answers);
  }

  const client = new OpenAI({ apiKey });

  const transcript = params.answers
    .map((a, i) => `Q${i + 1} [${a.category}]: ${a.question}\nA: ${a.answer}`)
    .join("\n\n");

  const userMessage = `Analyse this audit for ${params.businessName} (${params.industry ?? "Solar/HVAC"}):

${transcript}`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 2048,
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: userMessage }],
    });

    const text = response.choices[0]?.message?.content?.trim() ?? "";
    const clean = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    const AnalysisSchema = z.object({
      overallScore: z.number(),
      functionScores: z.record(z.number()),
      gaps: z.array(z.object({
        name: z.string(),
        category: z.string(),
        severity: z.enum(["high", "medium", "low"]),
        severityScore: z.number(),
        description: z.string(),
        currentState: z.string(),
        timeCostEstimate: z.string(),
        automationPotential: z.string(),
      })),
    });
    const parsed = AnalysisSchema.safeParse(JSON.parse(clean));
    if (!parsed.success) {
      console.error("[AnalysisEngine] Invalid AI response shape:", parsed.error.flatten());
      return fallbackAnalysis(params.answers);
    }
    return parsed.data as AnalysisResult;
  } catch (err) {
    console.error("[AnalysisEngine] Error:", err);
    return fallbackAnalysis(params.answers);
  }
}
