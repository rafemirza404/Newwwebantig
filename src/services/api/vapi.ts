/**
 * VAPI Service
 * Abstraction layer for VAPI SDK
 */

import Vapi from '@vapi-ai/web';
import { ENV } from '@/config/env';
import type { VapiVariables, VapiAssistantOverrides, VapiEventHandlers } from '@/types/vapi';

export class VapiService {
  private client: Vapi;
  private assistantId: string;

  constructor() {
    if (!ENV.vapi.apiKey) {
      console.error('VAPI API key is missing');
    }

    this.client = new Vapi(ENV.vapi.apiKey);
    this.assistantId = ENV.vapi.assistantId;
  }

  /**
   * Start a call with the given variables
   * FIX: Check for null return value from VAPI SDK
   */
  async startCall(variables: VapiVariables): Promise<void> {
    // Validate that phone number is always present
    if (!variables.phone || variables.phone.trim() === '') {
      const error = new Error('Phone number is required but missing in VAPI metadata');
      console.error('[VAPI] CRITICAL:', error);
      throw error;
    }

    // Verify all required fields are present
    if (!variables.name || !variables.email || !variables.company || !variables.role) {
      console.warn('[VAPI] Warning: Some metadata fields are missing:', {
        name: !!variables.name,
        email: !!variables.email,
        phone: !!variables.phone,
        company: !!variables.company,
        role: !!variables.role,
      });
    }

    const assistantOverrides: VapiAssistantOverrides = {
      variableValues: variables,
    };

    console.log('[VAPI] Starting call with validated variables:', variables);

    try {
      // CRITICAL FIX: Check if start() returns null (indicates failure)
      const result = await this.client.start(this.assistantId, assistantOverrides);

      if (result === null) {
        // Call failed to start - VAPI SDK will emit 'call-start-failed' event
        const error = new Error('Call initialization failed. Check call-start-failed event for details.');
        console.error('[VAPI] Call start returned null:', error);
        throw error;
      }

      console.log('[VAPI] Call start initiated successfully');
    } catch (error) {
      console.error('[VAPI] Failed to start call:', error);
      throw error;
    }
  }

  /**
   * Stop the current call
   */
  stop(): void {
    console.log('[VAPI] Stopping call');
    this.client.stop();
  }

  /**
   * Set mute status
   */
  setMuted(muted: boolean): void {
    this.client.setMuted(muted);
  }

  /**
   * Register event listeners
   * FIX: Added call-start-failed listener for detailed error tracking
   */
  setupEventListeners(handlers: VapiEventHandlers): () => void {
    if (handlers.onCallStart) {
      this.client.on('call-start', handlers.onCallStart);
    }
    if (handlers.onCallEnd) {
      this.client.on('call-end', handlers.onCallEnd);
    }
    if (handlers.onSpeechStart) {
      this.client.on('speech-start', handlers.onSpeechStart);
    }
    if (handlers.onSpeechEnd) {
      this.client.on('speech-end', handlers.onSpeechEnd);
    }
    if (handlers.onMessage) {
      this.client.on('message', handlers.onMessage);
    }
    if (handlers.onError) {
      this.client.on('error', handlers.onError);
    }
    if (handlers.onCallStartFailed) {
      this.client.on('call-start-failed', handlers.onCallStartFailed);
    }

    // Return cleanup function
    return () => {
      if (handlers.onCallStart) {
        this.client.removeListener('call-start', handlers.onCallStart);
      }
      if (handlers.onCallEnd) {
        this.client.removeListener('call-end', handlers.onCallEnd);
      }
      if (handlers.onSpeechStart) {
        this.client.removeListener('speech-start', handlers.onSpeechStart);
      }
      if (handlers.onSpeechEnd) {
        this.client.removeListener('speech-end', handlers.onSpeechEnd);
      }
      if (handlers.onMessage) {
        this.client.removeListener('message', handlers.onMessage);
      }
      if (handlers.onError) {
        this.client.removeListener('error', handlers.onError);
      }
      if (handlers.onCallStartFailed) {
        this.client.removeListener('call-start-failed', handlers.onCallStartFailed);
      }
    };
  }

  /**
   * Get the underlying client (for advanced use)
   */
  getClient(): Vapi {
    return this.client;
  }
}

// Singleton instance
export const vapiService = new VapiService();
