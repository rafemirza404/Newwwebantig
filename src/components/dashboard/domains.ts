import type { AuditAnswers } from '@/services/audit/auditBot';

export const DOMAIN_QUESTIONS: Record<string, string[]> = {
  strategy:    ['business_type', 'desired_outcome'],
  operations:  ['follow_up_speed', 'follow_up_method', 'automation_tools'],
  lead_gen:    ['lead_volume', 'biggest_challenge'],
  fulfillment: ['team_size'],
};

export const DOMAIN_META: Record<string, { label: string; emoji: string }> = {
  strategy:    { label: 'Strategy',    emoji: '📋' },
  operations:  { label: 'Operations',  emoji: '⚙️' },
  lead_gen:    { label: 'Lead Gen',    emoji: '📣' },
  fulfillment: { label: 'Fulfillment', emoji: '🚀' },
};

export type DomainStatus = 'not_started' | 'in_progress' | 'complete';

export function getDomainStatus(domain: string, answers: AuditAnswers): DomainStatus {
  const questions = DOMAIN_QUESTIONS[domain] ?? [];
  const answered = questions.filter(q => answers[q] !== undefined).length;
  if (answered === 0) return 'not_started';
  if (answered === questions.length) return 'complete';
  return 'in_progress';
}
