/**
 * ConfirmationModal Component
 * Confirmation screen for returning users
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import type { LeadData } from '@/types/models';

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onUpdateInfo: () => void;
  userData: LeadData | null;
}

export const ConfirmationModal = ({
  open,
  onClose,
  onConfirm,
  onUpdateInfo,
  userData,
}: ConfirmationModalProps) => {
  if (!userData) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Welcome back, {userData.name}!</DialogTitle>
          <DialogDescription className="text-base pt-2">
            {userData.website_form_filled
              ? 'Ready to speak with Sophia again?'
              : 'We have your info from a previous interaction. Ready to speak with Sophia?'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2 text-sm">
            <p>
              <strong>Email:</strong> {userData.email}
            </p>
            <p>
              <strong>Company:</strong> {userData.company}
            </p>
            <p>
              <strong>Role:</strong> {userData.role}
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button onClick={onUpdateInfo} variant="outline" className="flex-1">
            Update Info
          </Button>
          <Button onClick={onConfirm} className="flex-1 bg-[#0066FF] hover:bg-[#0052CC]">
            <Phone className="w-4 h-4 mr-2" />
            Start Call
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
