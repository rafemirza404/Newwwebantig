import OpenAI from "openai";
import { z } from "zod";
import type { BusinessProfilerOutput } from "./business-profiler";
import type { GapAnalyzerOutput } from "./gap-analyzer";
import type { SolutionMapperOutput } from "./solution-mapper";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? "" });

const SYSTEM_PROMPT = `You are a senior business consultant and report writer. Assemble a polished automation audit report from structured analytical data.

Write in a confident, consultative voice. Be specific — use the business name, reference their actual tools, cite actual numbers.

## CRITICAL: USE EXACTLY THESE JSON FIELD NAMES

{
  "section_1_business_snapshot": {
    "headline": "<one-line headline>",
    "narrative": "<2-3 paragraph business snapshot>"
  },
  "section_2_maturity_score": {
    "overall_score": 42,
    "score_headline": "<one-line score summary>",
    "score_narrative": "<2-3 paragraph score explanation>"
  },
  "section_3_gaps": {
    "total_gaps_found": 6,
    "total_weekly_hours_lost": 20,
    "total_annual_cost": 48000,
    "gaps_overview_narrative": "<2 paragraph overview of gaps>",
    "gaps_free_preview": [
      { "name": "<gap name>", "one_line_problem": "<one sentence>" }
    ],
    "teaser_gap": {
      "name": "<gap name>",
      "severity": "high",
      "current_situation": "<string>",
      "why_this_matters": "<string>"
    },
    "gaps_full": [
      {
        "gap_id": "gap_001",
        "gap_name": "<name>",
        "business_function": "sales",
        "severity": "high",
        "current_situation": "<string>",
        "affected_team_members": "<string>",
        "time_cost_per_week_hours": 5,
        "estimated_annual_cost": 12000,
        "why_this_matters": "<string>",
        "priority_rank": 1
      }
    ]
  },
  "section_4_blueprints": {
    "blueprints_intro_narrative": "<2 paragraph intro to solutions>"
  },
  "section_5_roi": {
    "roi_headline": "<one-line ROI summary>",
    "roi_narrative": "<2 paragraph ROI explanation>"
  },
  "section_7_roadmap": {
    "roadmap_intro": "<1 paragraph intro>",
    "quick_wins": [
      { "solution_name": "<name>", "gap_name": "<gap name>", "estimated_setup_hours": 8 }
    ],
    "medium_term": [
      { "solution_name": "<name>", "gap_name": "<gap name>", "estimated_setup_hours": 20 }
    ],
    "strategic": [
      { "solution_name": "<name>", "gap_name": "<gap name>", "estimated_setup_hours": 40 }
    ],
    "roadmap_closing": "<1 paragraph closing>"
  }
}

No markdown fences, no explanation — JSON only.`;

const ReportContentSchema = z.object({
  section_1_business_snapshot: z.object({
    headline: z.string(),
    narrative: z.string(),
  }),
  section_2_maturity_score: z.object({
    overall_score: z.number(),
    score_headline: z.string(),
    score_narrative: z.string(),
  }),
  section_3_gaps: z.object({
    total_gaps_found: z.number(),
    total_weekly_hours_lost: z.number(),
    total_annual_cost: z.number(),
    gaps_overview_narrative: z.string(),
    gaps_free_preview: z.array(z.object({ name: z.string(), one_line_problem: z.string() })),
    teaser_gap: z.object({
      name: z.string(),
      severity: z.string(),
      current_situation: z.string(),
      why_this_matters: z.string(),
    }).nullable(),
    gaps_full: z.array(z.object({
      gap_id: z.string(),
      gap_name: z.string(),
      business_function: z.string(),
      severity: z.string(),
      current_situation: z.string(),
      affected_team_members: z.string(),
      time_cost_per_week_hours: z.number(),
      estimated_annual_cost: z.number(),
      why_this_matters: z.string(),
      priority_rank: z.number(),
    })),
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
    quick_wins: z.array(z.object({ solution_name: z.string(), gap_name: z.string(), estimated_setup_hours: z.number() })),
    medium_term: z.array(z.object({ solution_name: z.string(), gap_name: z.string(), estimated_setup_hours: z.number() })),
    strategic: z.array(z.object({ solution_name: z.string(), gap_name: z.string(), estimated_setup_hours: z.number() })),
    roadmap_closing: z.string(),
  }),
});

export type ReportAssemblerOutput = z.infer<typeof ReportContentSchema>;

export async function runReportAssembler(params: {
  profilerOutput: BusinessProfilerOutput;
  gapAnalyzerOutput: GapAnalyzerOutput;
  solutionMapperOutput: SolutionMapperOutput;
}): Promise<ReportAssemblerOutput> {
  console.log("[Pipeline] Agent 5 (ReportAssembler) starting...");

  const { profilerOutput: prof, gapAnalyzerOutput: gaps, solutionMapperOutput: solutions } = params;

  const userMessage = `Assemble a complete automation audit report for ${prof.business_profile.name}.

BUSINESS PROFILE:
${prof.business_profile.key_business_context}

Zoomed out view: ${prof.zoomed_out_business_view}

MATURITY SCORES:
Overall: ${gaps.overall_maturity_score}/100
${Object.entries(gaps.function_scores).map(([fn, s]) => `${fn}: ${s.score}/100 (${s.status} vs industry avg ${s.industry_average})`).join("\n")}

Score narrative from Agent 3: ${Object.values(gaps.function_scores).map(s => s.score_rationale).join(" ")}

GAPS (${gaps.gaps.length} total, ${gaps.total_estimated_weekly_hours_lost}h/week lost, $${gaps.total_estimated_annual_cost.toLocaleString()}/year):
${gaps.gaps.map(g => `- ${g.gap_name} (${g.severity}): ${g.current_situation.slice(0, 120)}...`).join("\n")}

Gap narrative: ${gaps.gap_analysis_narrative}

SOLUTIONS (${solutions.solutions.length} total):
${solutions.solutions.map(s => `- ${s.solution_name}: ${s.implementation_complexity} complexity, ${s.estimated_setup_hours}h setup, saves ${s.roi.hours_saved_per_week}h/week`).join("\n")}

ROI SUMMARY:
Total hours saved/week: ${solutions.total_roi_summary.total_hours_saved_per_week}
Total annual savings: $${solutions.total_roi_summary.total_cost_saved_per_year.toLocaleString()}
ROI narrative: ${solutions.total_roi_summary.overall_roi_narrative}

For section_3_gaps:
- gaps_free_preview: first 2 gaps (name + one_line_problem only)
- teaser_gap: 3rd gap as sample (full detail)
- gaps_full: ALL ${gaps.gaps.length} gaps with full detail

For section_7_roadmap:
- quick_wins: solutions with "simple" complexity
- medium_term: solutions with "medium" complexity
- strategic: solutions with "complex" complexity

Return the complete report_content JSON.`;

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 8000,
    response_format: { type: "json_object" },
    messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: userMessage }],
  });

  const text = response.choices[0]?.message?.content?.trim() ?? "";
  const clean = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  const parsed = ReportContentSchema.safeParse(JSON.parse(clean));

  if (!parsed.success) {
    console.error("[Agent5] Invalid output shape:", parsed.error.flatten());
    throw new Error("ReportAssembler output validation failed");
  }

  console.log("[Pipeline] Agent 5 complete.");
  return parsed.data;
}
