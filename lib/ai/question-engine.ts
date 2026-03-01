import OpenAI from "openai";
import { z } from "zod";

const SYSTEM_PROMPT = `You are an expert AI business consultant conducting a structured audit for a Solar or HVAC company.

Your job: generate the NEXT most relevant question to ask based on the conversation so far.

RULES:
1. Ask ONE focused, concise question (max 12 words)
2. Always provide exactly 3–4 answer options — short labels only (3–6 words each)
3. Drill deeper when you detect a gap or inefficiency in a previous answer
4. Cover these areas over the full audit: lead management, follow-up process, scheduling, team tools, automation maturity, customer communication, reporting
5. Signal completion (isComplete: true) after 12–18 questions when sufficient data is gathered
6. Only ask about things that can be solved with AI automation
7. Use the business name in questions to feel personalised
8. NEVER ask open-ended text questions — always multiple choice

OUTPUT: Strict JSON only, no markdown fences, no explanation:
{
  "question": "Question text here?",
  "category": "sales|operations|technology|marketing|customer_service|finance",
  "options": [
    { "label": "Short label", "value": "snake_case_key" },
    { "label": "Short label", "value": "snake_case_key" }
  ],
  "isComplete": false
}`;

export interface DynamicQuestion {
  question: string;
  category: string;
  options: Array<{ label: string; value: string }>;
  isComplete: boolean;
}

export interface PreviousAnswer {
  question: string;
  answer: string;
  category: string;
}

const FALLBACK_QUESTIONS: DynamicQuestion[] = [
  {
    question: "How do you track your leads today?",
    category: "technology",
    options: [
      { label: "CRM software", value: "crm" },
      { label: "Spreadsheets", value: "spreadsheets" },
      { label: "Paper or memory", value: "manual" },
      { label: "No tracking yet", value: "none" },
    ],
    isComplete: false,
  },
  {
    question: "How long does a typical job proposal take?",
    category: "operations",
    options: [
      { label: "Under 30 minutes", value: "under_30min" },
      { label: "30–60 minutes", value: "30_60min" },
      { label: "Half a day", value: "half_day" },
      { label: "More than a day", value: "over_day" },
    ],
    isComplete: false,
  },
];

export async function getNextQuestion(params: {
  businessName: string;
  industry: string | null;
  previousAnswers: PreviousAnswer[];
  questionCount: number;
}): Promise<DynamicQuestion> {
  const apiKey = process.env.OPENAI_API_KEY;

  // Hard completion after 18 questions
  if (params.questionCount >= 18) {
    return { question: "", category: "complete", options: [], isComplete: true };
  }

  // Fallback when no API key
  if (!apiKey) {
    const fallback = FALLBACK_QUESTIONS[params.questionCount % FALLBACK_QUESTIONS.length];
    if (params.questionCount >= 8) {
      return { question: "", category: "complete", options: [], isComplete: true };
    }
    return fallback;
  }

  const client = new OpenAI({ apiKey });

  const conversationText = params.previousAnswers.length === 0
    ? "(No questions asked yet — generate the first question)"
    : params.previousAnswers
      .map((a, i) => `Q${i + 1} [${a.category}]: ${a.question}\nA: ${a.answer}`)
      .join("\n\n");

  const userMessage = `Business: ${params.businessName}
Industry: ${params.industry ?? "Solar/HVAC"}
Questions asked: ${params.questionCount}

Conversation so far:
${conversationText}

Generate the next question for this audit.`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 512,
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: userMessage }],
    });

    const text = response.choices[0]?.message?.content?.trim() ?? "";
    // Strip any accidental markdown fences
    const clean = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    const parsed = z.object({
      question: z.string(),
      category: z.string(),
      options: z.array(z.object({ label: z.string(), value: z.string() })),
      isComplete: z.boolean(),
    }).safeParse(JSON.parse(clean));

    if (!parsed.success) {
      console.error("[QuestionEngine] Invalid AI response shape:", parsed.error.flatten());
      const fallback = FALLBACK_QUESTIONS[params.questionCount % FALLBACK_QUESTIONS.length];
      return params.questionCount >= 12
        ? { question: "", category: "complete", options: [], isComplete: true }
        : fallback;
    }
    return parsed.data as DynamicQuestion;
  } catch (err) {
    console.error("[QuestionEngine] Error:", err);
    // Return a reasonable fallback
    const fallback = FALLBACK_QUESTIONS[params.questionCount % FALLBACK_QUESTIONS.length];
    return params.questionCount >= 12
      ? { question: "", category: "complete", options: [], isComplete: true }
      : fallback;
  }
}
