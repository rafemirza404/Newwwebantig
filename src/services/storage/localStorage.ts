/**
 * LocalStorage Service
 * Type-safe wrapper for localStorage operations
 */

import { STORAGE_KEYS } from '@/config/constants';
import type { LeadData } from '@/types/models';

export const storageService = {
  /**
   * Save user data
   */
  saveUserData(data: LeadData): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save user data:', error);
    }
  },

  /**
   * Get user data
   */
  getUserData(): LeadData | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get user data:', error);
      return null;
    }
  },

  /**
   * Clear user data
   */
  clearUserData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    } catch (error) {
      console.error('Failed to clear user data:', error);
    }
  },

  /**
   * Save last call timestamp
   */
  saveLastCallTime(timestamp: number): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_CALL, timestamp.toString());
    } catch (error) {
      console.error('Failed to save last call time:', error);
    }
  },

  /**
   * Get last call timestamp
   */
  getLastCallTime(): number | null {
    try {
      const time = localStorage.getItem(STORAGE_KEYS.LAST_CALL);
      return time ? parseInt(time, 10) : null;
    } catch (error) {
      console.error('Failed to get last call time:', error);
      return null;
    }
  },

  /**
   * Get or create chat session ID
   */
  getChatSessionId(): string {
    try {
      let sessionId = localStorage.getItem(STORAGE_KEYS.CHAT_SESSION_ID);

      if (!sessionId) {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 11);
        sessionId = `session_${timestamp}_${randomString}`;

        localStorage.setItem(STORAGE_KEYS.CHAT_SESSION_ID, sessionId);
        localStorage.setItem(STORAGE_KEYS.CHAT_SESSION_CREATED, timestamp.toString());
      }

      return sessionId;
    } catch (error) {
      console.error('Failed to get chat session ID:', error);
      return `session_${Date.now()}_fallback`;
    }
  },
};
