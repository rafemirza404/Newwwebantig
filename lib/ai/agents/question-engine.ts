import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? "" });

const SYSTEM_PROMPT = `You are Alex, a senior AI automation consultant conducting a discovery audit for a business. Your goal is to uncover where this business is losing time and money to manual processes that could be automated.

## YOUR MISSION
Ask targeted, intelligent questions that surface automation opportunities. Every question you ask must be capable of leading to an actionable automation recommendation. Do not pursue lines of questioning that cannot result in an automation suggestion.

## THE 8 BUSINESS FUNCTIONS YOU INVESTIGATE
1. sales (Sales & Lead Generation)
2. customer_onboarding (Customer Onboarding & Communication)
3. operations (Operations & Project Management)
4. finance (Finance & Administration)
5. customer_support (Customer Support & Retention)
6. marketing (Marketing & Content)
7. hr (HR & Team Management)
8. data_reporting (Data & Reporting)

## IMPORTANT RULES
- Do NOT assume all 8 functions exist in every business. Detect which are relevant from the conversation.
- Ask ONE focused, open-ended question at a time (not multiple choice).
- Use the business name to feel personalised.
- Questions should be conversational and easy to answer (not technical).
- Drill deeper when an answer reveals a specific manual process or inefficiency.
- Move to the next function once you have sufficient depth on the current one.
- One dedicated early question must explicitly ask about their current tool/software stack across all areas.
- Signal completion only when you have good coverage across all DETECTED relevant functions.
- Hard maximum: 20-25 questions total. Never go beyond.
- Short or vague answers → ask a targeted follow-up in the same category.
- Rich, detailed answers → move to the next category.

## COMPLETION CRITERIA
Mark is_complete: true when:
- You have "covered" or "partial" status for ALL detected relevant functions, OR
- Question count reaches 20+

## OUTPUT FORMAT
You MUST output in EXACTLY this format — nothing before the question, nothing after the JSON:

[Your question here, written conversationally, one sentence, no options]
<|META|>
{"question_category":"sales","is_complete":false,"closing_message":null,"coverage_status":{"sales":"partial","customer_onboarding":"uncovered","operations":"uncovered","finance":"uncovered","customer_support":"uncovered","marketing":"uncovered","hr":"uncovered","data_reporting":"uncovered"},"detected_tool_stack":[],"tool_stack_captured":false}

When is_complete is true, output a closing_message like:
"Perfect, I've gathered everything I need. Generating your automation report now..."
And set the question before <|META|> to an empty string.`;

export interface CoverageStatus {
  sales: "covered" | "partial" | "uncovered" | "not_applicable";
  customer_onboarding: "covered" | "partial" | "uncovered" | "not_applicable";
  operations: "covered" | "partial" | "uncovered" | "not_applicable";
  finance: "covered" | "partial" | "uncovered" | "not_applicable";
  customer_support: "covered" | "partial" | "uncovered" | "not_applicable";
  marketing: "covered" | "partial" | "uncovered" | "not_applicable";
  hr: "covered" | "partial" | "uncovered" | "not_applicable";
  data_reporting: "covered" | "partial" | "uncovered" | "not_applicable";
}

export interface AgentMeta {
  question_category: string;
  is_complete: boolean;
  closing_message: string | null;
  coverage_status: CoverageStatus;
  detected_tool_stack: string[];
  tool_stack_captured: boolean;
}

export interface QAEntry {
  question: string;
  answer: string;
  category: string;
}

function buildSlidingWindow(allAnswers: QAEntry[]): string {
  if (allAnswers.length === 0) return "(No questions asked yet — generate the first question)";

  const recentCount = 4;
  const recent = allAnswers.slice(-recentCount);
  const older = allAnswers.slice(0, -recentCount);

  let result = "";

  if (older.length > 0) {
    const summary = older
      .map((a) => `[${a.category}] Q: ${a.question} → A: ${a.answer}`)
      .join(" | ");
    result += `EARLIER Q&A SUMMARY:\n${summary}\n\n`;
  }

  result += "RECENT Q&A (last 4):\n";
  result += recent
    .map((a, i) => `Q${allAnswers.length - recent.length + i + 1} [${a.category}]: ${a.question}\nAnswer: ${a.answer}`)
    .join("\n\n");

  return result;
}

const DEFAULT_COVERAGE: CoverageStatus = {
  sales: "uncovered",
  customer_onboarding: "uncovered",
  operations: "uncovered",
  finance: "uncovered",
  customer_support: "uncovered",
  marketing: "uncovered",
  hr: "uncovered",
  data_reporting: "uncovered",
};

export function streamNextQuestion(params: {
  businessName: string;
  industry: string | null;
  companySize: string | null;
  allAnswers: QAEntry[];
  coverageStatus: CoverageStatus;
  detectedToolStack: string[];
  toolStackCaptured: boolean;
  questionCount: number;
}): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (obj: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      };

      if (params.questionCount >= 20) {
        send({
          type: "complete",
          questionText: "",
          meta: {
            question_category: "complete",
            is_complete: true,
            closing_message: "Perfect — I've gathered everything I need. Your automation audit report is being generated now. This usually takes about 30 seconds.",
            coverage_status: params.coverageStatus,
            detected_tool_stack: params.detectedToolStack,
            tool_stack_captured: params.toolStackCaptured,
          } satisfies AgentMeta,
        });
        controller.close();
        return;
      }

      if (!process.env.OPENAI_API_KEY) {
        const fallback = params.questionCount === 0
          ? `What tools and software does ${params.businessName} currently use across your business — things like CRM, project management, accounting, or any other apps your team relies on day to day?`
          : `Walk me through a typical day for your team — what tasks take up the most time and which ones feel most repetitive?`;
        send({ type: "token", text: fallback });
        send({
          type: "complete",
          questionText: fallback,
          meta: {
            question_category: "general",
            is_complete: params.questionCount >= 8,
            closing_message: params.questionCount >= 8 ? "Thanks — generating your report now!" : null,
            coverage_status: params.coverageStatus,
            detected_tool_stack: params.detectedToolStack,
            tool_stack_captured: params.toolStackCaptured,
          } satisfies AgentMeta,
        });
        controller.close();
        return;
      }

      const slidingWindow = buildSlidingWindow(params.allAnswers);

      const userMessage = `Business: ${params.businessName}
Industry: ${params.industry ?? "Not specified"}
Company size: ${params.companySize ?? "Not specified"}
Questions asked so far: ${params.questionCount}
Tool stack captured: ${params.toolStackCaptured}
Detected tools: ${params.detectedToolStack.length > 0 ? params.detectedToolStack.join(", ") : "None yet"}

Current coverage status:
${JSON.stringify(params.coverageStatus, null, 2)}

${slidingWindow}

Generate the next question.`;

      try {
        const stream = await client.chat.completions.create({
          model: "gpt-4o-mini",
          max_tokens: 600,
          stream: true,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userMessage },
          ],
        });

        let fullBuffer = "";
        let questionText = "";
        let questionStreamed = false;
        const META_SEP = "<|META|>";

        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content ?? "";
          if (!delta) continue;

          fullBuffer += delta;

          if (!questionStreamed) {
            const sepIdx = fullBuffer.indexOf(META_SEP);
            if (sepIdx === -1) {
              const newChars = fullBuffer.slice(questionText.length);
              if (newChars) {
                questionText += newChars;
                send({ type: "token", text: newChars });
              }
            } else {
              const remainingQuestion = fullBuffer.slice(questionText.length, sepIdx).trim();
              if (remainingQuestion) {
                questionText += remainingQuestion;
                send({ type: "token", text: remainingQuestion });
              }
              questionStreamed = true;
            }
          }
        }

        const sepIdx = fullBuffer.indexOf(META_SEP);
        if (sepIdx !== -1) {
          const metaStr = fullBuffer.slice(sepIdx + META_SEP.length).trim();
          try {
            const meta = JSON.parse(metaStr) as AgentMeta;
            send({ type: "complete", questionText: questionText.trim(), meta });
          } catch {
            send({
              type: "complete",
              questionText: questionText.trim(),
              meta: {
                question_category: "general",
                is_complete: false,
                closing_message: null,
                coverage_status: params.coverageStatus,
                detected_tool_stack: params.detectedToolStack,
                tool_stack_captured: params.toolStackCaptured,
              } satisfies AgentMeta,
            });
          }
        } else {
          const fullQuestion = fullBuffer.trim();
          if (!questionStreamed && fullQuestion !== questionText) {
            const remaining = fullQuestion.slice(questionText.length);
            if (remaining) send({ type: "token", text: remaining });
          }
          send({
            type: "complete",
            questionText: fullQuestion,
            meta: {
              question_category: "general",
              is_complete: false,
              closing_message: null,
              coverage_status: params.coverageStatus,
              detected_tool_stack: params.detectedToolStack,
              tool_stack_captured: params.toolStackCaptured,
            } satisfies AgentMeta,
          });
        }

        controller.close();
      } catch (err) {
        console.error("[QuestionEngine] Stream error:", err);
        send({ type: "error", message: "Failed to generate question" });
        controller.close();
      }
    },
  });
}
