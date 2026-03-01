/**
 * useCallState Hook
 * State machine for managing call states with validation
 */

import { useState, useCallback } from 'react';
import type { CallState } from '@/types/models';

const VALID_TRANSITIONS: Record<CallState, CallState[]> = {
  idle: ['connecting'],
  connecting: ['connected', 'ended'],
  connected: ['ending'],
  ending: ['ended'],
  ended: ['idle'],
};

export const useCallState = (initialState: CallState = 'idle') => {
  const [state, setState] = useState<CallState>(initialState);

  const transitionTo = useCallback((newState: CallState): boolean => {
    const validNextStates = VALID_TRANSITIONS[state];

    if (validNextStates.includes(newState)) {
      console.log(`[CallState] Transitioning: ${state} → ${newState}`);
      setState(newState);
      return true;
    }

    console.warn(`[CallState] Invalid transition: ${state} → ${newState}`);
    return false;
  }, [state]);

  const reset = useCallback(() => {
    setState('idle');
  }, []);

  return {
    state,
    isIdle: state === 'idle',
    isConnecting: state === 'connecting',
    isConnected: state === 'connected',
    isEnding: state === 'ending',
    isEnded: state === 'ended',
    transitionTo,
    reset,
  };
};
