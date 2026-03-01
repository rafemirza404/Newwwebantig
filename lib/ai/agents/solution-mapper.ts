import OpenAI from "openai";
import { z } from "zod";
import { createSupabaseServerClient } from "~/lib/supabase/server";
import type { BusinessProfilerOutput } from "./business-profiler";
import type { GapAnalyzerOutput, Gap } from "./gap-analyzer";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? "" });

const SYSTEM_PROMPT = `You are a senior AI automation architect. For a single automation gap, design the most specific, actionable solution possible.

## TOOL PRIORITY RULES
Priority 1: Can this be solved with tools they already have?
Priority 2: Can this be solved by connecting two tools they already have?
Priority 3: Is there a new tool that integrates with their existing stack?
Priority 4: Does this require a fully new tool or stack?

Always prefer existing tools first. Be specific — reference actual tool names, not generic categories.

## OUTPUT
Respond with valid JSON only — no markdown, no explanation.`;

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

const SolutionMapperOutputSchema = z.object({
  solutions: z.array(SolutionSchema),
  total_roi_summary: z.object({
    total_hours_saved_per_week: z.number(),
    total_cost_saved_per_year: z.number(),
    total_setup_hours_required: z.number(),
    overall_roi_narrative: z.string(),
  }),
});

export type SolutionMapperOutput = z.infer<typeof SolutionMapperOutputSchema>;
export type Solution = z.infer<typeof SolutionSchema>;

async function fetchCaseStudies(gapText: string, _businessFunction: string, _workspaceId: string | null): Promise<Array<{ title: string; industry: string; problem: string; solution: string; result: string }>> {
  try {
    const supabase = createSupabaseServerClient();
    // Simple text-based fallback (no embeddings yet)
    const { data } = await supabase
      .from("case_studies")
      .select("title, industry, problem, solution, roi_result, business_function")
      .or(`workspace_id.is.null${_workspaceId ? `,workspace_id.eq.${_workspaceId}` : ""}`)
      .limit(3);

    if (!data || data.length === 0) return [];

    return data.map((cs) => ({
      title: cs.title ?? "",
      industry: cs.industry ?? "",
      problem: cs.problem ?? "",
      solution: cs.solution ?? "",
      result: cs.roi_result ?? "",
    }));
  } catch {
    return [];
  }
}

async function solveOneGap(params: {
  gap: Gap;
  toolStack: string[];
  functionProfile: string;
  keyBusinessContext: string;
  workspaceId: string | null;
}): Promise<Solution> {
  const caseStudies = await fetchCaseStudies(
    `${params.gap.gap_name} ${params.gap.current_situation}`,
    params.gap.business_function,
    params.workspaceId,
  );

  const caseStudyContext = caseStudies.length > 0
    ? `\nRELEVANT CASE STUDIES:\n${caseStudies.map((cs, i) => `${i + 1}. ${cs.title} (${cs.industry})\nProblem: ${cs.problem}\nSolution: ${cs.solution}\nResult: ${cs.result}`).join("\n\n")}`
    : "";

  const userMessage = `Design an automation solution for this gap:

GAP: ${params.gap.gap_name}
Function: ${params.gap.business_function}
Current situation: ${params.gap.current_situation}
Affected team: ${params.gap.affected_team_members}
Time cost: ${params.gap.time_cost_per_week_hours}h/week
Annual cost: $${params.gap.estimated_annual_cost}
Why it matters: ${params.gap.why_this_matters}

BUSINESS TOOL STACK: ${params.toolStack.join(", ") || "None specified"}

FUNCTION CONTEXT: ${params.functionProfile}

BUSINESS CONTEXT: ${params.keyBusinessContext.slice(0, 800)}
${caseStudyContext}

Return JSON with gap_id: "${params.gap.gap_id}" included.`;

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 2000,
    response_format: { type: "json_object" },
    messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: userMessage }],
  });

  const text = response.choices[0]?.message?.content?.trim() ?? "";
  const clean = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  const parsed = SolutionSchema.safeParse(JSON.parse(clean));

  if (!parsed.success) {
    throw new Error(`Solution for gap ${params.gap.gap_id} failed validation`);
  }

  return parsed.data;
}

export async function runSolutionMapper(params: {
  profilerOutput: BusinessProfilerOutput;
  gapAnalyzerOutput: GapAnalyzerOutput;
  workspaceId: string | null;
}): Promise<SolutionMapperOutput> {
  console.log("[Pipeline] Agent 4 (SolutionMapper) starting...");

  const gaps = params.gapAnalyzerOutput.gaps;
  const toolStack = params.profilerOutput.business_profile.current_tool_stack;
  const keyBusinessContext = params.profilerOutput.business_profile.key_business_context;

  const solutions: Solution[] = [];

  // Process gaps in batches of 3 (parallelized per-gap)
  const batchSize = 3;
  for (let i = 0; i < gaps.length; i += batchSize) {
    const batch = gaps.slice(i, i + batchSize);
    console.log(`[Pipeline] Agent 4 — processing gaps ${i + 1}-${Math.min(i + batchSize, gaps.length)} of ${gaps.length}`);

    const batchResults = await Promise.allSettled(
      batch.map((gap) => {
        const fnProfile = params.profilerOutput.function_profiles[gap.business_function];
        return solveOneGap({
          gap,
          toolStack,
          functionProfile: fnProfile?.profile ?? "",
          keyBusinessContext,
          workspaceId: params.workspaceId,
        });
      })
    );

    for (let j = 0; j < batchResults.length; j++) {
      const result = batchResults[j];
      if (result.status === "fulfilled") {
        solutions.push(result.value);
        console.log(`[Pipeline] Agent 4 — Gap ${batch[j].gap_name}: solution found`);
      } else {
        console.error(`[Pipeline] Agent 4 — Gap ${batch[j].gap_name} failed:`, result.reason);
        // Fallback solution for failed gaps
        solutions.push({
          gap_id: batch[j].gap_id,
          solution_name: `Automation for ${batch[j].gap_name}`,
          solution_description: `Automate the ${batch[j].gap_name.toLowerCase()} process to eliminate manual work.`,
          uses_existing_tools: true,
          primary_tools: toolStack.slice(0, 2),
          new_tools_required: [],
          why_these_tools: "Based on your existing tool stack",
          how_it_works: `Set up automated workflows to handle ${batch[j].gap_name.toLowerCase()} without manual intervention.`,
          implementation_complexity: "medium",
          estimated_setup_hours: 16,
          who_implements_this: "Agency builds this automation",
          roi: {
            hours_saved_per_week: batch[j].time_cost_per_week_hours * 0.7,
            cost_saved_per_year: batch[j].estimated_annual_cost * 0.6,
            breakeven_weeks: 8,
            additional_roi_notes: "Reduces manual errors and improves consistency",
          },
          reference_case_study: null,
        });
      }
    }
  }

  // Calculate total ROI
  const totalHoursSaved = solutions.reduce((s, sol) => s + sol.roi.hours_saved_per_week, 0);
  const totalCostSaved = solutions.reduce((s, sol) => s + sol.roi.cost_saved_per_year, 0);
  const totalSetupHours = solutions.reduce((s, sol) => s + sol.estimated_setup_hours, 0);

  const output: SolutionMapperOutput = {
    solutions,
    total_roi_summary: {
      total_hours_saved_per_week: Math.round(totalHoursSaved * 10) / 10,
      total_cost_saved_per_year: Math.round(totalCostSaved),
      total_setup_hours_required: Math.round(totalSetupHours),
      overall_roi_narrative: `Implementing all ${solutions.length} automation solutions for ${params.profilerOutput.business_profile.name} will save approximately ${Math.round(totalHoursSaved)} hours per week, translating to an estimated $${Math.round(totalCostSaved).toLocaleString()} in annual savings. Total implementation effort is approximately ${Math.round(totalSetupHours)} hours.`,
    },
  };

  console.log("[Pipeline] Agent 4 complete. Solutions:", solutions.length);
  return output;
}
