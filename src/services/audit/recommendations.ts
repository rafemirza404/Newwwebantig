/**
 * Deterministic scoring and recommendation logic.
 * Maps audit answers to personalized AgentBlue recommendations.
 */
import type { AuditAnswers } from './auditBot';

export type Recommendation = {
  id: string;
  title: string;
  solution: string;
  problem: string;
  outcome: string;
  priority: 'critical' | 'high' | 'medium';
  icon: string;
};

export type AuditResult = {
  profileBadge: string;
  profileDescription: string;
  score: number; // 0–100 automation readiness score
  recommendations: Recommendation[];
};

function scoreLeadUrgency(answers: AuditAnswers): number {
  let score = 0;
  if (answers.follow_up_speed === 'next_day' || answers.follow_up_speed === 'inconsistent') score += 30;
  if (answers.follow_up_speed === 'same_day') score += 15;
  if (answers.lead_volume === '50_200' || answers.lead_volume === '200_plus') score += 20;
  if (answers.follow_up_method === 'no_system' || answers.follow_up_method === 'manual_calls') score += 20;
  if (answers.automation_tools === 'nothing' || answers.automation_tools === 'spreadsheets') score += 10;
  return Math.min(score, 100);
}

function getProfileBadge(answers: AuditAnswers, urgencyScore: number): { badge: string; description: string } {
  const industry = answers.business_type === 'solar' ? 'Solar' : answers.business_type === 'hvac' ? 'HVAC' : 'Solar & HVAC';
  const volume = answers.lead_volume;
  const isHighVolume = volume === '50_200' || volume === '200_plus';
  const isGrowing = volume === '10_50' || volume === '50_200';

  if (urgencyScore >= 60) {
    return {
      badge: `High-Opportunity ${industry} Business`,
      description: `Your operation has significant untapped revenue potential. Leads are likely slipping through the cracks due to slow or inconsistent follow-up — exactly what AgentBlue's AI automation solves.`,
    };
  }
  if (isHighVolume) {
    return {
      badge: `Scaling ${industry} Operation`,
      description: `You're handling serious lead volume, but manual processes can't keep pace. Strategic automation will protect your pipeline and boost conversions.`,
    };
  }
  if (isGrowing) {
    return {
      badge: `Growth-Stage ${industry} Business`,
      description: `You're at a pivotal point. Adding AI automation now will let you scale without adding headcount.`,
    };
  }
  return {
    badge: `${industry} Business — Ready to Optimize`,
    description: `You have solid fundamentals. AI automation can help you do more with what you already have.`,
  };
}

function buildRecommendations(answers: AuditAnswers): Recommendation[] {
  const recs: Recommendation[] = [];

  // AI Voice Agent — prioritized when follow-up is slow/inconsistent
  const needsVoiceAgent =
    answers.follow_up_speed === 'inconsistent' ||
    answers.follow_up_speed === 'next_day' ||
    answers.follow_up_method === 'no_system' ||
    answers.biggest_challenge === 'speed_to_contact';

  recs.push({
    id: 'voice_agent',
    title: 'AI Voice Agent',
    icon: '🤖',
    priority: needsVoiceAgent ? 'critical' : 'high',
    problem: needsVoiceAgent
      ? `Your leads wait ${answers.follow_up_speed === 'next_day' ? 'until the next day' : 'inconsistently'} for a response. Every hour of delay drops your close rate by up to 40%.`
      : 'Even with decent follow-up speed, an AI voice agent ensures zero leads go unanswered — 24/7.',
    solution: 'An AI voice agent calls every new lead within 60 seconds — day or night — qualifies them, and books appointments automatically.',
    outcome: 'Clients typically see a 2–4x increase in contacted leads and 30%+ more appointments booked in the first 30 days.',
  });

  // Automated Follow-Up — prioritized when no system or manual only
  const needsFollowUp =
    answers.follow_up_method === 'no_system' ||
    answers.follow_up_method === 'manual_calls' ||
    answers.biggest_challenge === 'follow_up_consistency' ||
    answers.automation_tools === 'nothing';

  recs.push({
    id: 'automated_followup',
    title: 'Automated Lead Follow-Up',
    icon: '🔄',
    priority: needsFollowUp ? 'critical' : 'high',
    problem: needsFollowUp
      ? `Without a consistent follow-up system, ${answers.lead_volume === 'under_10' ? 'even a few' : 'many'} leads are going cold before your team reconnects.`
      : 'Even with some automation, gaps in follow-up sequences let competitors win deals.',
    solution: 'Multi-touch follow-up sequences via SMS, email, and voice — automatically triggered when a lead goes quiet.',
    outcome: 'On average, 35% of "dead" leads re-engage when hit with a timely automated sequence.',
  });

  // Appointment Booking AI — prioritized when no-shows or booking is a challenge
  const needsBooking =
    answers.biggest_challenge === 'no_shows' ||
    answers.desired_outcome === 'more_appointments' ||
    answers.desired_outcome === 'all';

  recs.push({
    id: 'booking_ai',
    title: 'AI Appointment Booking',
    icon: '📆',
    priority: needsBooking ? 'critical' : 'medium',
    problem: needsBooking
      ? answers.biggest_challenge === 'no_shows'
        ? 'Appointment no-shows are costing you real revenue — a confirmed slot with no one there wastes your team\'s time and money.'
        : 'Manually managing bookings creates friction and delays that lose leads to competitors.'
      : 'Every extra step between interest and appointment loses you potential customers.',
    solution: 'AI handles scheduling, confirmations, and reminders automatically — integrated directly into your calendar.',
    outcome: 'Teams using AI booking see 25–40% fewer no-shows and spend 80% less time on scheduling.',
  });

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2 };
  return recs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

export function generateAuditResult(answers: AuditAnswers): AuditResult {
  const urgencyScore = scoreLeadUrgency(answers);
  const automationScore = 100 - urgencyScore; // Higher = more optimized already
  const { badge, description } = getProfileBadge(answers, urgencyScore);

  return {
    profileBadge: badge,
    profileDescription: description,
    score: automationScore,
    recommendations: buildRecommendations(answers),
  };
}
