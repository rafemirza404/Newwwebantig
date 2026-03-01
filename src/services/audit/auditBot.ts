/**
 * Audit Bot — deterministic question flow engine.
 * Swappable: replace getNextMessage with an n8n/Claude call later.
 */
import { AUDIT_QUESTIONS } from '@/config/auditQuestions';

export type AuditAnswers = Record<string, string>;

/**
 * Returns the next question index given the current answers array length.
 * When all questions are answered, returns null (audit complete).
 */
export function getNextQuestionIndex(answeredCount: number): number | null {
  if (answeredCount >= AUDIT_QUESTIONS.length) return null;
  return answeredCount;
}

/**
 * Returns the current question object for the given index.
 */
export function getQuestion(index: number) {
  return AUDIT_QUESTIONS[index] ?? null;
}

/**
 * Generates a contextual bot acknowledgment message after a user answer.
 * Deterministic — no AI required.
 */
export function getAcknowledgment(questionId: string, answerValue: string): string {
  const map: Record<string, Record<string, string>> = {
    business_type: {
      solar: "Solar is booming — and the speed of follow-up is everything in that space.",
      hvac: "HVAC companies that respond fast win the call. Let's see where you stand.",
      both: "Running both Solar & HVAC gives you twice the opportunity — and twice the follow-up complexity.",
    },
    lead_volume: {
      under_10: "At this stage, every lead matters. Even one missed call can cost thousands.",
      '10_50': "A solid lead flow. The question is whether your team can handle them all in time.",
      '50_200': "That's serious volume. Manual follow-up at this scale is almost impossible to do well.",
      '200_plus': "High-volume operations like yours lose the most to slow follow-up. Automation is essential.",
    },
    follow_up_speed: {
      within_1hr: "Great! Speed-to-contact is one of the biggest factors in close rates.",
      same_day: "Same-day is decent, but studies show response within 5 minutes boosts conversions 9x.",
      next_day: "Next-day response lets competitors swoop in first. This is a fixable problem.",
      inconsistent: "Inconsistency is the most common issue we see — and the easiest to solve with automation.",
    },
    biggest_challenge: {
      speed_to_contact: "Response speed is exactly what AI voice agents solve — 24/7, instant contact.",
      follow_up_consistency: "Automated follow-up sequences ensure no lead ever falls through the cracks.",
      no_shows: "AI reminders and confirmations typically cut no-shows by 30–50%.",
      lead_quality: "Understanding this helps us tailor the recommendations.",
    },
    follow_up_method: {
      manual_calls: "Manual calling is time-consuming and inconsistent. AI can handle this at scale.",
      email_only: "Email open rates in home services are often below 20%. Voice follow-up converts much better.",
      crm_manual: "You already have the foundation — AI automation can fill the gaps.",
      no_system: "Starting fresh is actually an advantage — we can set up the right system from day one.",
    },
    automation_tools: {
      has_automation: "Good foundation. We can layer AI on top of what you have.",
      spreadsheets: "Spreadsheets can't follow up at 11pm on a Saturday — automation can.",
      nothing: "No automation yet means the biggest gains are right in front of you.",
    },
    team_size: {
      just_me: "Solo operators who add AI effectively can handle 3–5x the lead volume.",
      '2_5': "A small team with AI automation punches well above its weight.",
      '5_10': "At this size, AI frees your team to focus on high-value conversations.",
      '10_plus': "Larger teams benefit most from consistent automation across the whole operation.",
    },
    desired_outcome: {
      more_appointments: "Booking more appointments is the #1 outcome our clients achieve.",
      more_conversions: "Converting existing leads better is often more profitable than buying more leads.",
      free_up_time: "AI handles the repetitive follow-up so your team focuses on closing.",
      all: "All of the above — that's what a full AgentBlue implementation delivers.",
    },
  };

  return map[questionId]?.[answerValue] ?? "Got it. Let's keep going.";
}

/**
 * Generates a completion message after all questions are answered.
 */
export function getCompletionMessage(): string {
  return "Perfect — I have everything I need to build your personalized AI automation report. Generating your results now...";
}
