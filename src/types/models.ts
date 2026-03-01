/**
 * Core Data Models
 * Type definitions for business entities
 */

export interface LeadData {
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  consent: boolean;
  timestamp?: number;
  website_form_filled?: boolean;
}

export interface CallData {
  started_at: string;
  ended_at: string;
  duration: string;
  vapi_call_id: string | null;
}

export interface FeedbackData {
  rating: number | null;
  comment: string;
  next_action: string | null;
}

export interface CallRecord {
  lead_data: Omit<LeadData, 'consent' | 'timestamp' | 'website_form_filled'>;
  call_data: CallData;
  feedback: FeedbackData;
}

export interface ChatMessage {
  text: string;
  isBot: boolean;
  timestamp?: number;
}

export type CallState = 'idle' | 'connecting' | 'connected' | 'ending' | 'ended';
export type CallStatus = 'speaking' | 'listening';
export type ModalState = 'none' | 'email_lookup' | 'lead_form' | 'confirmation' | 'intro' | 'feedback';
