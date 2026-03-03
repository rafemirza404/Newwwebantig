import OpenAI from "openai";
import { z } from "zod";
import type { BusinessProfilerOutput } from "./business-profiler";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? "" });

const SYSTEM_PROMPT = `You are a senior automation gap analyst. Identify automation gaps across all detected business functions.

An automation gap is any process done manually when it could be automated, repeated on a schedule when it could be event-driven, or consuming significant time for low-value repetitive work.

Maturity scoring baselines: Small (1-10): 35/100, Mid (11-50): 50/100, Enterprise (50+): 65/100
Score status: "below" (>10 points below baseline), "on_par" (within 10), "above" (>10 above)

## CRITICAL: USE EXACTLY THESE JSON FIELD NAMES

{
  "overall_maturity_score": 42,
  "function_scores": {
    "sales": {
      "score": 40,
      "industry_average": 50,
      "status": "below",
      "score_rationale": "<string explaining the score>"
    }
  },
  "gaps": [
    {
      "gap_id": "gap_001",
      "gap_name": "<short name of the gap>",
      "business_function": "sales",
      "current_situation": "<string: what they do manually now>",
      "affected_team_members": "<string: who is affected>",
      "time_cost_per_week_hours": 5,
      "estimated_annual_cost": 12000,
      "severity": "high",
      "automation_potential": "high",
      "why_this_matters": "<string: business impact>",
      "priority_rank": 1
    }
  ],
  "total_estimated_weekly_hours_lost": 20,
  "total_estimated_annual_cost": 48000,
  "gap_analysis_narrative": "<string: 2-3 paragraph summary of overall findings>"
}

## RULES
- Generate 4-8 gaps
- severity and automation_potential must be exactly "high", "medium", or "low"
- status must be exactly "below", "on_par", or "above"
- function_scores: one entry per detected function only
- All numeric fields must be numbers (not strings)
- No markdown, no explanation — JSON only.`;

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

const GapAnalyzerOutputSchema = z.object({
  overall_maturity_score: z.number(),
  function_scores: z.record(FunctionScoreSchema),
  gaps: z.array(GapSchema),
  total_estimated_weekly_hours_lost: z.number(),
  total_estimated_annual_cost: z.number(),
  gap_analysis_narrative: z.string(),
});

export type GapAnalyzerOutput = z.infer<typeof GapAnalyzerOutputSchema>;
export type Gap = z.infer<typeof GapSchema>;

export async function runGapAnalyzer(profilerOutput: BusinessProfilerOutput): Promise<GapAnalyzerOutput> {
  console.log("[Pipeline] Agent 3 (GapAnalyzer) starting...");

  const context = {
    key_business_context: profilerOutput.business_profile.key_business_context,
    current_tool_stack: profilerOutput.business_profile.current_tool_stack,
    company_size: profilerOutput.business_profile.company_size,
    function_profiles: Object.fromEntries(
      profilerOutput.detected_functions.map((fn) => [fn, profilerOutput.function_profiles[fn]])
    ),
    detected_functions: profilerOutput.detected_functions,
    cross_function_observations: profilerOutput.cross_function_observations,
  };

  const userMessage = `Analyse this business for automation gaps:

Business context: ${context.key_business_context}
Tool stack: ${context.current_tool_stack.join(", ")}
Company size: ${context.company_size}
Detected functions: ${context.detected_functions.join(", ")}

Function profiles:
${Object.entries(context.function_profiles).map(([fn, p]) => `## ${fn}\n${p?.profile ?? "No profile"}`).join("\n\n")}

Cross-function observations: ${context.cross_function_observations}

Generate the complete gap analysis JSON using EXACTLY the field names shown in the system prompt.`;

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 6000,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
    response_format: { type: "json_object" },
  });

  const text = response.choices[0]?.message?.content?.trim() ?? "";
  const parsed = GapAnalyzerOutputSchema.safeParse(JSON.parse(text));

  if (!parsed.success) {
    console.error("[Agent3] Invalid output shape:", parsed.error.flatten());
    console.error("[Agent3] Raw response (first 500):", text.slice(0, 500));
    throw new Error("GapAnalyzer output validation failed");
  }

  console.log("[Pipeline] Agent 3 complete. Gaps found:", parsed.data.gaps.length);
  return parsed.data;
}
