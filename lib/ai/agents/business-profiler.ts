import OpenAI from "openai";
import { z } from "zod";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? "" });

const SYSTEM_PROMPT = `You are a senior business analyst. Transform a raw Q&A audit transcript into a comprehensive, deeply structured business profile.

This is NOT a summary. This is a detailed picture of how the business actually operates — rich enough that someone who has never spoken to this business could fully understand their operations, team structure, daily workflows, where value is created, and where time is lost.

## DYNAMIC FUNCTION DETECTION
Do NOT assume all 8 functions exist. Detect which are actually present in this business from the transcript, then only profile those. Functions that don't exist must be explicitly marked as not_applicable with a reason.

The 8 functions: sales, customer_onboarding, operations, finance, customer_support, marketing, hr, data_reporting

## OUTPUT
Respond with valid JSON only — no markdown, no explanation.`;

const FunctionProfileSchema = z.object({
  exists: z.boolean(),
  profile: z.string(),
});

const BusinessProfilerOutputSchema = z.object({
  business_profile: z.object({
    name: z.string(),
    industry: z.string(),
    company_size: z.string(),
    business_model: z.string(),
    revenue_stage: z.string(),
    team_structure: z.string(),
    primary_services_or_products: z.string(),
    current_tool_stack: z.array(z.string()),
    key_business_context: z.string(),
  }),
  detected_functions: z.array(z.string()),
  undetected_functions: z.record(z.string()),
  function_profiles: z.record(FunctionProfileSchema),
  cross_function_observations: z.string(),
  zoomed_out_business_view: z.string(),
});

export type BusinessProfilerOutput = z.infer<typeof BusinessProfilerOutputSchema>;

export async function runBusinessProfiler(params: {
  businessName: string;
  industry: string | null;
  companySize: string | null;
  qaTranscript: Array<{ question: string; answer: string; category: string }>;
  detectedToolStack: string[];
}): Promise<BusinessProfilerOutput> {
  console.log("[Pipeline] Agent 2 (BusinessProfiler) starting...");

  const transcript = params.qaTranscript
    .map((a, i) => `Q${i + 1} [${a.category}]: ${a.question}\nA: ${a.answer}`)
    .join("\n\n");

  const userMessage = `Business name: ${params.businessName}
Industry: ${params.industry ?? "Not specified"}
Company size: ${params.companySize ?? "Not specified"}
Tools mentioned during audit: ${params.detectedToolStack.length > 0 ? params.detectedToolStack.join(", ") : "None captured"}

FULL AUDIT TRANSCRIPT:
${transcript}

Build the complete business profile JSON.`;

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
  const parsed = BusinessProfilerOutputSchema.safeParse(JSON.parse(text));

  if (!parsed.success) {
    console.error("[Agent2] Invalid output shape:", parsed.error.flatten());
    throw new Error("BusinessProfiler output validation failed");
  }

  console.log("[Pipeline] Agent 2 complete.");
  return parsed.data;
}
