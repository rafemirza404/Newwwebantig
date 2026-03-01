/**
 * useRateLimit Hook
 * Handle rate limiting logic for calls
 */

import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { webhookService } from '@/services/api/webhooks';
import { storageService } from '@/services/storage/localStorage';
import { CALL_CONSTANTS } from '@/config/constants';
import type { LeadData } from '@/types/models';

export const useRateLimit = () => {
  const { toast } = useToast();

  const checkRateLimit = useCallback(async (userData: LeadData): Promise<boolean> => {
    // FIX 3: Disabled call eligibility check - only use client-side localStorage check
    // No longer making API calls to check eligibility

    // Check localStorage first for quick client-side rate limit
    const lastCallTime = storageService.getLastCallTime();

    if (lastCallTime) {
      const timeSinceLastCall = Date.now() - lastCallTime;
      const minutesSince = Math.floor(timeSinceLastCall / 60000);

      if (minutesSince < CALL_CONSTANTS.RATE_LIMIT_MINUTES) {
        const minutesRemaining = CALL_CONSTANTS.RATE_LIMIT_MINUTES - minutesSince;
        toast({
          title: 'Please wait',
          description: `Please wait ${minutesRemaining} minutes before your next call`,
          variant: 'destructive',
        });
        return false;
      }
    }

    // Server-side eligibility check disabled - proceed with call
    return true;
  }, [toast]);

  const saveCallTime = useCallback(() => {
    storageService.saveLastCallTime(Date.now());
  }, []);

  return {
    checkRateLimit,
    saveCallTime,
  };
};
