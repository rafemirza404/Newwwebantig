/**
 * API Types
 * Request and response types for API calls
 */

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export interface EligibilityCheckRequest {
  email: string;
  phone: string;
  timestamp: string;
}

export interface EligibilityCheckResponse {
  allowed: boolean;
  message?: string;
}

export interface UserProfileRequest {
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
}

export interface UserLookupRequest {
  email: string;
}

export interface UserLookupResponse {
  found: boolean;
  data?: {
    name: string;
    email: string;
    phone: string;
    company: string;
    role: string;
  };
  website_form_filled?: boolean;
}

export interface ChatbotRequest {
  message: string;
  sessionId: string;
  timestamp: string;
}

export interface ChatbotResponse {
  response?: string;
  output?: string;
  message?: string;
}

export interface ContactFormRequest {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message: string;
  source: string;
}
