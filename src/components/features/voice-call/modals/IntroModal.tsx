/**
 * IntroModal Component
 * Introduction screen before starting the call
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Phone } from 'lucide-react';

interface IntroModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const IntroModal = ({ open, onClose, onConfirm }: IntroModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Connect with Sophia AI</DialogTitle>
          <DialogDescription className="text-base pt-2">
            You're about to speak with our AI automation expert. She'll ask about your business and
            explain how we can help.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="flex items-start gap-3 text-sm">
            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700 dark:text-gray-300">
              Make sure you're in a quiet environment
            </span>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700 dark:text-gray-300">
              Allow microphone access when prompted
            </span>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700 dark:text-gray-300">
              The call typically takes 2-3 minutes
            </span>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button onClick={onClose} variant="outline" className="flex-1">
            Cancel
          </Button>
          <Button onClick={onConfirm} className="flex-1 bg-[#0066FF] hover:bg-[#0052CC]">
            <Phone className="w-4 h-4 mr-2" />
            Start Voice Call
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
