import OpenAI from "openai";
import { z } from "zod";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? "" });

const SYSTEM_PROMPT = `You are a senior business analyst. Transform a raw Q&A audit transcript into a structured business profile.

## CRITICAL: YOU MUST USE EXACTLY THESE JSON FIELD NAMES

Return ONLY this JSON structure — no other keys, no nesting changes, no renaming:

{
  "business_profile": {
    "name": "<business name as string>",
    "industry": "<industry as string>",
    "company_size": "<e.g. solo, 2-10, 11-50 as string>",
    "business_model": "<e.g. B2B service, B2C product as string>",
    "revenue_stage": "<e.g. early-stage, growing, established as string>",
    "team_structure": "<1-2 sentence description of team as a single string>",
    "primary_services_or_products": "<what they sell or do as string>",
    "current_tool_stack": ["tool1", "tool2"],
    "key_business_context": "<2-3 paragraph holistic narrative as a single string>"
  },
  "detected_functions": ["sales", "customer_onboarding"],
  "undetected_functions": {
    "hr": "not mentioned in transcript",
    "marketing": "no evidence of this function"
  },
  "function_profiles": {
    "sales": {
      "exists": true,
      "profile": "<detailed string description of how this function operates>"
    },
    "customer_onboarding": {
      "exists": true,
      "profile": "<detailed string description>"
    }
  },
  "cross_function_observations": "<string: how the functions interact and depend on each other>",
  "zoomed_out_business_view": "<string: holistic 2-3 paragraph view of the entire business>"
}

## RULES
- detected_functions: array of function names confirmed present in transcript
- undetected_functions: object where keys are functions NOT in detected_functions, values explain why
- function_profiles: one entry per detected function only, each with "exists": true and "profile": "<string>"
- ALL string fields must be plain strings — never objects, never arrays (except current_tool_stack and detected_functions)
- The 8 possible functions: sales, customer_onboarding, operations, finance, customer_support, marketing, hr, data_reporting
- No markdown, no explanation — JSON only.`;

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

Build the complete business profile JSON using EXACTLY the field names shown in the system prompt.`;

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
  console.log("[Agent2] Raw response (first 300 chars):", text.slice(0, 300));

  let rawJson: unknown;
  try {
    rawJson = JSON.parse(text);
  } catch {
    console.error("[Agent2] JSON parse failed. Raw text:", text.slice(0, 1000));
    throw new Error("BusinessProfiler JSON parse failed");
  }

  const parsed = BusinessProfilerOutputSchema.safeParse(rawJson);

  if (!parsed.success) {
    console.error("[Agent2] Invalid output shape:", parsed.error.flatten());
    throw new Error("BusinessProfiler output validation failed");
  }

  console.log("[Pipeline] Agent 2 complete.");
  return parsed.data;
}
