/**
 * useVoiceCallFlow Hook
 * Main business logic for voice call feature
 * Prevents stale closure bugs by using refs
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCallState } from './useCallState';
import { useRateLimit } from './useRateLimit';
import { vapiService } from '@/services/api/vapi';
import { webhookService } from '@/services/api/webhooks';
import { storageService } from '@/services/storage/localStorage';
import { mobileAudioHandler } from '@/utils/mobileAudioHandler';
import type { LeadData, CallData, FeedbackData, CallStatus } from '@/types/models';

export const useVoiceCallFlow = () => {
  const { toast } = useToast();
  const callState = useCallState();
  const { checkRateLimit, saveCallTime } = useRateLimit();

  // Lead data management - using ref to prevent stale closures
  const [leadData, setLeadData] = useState<LeadData | null>(null);
  const leadDataRef = useRef<LeadData | null>(null);

  // Call state
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState<CallStatus>('listening');
  const [isMuted, setIsMuted] = useState(false);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [vapiCallId, setVapiCallId] = useState<string>('');

  // Feedback state
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');

  // Timers
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Refs for event handlers to access latest state
  const callStateRef = useRef(callState);
  const toastRef = useRef(toast);

  // FIX 1: Mobile audio handler cleanup function
  const mobileAudioCleanupRef = useRef<(() => Promise<void>) | null>(null);

  // Update refs when values change
  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);

  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  /**
   * Update lead data (syncs state + ref + localStorage)
   * This prevents stale closure issues
   */
  const updateLeadData = useCallback((data: LeadData) => {
    console.log('[VoiceCallFlow] Updating lead data:', data);
    leadDataRef.current = data;
    setLeadData(data);
    storageService.saveUserData(data);
  }, []);

  /**
   * Load user data from localStorage on mount
   */
  useEffect(() => {
    const savedUser = storageService.getUserData();
    if (savedUser) {
      leadDataRef.current = savedUser;
      setLeadData(savedUser);
    }
  }, []);

  /**
   * Validate and check rate limit before initiating call
   * FIX 5: Form submission is now fully asynchronous - no blocking
   */
  const validateAndCheckRateLimit = useCallback(async (): Promise<boolean> => {
    const currentData = leadDataRef.current;

    if (!currentData) {
      toast({
        title: 'Error',
        description: 'User data not found. Please fill the form again.',
        variant: 'destructive',
      });
      return false;
    }

    // Check rate limit (client-side only now)
    const isAllowed = await checkRateLimit(currentData);
    if (!isAllowed) {
      return false;
    }

    // FIX 5: Save profile asynchronously in background (fire and forget)
    // User doesn't wait for n8n workflow - call starts immediately
    webhookService.saveProfile({
      name: currentData.name,
      email: currentData.email,
      phone: currentData.phone,
      company: currentData.company,
      role: currentData.role,
    }).catch((error) => {
      // Handle errors silently - don't block the call
      console.error('[Background] Failed to save profile:', error);
    });

    return true;
  }, [checkRateLimit, toast]);

  /**
   * Initiate call - THE CRITICAL FIX FOR FIRST CALL FAILURE
   */
  const initiateCall = useCallback(async () => {
    // CRITICAL: Always use ref, not state, to avoid stale closure
    const currentData = leadDataRef.current;

    if (!currentData) {
      toast({
        title: 'Error',
        description: 'User data not available. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    // FIX 4: Enforce phone number requirement - absolutely mandatory
    if (!currentData.phone || currentData.phone.trim() === '') {
      toast({
        title: 'Phone Number Required',
        description: 'Phone number is required to continue. Please fill out the form.',
        variant: 'destructive',
      });
      callState.transitionTo('ended');
      return;
    }

    console.log('[VoiceCallFlow] Initiating call with data:', currentData);

    // Immediately transition to connecting state
    callState.transitionTo('connecting');

    try {
      // Pass data directly to VAPI - no closure issues
      await vapiService.startCall({
        name: currentData.name,
        email: currentData.email,
        company: currentData.company,
        role: currentData.role,
        phone: currentData.phone,
        callSource: 'website',
      });

      // CRITICAL FIX: saveCallTime() moved to handleCallStart
      // Only save call time AFTER call actually connects (not just after start() returns)
      // This prevents rate-limiting users when their call fails to connect

      // State will transition to 'connected' via VAPI 'call-start' event
    } catch (error) {
      console.error('[VoiceCallFlow] Failed to start call:', error);

      callState.transitionTo('ended');

      toast({
        title: 'Failed to Start Call',
        description: 'Unable to initialize call. Please check your microphone permissions and try again.',
        variant: 'destructive',
      });
    }
  }, [callState, toast]);

  /**
   * End call
   */
  const endCall = useCallback(() => {
    console.log('[VoiceCallFlow] Ending call');
    callState.transitionTo('ending');
    vapiService.stop();
    // State will transition to 'ended' via VAPI 'call-end' event
  }, [callState]);

  /**
   * Toggle mute
   */
  const toggleMute = useCallback(() => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    vapiService.setMuted(newMutedState);
  }, [isMuted]);

  /**
   * Save call record
   */
  const saveCallRecord = useCallback(
    async (endTime: Date) => {
      const currentData = leadDataRef.current;
      if (!currentData) return;

      const callData: CallData = {
        started_at: callStartTime?.toISOString() || '',
        ended_at: endTime.toISOString(),
        duration: formatTime(callDuration),
        vapi_call_id: vapiCallId || null,
      };

      const feedbackData: FeedbackData = {
        rating: rating || null,
        comment: feedbackText || '',
        next_action: null,
      };

      try {
        await webhookService.saveCallRecord({
          lead_data: {
            name: currentData.name,
            email: currentData.email,
            phone: currentData.phone,
            company: currentData.company,
            role: currentData.role,
          },
          call_data: callData,
          feedback: feedbackData,
        });
      } catch (error) {
        console.error('[VoiceCallFlow] Failed to save call record:', error);
      }
    },
    [callStartTime, callDuration, vapiCallId, rating, feedbackText]
  );

  /**
   * Setup VAPI event listeners - ONLY ONCE on mount
   */
  useEffect(() => {
    const handleCallStart = async () => {
      console.log('[VAPI] Call started');
      callStateRef.current.transitionTo('connected');
      setCallStartTime(new Date());
      document.body.style.overflow = 'hidden';

      // FIX 1: Start mobile audio handling to prevent microphone cutout
      try {
        const cleanup = await mobileAudioHandler.startCall();
        mobileAudioCleanupRef.current = cleanup;
        console.log('[MobileAudio] Mobile audio handling activated');
      } catch (error) {
        console.error('[MobileAudio] Failed to start mobile audio handling:', error);
        // Don't block call if mobile audio fails
      }

      // Start call duration timer
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);

      // CRITICAL FIX: Save call time ONLY when call actually connects
      // This ensures rate limit only applies to successful calls
      saveCallTime();
      console.log('[VoiceCallFlow] Call connected - rate limit timestamp saved');
    };

    const handleCallEnd = async () => {
      console.log('[VAPI] Call ended');
      callStateRef.current.transitionTo('ended');
      document.body.style.overflow = 'auto';

      // FIX 1: Clean up mobile audio handling
      if (mobileAudioCleanupRef.current) {
        try {
          await mobileAudioCleanupRef.current();
          mobileAudioCleanupRef.current = null;
          console.log('[MobileAudio] Mobile audio handling deactivated');
        } catch (error) {
          console.error('[MobileAudio] Failed to cleanup mobile audio:', error);
        }
      }

      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Save call record using current state values
      const currentData = leadDataRef.current;
      if (!currentData) return;

      // Access current state at the time of call end
      const endTime = new Date();

      setCallDuration((currentDuration) => {
        setCallStartTime((currentStartTime) => {
          setVapiCallId((currentVapiCallId) => {
            setRating((currentRating) => {
              setFeedbackText((currentFeedback) => {
                // Save with all current values
                const callData: CallData = {
                  started_at: currentStartTime?.toISOString() || '',
                  ended_at: endTime.toISOString(),
                  duration: formatTime(currentDuration),
                  vapi_call_id: currentVapiCallId || null,
                };

                const feedbackData: FeedbackData = {
                  rating: currentRating || null,
                  comment: currentFeedback || '',
                  next_action: null,
                };

                webhookService.saveCallRecord({
                  lead_data: {
                    name: currentData.name,
                    email: currentData.email,
                    phone: currentData.phone,
                    company: currentData.company,
                    role: currentData.role,
                  },
                  call_data: callData,
                  feedback: feedbackData,
                }).catch((error) => {
                  console.error('[VoiceCallFlow] Failed to save call record:', error);
                });

                return currentFeedback;
              });
              return currentRating;
            });
            return currentVapiCallId;
          });
          return currentStartTime;
        });
        return currentDuration;
      });
    };

    const handleSpeechStart = () => {
      setCallStatus('speaking');
    };

    const handleSpeechEnd = () => {
      setCallStatus('listening');
    };

    const handleMessage = (message: any) => {
      if (message.type === 'call-started' && message.call?.id) {
        setVapiCallId(message.call.id);
      }
    };

    const handleError = (error: Error) => {
      console.error('[VAPI] Error:', error);
      toastRef.current({
        title: 'Call Error',
        description: 'There was an issue with the call. Please try again.',
        variant: 'destructive',
      });
      callStateRef.current.transitionTo('ended');
      document.body.style.overflow = 'auto';
    };

    /**
     * NEW: Handle call-start-failed event with detailed error info
     * This provides exact stage and context where the call failed
     */
    const handleCallStartFailed = (event: any) => {
      console.error('[VAPI] Call start failed:', {
        stage: event.stage,
        error: event.error,
        duration: event.totalDuration,
        context: event.context,
      });

      // Transition to ended state
      callStateRef.current.transitionTo('ended');
      document.body.style.overflow = 'auto';

      // Show detailed error message to user
      const stageMessages: Record<string, string> = {
        'web-call-creation': 'Failed to connect to voice service',
        'daily-call-object-creation': 'Failed to initialize call',
        'mobile-permissions': 'Microphone permission issue',
        'daily-call-join': 'Failed to join call',
        'unknown': 'Call initialization failed',
      };

      const description = stageMessages[event.stage] || 'Unable to start call';

      toastRef.current({
        title: 'Call Failed',
        description: `${description}. Please check your microphone permissions and internet connection, then try again.`,
        variant: 'destructive',
      });
    };

    // Set up listeners and get cleanup function
    const removeListeners = vapiService.setupEventListeners({
      onCallStart: handleCallStart,
      onCallEnd: handleCallEnd,
      onSpeechStart: handleSpeechStart,
      onSpeechEnd: handleSpeechEnd,
      onMessage: handleMessage,
      onError: handleError,
      onCallStartFailed: handleCallStartFailed,
    });

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      removeListeners(); // Remove event listeners
      document.body.style.overflow = 'auto';
    };
  }, []); // Empty deps - only run once on mount

  /**
   * Reset call state
   */
  const resetCall = useCallback(() => {
    setCallDuration(0);
    setCallStatus('listening');
    setIsMuted(false);
    setCallStartTime(null);
    setVapiCallId('');
    setRating(0);
    setFeedbackText('');
    callState.reset();
  }, [callState]);

  return {
    // State
    callState,
    leadData,
    callDuration,
    callStatus,
    isMuted,
    rating,
    feedbackText,

    // Actions
    updateLeadData,
    validateAndCheckRateLimit,
    initiateCall,
    endCall,
    toggleMute,
    setRating,
    setFeedbackText,
    resetCall,
  };
};

/**
 * Format seconds to MM:SS
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
