/**
 * Webhook Service
 * Handles all N8N webhook communications
 */

import { apiClient } from './client';
import { ENV } from '@/config/env';
import { sanitizeInput } from '@/lib/validation';
import type {
  EligibilityCheckRequest,
  EligibilityCheckResponse,
  UserProfileRequest,
  UserLookupRequest,
  UserLookupResponse,
  ChatbotRequest,
  ChatbotResponse,
  ContactFormRequest,
  ApiResponse,
} from '@/types/api';
import type { CallRecord } from '@/types/models';

export const webhookService = {
  /**
   * Check if user is eligible to make a call (rate limiting)
   */
  async checkEligibility(
    data: EligibilityCheckRequest
  ): Promise<ApiResponse<EligibilityCheckResponse>> {
    return apiClient.post(ENV.webhooks.checkEligibility, {
      email: sanitizeInput(data.email),
      phone: sanitizeInput(data.phone),
      timestamp: data.timestamp,
    });
  },

  /**
   * Save user profile
   */
  async saveProfile(
    data: UserProfileRequest
  ): Promise<ApiResponse<any>> {
    return apiClient.post(ENV.webhooks.saveProfile, {
      name: sanitizeInput(data.name),
      email: sanitizeInput(data.email),
      phone: sanitizeInput(data.phone),
      company: sanitizeInput(data.company),
      role: sanitizeInput(data.role),
    });
  },

  /**
   * Lookup user by email
   */
  async lookupUser(
    data: UserLookupRequest
  ): Promise<ApiResponse<UserLookupResponse>> {
    return apiClient.post(ENV.webhooks.lookupUser, {
      email: sanitizeInput(data.email),
    });
  },

  /**
   * Save call record
   */
  async saveCallRecord(
    data: CallRecord
  ): Promise<ApiResponse<any>> {
    return apiClient.post(ENV.webhooks.saveCallRecord, data);
  },

  /**
   * Send chatbot message
   */
  async sendChatMessage(
    data: ChatbotRequest
  ): Promise<ApiResponse<ChatbotResponse>> {
    return apiClient.post(ENV.webhooks.chatbot, {
      message: sanitizeInput(data.message),
      sessionId: data.sessionId,
      timestamp: data.timestamp,
    });
  },

  /**
   * Submit contact form
   */
  async submitContactForm(
    data: ContactFormRequest
  ): Promise<ApiResponse<any>> {
    return apiClient.post(ENV.webhooks.contactForm, {
      name: sanitizeInput(data.name),
      email: sanitizeInput(data.email),
      company: data.company ? sanitizeInput(data.company) : undefined,
      phone: data.phone ? sanitizeInput(data.phone) : undefined,
      message: sanitizeInput(data.message),
      source: data.source,
    });
  },
};
