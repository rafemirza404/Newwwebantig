import OpenAI from "openai";
import { z } from "zod";
import type { Gap } from "./analysis-engine";

const SYSTEM_PROMPT = `You are an expert AI automation consultant specialising in Solar and HVAC businesses.

For each automation gap provided, design a specific, actionable AI solution using real tools and platforms.

TOOL EXAMPLES:
- AI voice agents: VAPI, Bland AI, Synthflow
- CRM + automation: GoHighLevel, HubSpot, Salesforce
- SMS/Email: Twilio, ActiveCampaign, Klaviyo
- Scheduling: Cal.com, Calendly, Jobber
- Workflow automation: n8n, Zapier, Make
- Proposal/document: PandaDoc, Proposify
- AI chatbots: custom GPT, Intercom, Drift

PRIORITY RULES:
- quick_win: setupTimeHrs ≤ 8, complexity = low, locked = false
- medium: setupTimeHrs 9–40, complexity = medium, locked = true
- strategic: setupTimeHrs > 40, complexity = high, locked = true

OUTPUT: Strict JSON array only, no markdown, no explanation:
[
  {
    "gapName": "Exact gap name from input",
    "solutionName": "Solution name (4–7 words)",
    "howItWorks": "Clear, specific explanation of what the automation does and how. Reference actual tools. (2–3 sentences)",
    "toolsRecommended": ["Tool A", "Tool B"],
    "complexity": "low|medium|high",
    "setupTimeHrs": 6,
    "timeSavedHrsMonthly": 24,
    "roiEstimate": "Save ~$720/month at $30/hr",
    "priority": "quick_win|medium|strategic",
    "locked": false
  }
]

Generate one solution per gap. Be specific to Solar/HVAC context.`;

export interface Solution {
  gapName: string;
  solutionName: string;
  howItWorks: string;
  toolsRecommended: string[];
  complexity: "low" | "medium" | "high";
  setupTimeHrs: number;
  timeSavedHrsMonthly: number;
  roiEstimate: string;
  priority: "quick_win" | "medium" | "strategic";
  locked: boolean;
}

function fallbackSolutions(gaps: Gap[]): Solution[] {
  return gaps.map((gap, i) => ({
    gapName: gap.name,
    solutionName: `AI Automation for ${gap.name}`,
    howItWorks: `Implement an automated workflow to address ${gap.name.toLowerCase()}. This will reduce manual effort and improve consistency across your Solar/HVAC operations.`,
    toolsRecommended: ["n8n", "GoHighLevel"],
    complexity: gap.severity === "high" ? "medium" : "low",
    setupTimeHrs: gap.severity === "high" ? 16 : 6,
    timeSavedHrsMonthly: gap.severity === "high" ? 20 : 8,
    roiEstimate: `Save ~${gap.severity === "high" ? "$600" : "$240"}/month`,
    priority: i === 0 ? "quick_win" : gap.severity === "high" ? "medium" : "strategic",
    locked: i !== 0,
  }));
}

export async function mapSolutions(params: {
  gaps: Gap[];
  businessName: string;
  industry: string | null;
}): Promise<Solution[]> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.warn("[SolutionMapper] No OPENAI_API_KEY — using fallback solutions");
    return fallbackSolutions(params.gaps);
  }

  const client = new OpenAI({ apiKey });

  const gapsText = params.gaps
    .map(
      (g, i) =>
        `${i + 1}. ${g.name} (${g.severity} severity, score ${g.severityScore}/10)\n` +
        `   Problem: ${g.description}\n` +
        `   Current: ${g.currentState}\n` +
        `   Cost: ${g.timeCostEstimate}\n` +
        `   Opportunity: ${g.automationPotential}`
    )
    .join("\n\n");

  const userMessage = `Design AI solutions for ${params.businessName} (${params.industry ?? "Solar/HVAC"}):

${gapsText}`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 3000,
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: userMessage }],
    });

    const text = response.choices[0]?.message?.content?.trim() ?? "";
    const clean = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    const SolutionSchema = z.array(z.object({
      gapName: z.string(),
      solutionName: z.string(),
      howItWorks: z.string(),
      toolsRecommended: z.array(z.string()),
      complexity: z.enum(["low", "medium", "high"]),
      setupTimeHrs: z.number(),
      timeSavedHrsMonthly: z.number(),
      roiEstimate: z.string(),
      priority: z.enum(["quick_win", "medium", "strategic"]),
      locked: z.boolean(),
    }));
    const parsed = SolutionSchema.safeParse(JSON.parse(clean));
    if (!parsed.success) {
      console.error("[SolutionMapper] Invalid AI response shape:", parsed.error.flatten());
      return fallbackSolutions(params.gaps);
    }
    return parsed.data as Solution[];
  } catch (err) {
    console.error("[SolutionMapper] Error:", err);
    return fallbackSolutions(params.gaps);
  }
}
