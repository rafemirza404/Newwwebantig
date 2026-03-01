"use client";

/**
 * FeedbackModal Component
 * Post-call feedback collection
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { webhookService } from '@/services/api/webhooks';
import type { LeadData } from '@/types/models';

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
  leadData: LeadData | null;
  callStartTime: Date | null;
  callDuration: number;
  vapiCallId: string;
  rating: number;
  feedbackText: string;
  onRatingChange: (rating: number) => void;
  onFeedbackTextChange: (text: string) => void;
}

export const FeedbackModal = ({
  open,
  onClose,
  leadData,
  callStartTime,
  callDuration,
  vapiCallId,
  rating,
  feedbackText,
  onRatingChange,
  onFeedbackTextChange,
}: FeedbackModalProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [autoCloseCountdown, setAutoCloseCountdown] = useState(10);

  // Auto-close countdown
  useEffect(() => {
    if (open && autoCloseCountdown > 0) {
      const timer = setTimeout(() => {
        setAutoCloseCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (open && autoCloseCountdown === 0) {
      onClose();
    }
  }, [open, autoCloseCountdown, onClose]);

  const resetCountdown = () => {
    setAutoCloseCountdown(10);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFeedbackSubmit = async () => {
    resetCountdown();

    if (!leadData) return;

    try {
      await webhookService.saveCallRecord({
        lead_data: {
          name: leadData.name,
          email: leadData.email,
          phone: leadData.phone,
          company: leadData.company,
          role: leadData.role,
        },
        call_data: {
          started_at: callStartTime?.toISOString() || '',
          ended_at: new Date().toISOString(),
          duration: formatTime(callDuration),
          vapi_call_id: vapiCallId || null,
        },
        feedback: {
          rating: rating,
          comment: feedbackText,
          next_action: 'submitted',
        },
      });

      toast({
        title: 'Thank you!',
        description: 'Your feedback has been recorded.',
      });

      onClose();
    } catch (error) {
      console.error('Error updating feedback:', error);
    }
  };

  const handleExploreServices = async () => {
    resetCountdown();

    if (!leadData) return;

    try {
      await webhookService.saveCallRecord({
        lead_data: {
          name: leadData.name,
          email: leadData.email,
          phone: leadData.phone,
          company: leadData.company,
          role: leadData.role,
        },
        call_data: {
          started_at: callStartTime?.toISOString() || '',
          ended_at: new Date().toISOString(),
          duration: formatTime(callDuration),
          vapi_call_id: vapiCallId || null,
        },
        feedback: {
          rating: rating || null,
          comment: feedbackText || '',
          next_action: 'explore_services',
        },
      });
    } catch (error) {
      console.error('Error updating action:', error);
    }

    router.push('/services');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-md"
        onClick={resetCountdown}
        onKeyDown={resetCountdown}
      >
        <div className="text-center space-y-4 py-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-green-600 dark:text-green-500" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Thanks for speaking with Sophia!
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your consultation summary will be sent to your email
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <p className="font-medium text-gray-900 dark:text-white">
              How was your experience?
            </p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => {
                    onRatingChange(star);
                    resetCountdown();
                  }}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Textarea
              placeholder="Any additional feedback? (optional)"
              value={feedbackText}
              onChange={(e) => {
                onFeedbackTextChange(e.target.value);
                resetCountdown();
              }}
              maxLength={500}
              className="min-h-[80px]"
            />
            <p className="text-xs text-gray-500 text-right">
              {feedbackText.length}/500
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <Button
              onClick={handleExploreServices}
              className="w-full bg-[#0066FF] hover:bg-[#0052CC]"
            >
              Explore Our Services
            </Button>

            {rating > 0 && (
              <Button onClick={handleFeedbackSubmit} variant="outline" className="w-full">
                Submit Feedback
              </Button>
            )}
          </div>

          <div className="pt-2 space-y-2">
            <p className="text-sm text-gray-500">Closing in {autoCloseCountdown} seconds...</p>
            <button
              onClick={onClose}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
