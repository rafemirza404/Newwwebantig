/**
 * VAPI SDK Types
 * Type definitions for VAPI integration
 */

export interface VapiVariables {
  name: string;
  email: string;
  company: string;
  role: string;
  phone: string;
  callSource: string;
}

export interface VapiAssistantOverrides {
  variableValues: VapiVariables;
  transcriber?: {
    provider: string;
    model?: string;
    keywords?: string[];
  };
}

export interface VapiCallStartMessage {
  type: 'call-started';
  call?: {
    id: string;
  };
}

export interface CallStartFailedEvent {
  stage: string;
  totalDuration: number;
  error: string;
  errorStack?: string;
  timestamp: string;
  context: Record<string, any>;
}

export type VapiEventType =
  | 'call-start'
  | 'call-end'
  | 'speech-start'
  | 'speech-end'
  | 'message'
  | 'error'
  | 'call-start-failed'
  | 'call-start-progress'
  | 'call-start-success';

export interface VapiEventHandlers {
  onCallStart?: () => void;
  onCallEnd?: () => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onMessage?: (message: any) => void;
  onError?: (error: Error | any) => void;
  onCallStartFailed?: (event: CallStartFailedEvent) => void;
}
