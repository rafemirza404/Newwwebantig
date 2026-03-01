/**
 * Application Constants
 * Centralized configuration values used throughout the app
 */

export const CALL_CONSTANTS = {
  RATE_LIMIT_MINUTES: 60,
  FEEDBACK_AUTO_CLOSE_SECONDS: 10,
  CALL_TIMER_INTERVAL_MS: 1000,
  CONNECTION_TIMEOUT_MS: 30000,
} as const;

export const MODAL_STATES = {
  NONE: 'none',
  EMAIL_LOOKUP: 'email_lookup',
  LEAD_FORM: 'lead_form',
  CONFIRMATION: 'confirmation',
  INTRO: 'intro',
  FEEDBACK: 'feedback',
} as const;

export const COUNTRY_CODES = [
  { code: '+1', name: 'USA' },
  { code: '+44', name: 'UK' },
  { code: '+91', name: 'India' },
  { code: '+971', name: 'UAE' },
  { code: '+966', name: 'Saudi Arabia' },
  { code: '+61', name: 'Australia' },
  { code: '+49', name: 'Germany' },
  { code: '+33', name: 'France' },
] as const;

export const ROLES = [
  'Founder/CEO',
  'Operations Manager',
  'Operations Director',
  'Marketing Director',
  'Business Owner',
  'IT Manager',
  'Other',
] as const;

export const STORAGE_KEYS = {
  USER_DATA: 'agentblue_user',
  LAST_CALL: 'agentblue_last_call',
  CHAT_SESSION_ID: 'chatSessionId',
  CHAT_SESSION_CREATED: 'chatSessionCreated',
} as const;

export const CHATBOT_CONFIG = {
  MESSAGE_TIMEOUT_MS: 30000,
  SCROLL_DEBOUNCE_MS: 100,
  TYPING_INDICATOR_DELAY_MS: 200,
} as const;

export const DASHBOARD_ROUTES = {
  DASHBOARD: '/dashboard',
  LOGIN: '/login',
  SIGNUP: '/signup',
} as const;

export const AUDIT_STATUS = {
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const;
