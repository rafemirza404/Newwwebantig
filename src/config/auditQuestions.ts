export type QuestionOption = {
  label: string;
  value: string;
};

export type AuditQuestion = {
  id: string;
  text: string;
  options: QuestionOption[];
};

export const AUDIT_QUESTIONS: AuditQuestion[] = [
  {
    id: 'business_type',
    text: "Welcome — let's run your free AI business audit. What's your primary business?",
    options: [
      { label: 'Solar', value: 'solar' },
      { label: 'HVAC', value: 'hvac' },
      { label: 'Both Solar & HVAC', value: 'both' },
    ],
  },
  {
    id: 'lead_volume',
    text: 'How many inbound leads do you receive per month?',
    options: [
      { label: 'Under 10', value: 'under_10' },
      { label: '10 – 50', value: '10_50' },
      { label: '50 – 200', value: '50_200' },
      { label: '200+', value: '200_plus' },
    ],
  },
  {
    id: 'follow_up_speed',
    text: 'How quickly does your team follow up with new leads?',
    options: [
      { label: 'Within 1 hour', value: 'within_1hr' },
      { label: 'Same day', value: 'same_day' },
      { label: 'Next day', value: 'next_day' },
      { label: 'Inconsistent', value: 'inconsistent' },
    ],
  },
  {
    id: 'biggest_challenge',
    text: "What's your biggest sales challenge right now?",
    options: [
      { label: 'Speed to contact', value: 'speed_to_contact' },
      { label: 'Follow-up consistency', value: 'follow_up_consistency' },
      { label: 'Appointment no-shows', value: 'no_shows' },
      { label: 'Lead quality', value: 'lead_quality' },
    ],
  },
  {
    id: 'follow_up_method',
    text: 'How does your team currently handle follow-up?',
    options: [
      { label: 'Manual calls', value: 'manual_calls' },
      { label: 'Email only', value: 'email_only' },
      { label: 'Mix of CRM and manual', value: 'crm_manual' },
      { label: 'No system yet', value: 'no_system' },
    ],
  },
  {
    id: 'automation_tools',
    text: 'Do you use any automation tools today?',
    options: [
      { label: 'Yes — CRM or automation software', value: 'has_automation' },
      { label: 'Spreadsheets only', value: 'spreadsheets' },
      { label: 'Nothing yet', value: 'nothing' },
    ],
  },
  {
    id: 'team_size',
    text: 'How many people handle your sales and follow-up?',
    options: [
      { label: 'Just me', value: 'just_me' },
      { label: '2 – 5', value: '2_5' },
      { label: '5 – 10', value: '5_10' },
      { label: '10+', value: '10_plus' },
    ],
  },
  {
    id: 'desired_outcome',
    text: 'Last one — what outcome matters most to you?',
    options: [
      { label: 'Book more appointments', value: 'more_appointments' },
      { label: 'Convert more leads', value: 'more_conversions' },
      { label: 'Free up team time', value: 'free_up_time' },
      { label: 'All of the above', value: 'all' },
    ],
  },
];
