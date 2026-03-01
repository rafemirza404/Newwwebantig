"use client";

/**
 * VoiceCallButton Component (Refactored)
 * Orchestrates the voice call flow with modular modals
 * Fixed: First call failure, stale closure, connecting state
 */

import { useState } from 'react';
import { Phone } from 'lucide-react';
import { useVoiceCallFlow } from '@/hooks/useVoiceCallFlow';
import { EmailLookupModal } from './modals/EmailLookupModal';
import { LeadFormModal } from './modals/LeadFormModal';
import { ConfirmationModal } from './modals/ConfirmationModal';
import { IntroModal } from './modals/IntroModal';
import { CallActiveCard } from './modals/CallActiveCard';
import { FeedbackModal } from './modals/FeedbackModal';
import type { LeadData, ModalState } from '@/types/models';

const VoiceCallButton = () => {
  const {
    callState,
    leadData,
    callDuration,
    callStatus,
    isMuted,
    rating,
    feedbackText,
    updateLeadData,
    validateAndCheckRateLimit,
    initiateCall,
    endCall,
    toggleMute,
    setRating,
    setFeedbackText,
    resetCall,
  } = useVoiceCallFlow();

  const [activeModal, setActiveModal] = useState<ModalState>('none');
  const [pendingEmail, setPendingEmail] = useState('');

  /**
   * Handle floating button click
   */
  const handleButtonClick = () => {
    if (leadData) {
      // User exists in localStorage
      setActiveModal('confirmation');
    } else {
      // New user
      setActiveModal('email_lookup');
    }
  };

  /**
   * Handle user found from email lookup
   */
  const handleUserFound = (userData: LeadData) => {
    updateLeadData(userData);
    setActiveModal('confirmation');
  };

  /**
   * Handle user not found from email lookup
   */
  const handleUserNotFound = (email: string) => {
    setPendingEmail(email);
    setActiveModal('lead_form');
  };

  /**
   * Handle lead form submission
   */
  const handleLeadFormSubmit = async (data: LeadData) => {
    updateLeadData(data);
    setActiveModal('none');

    // Check rate limit and proceed
    const canProceed = await validateAndCheckRateLimit();
    if (canProceed) {
      setActiveModal('intro');
    }
  };

  /**
   * Handle confirmed returning user
   */
  const handleConfirmedUser = async () => {
    setActiveModal('none');

    // Check rate limit and proceed
    const canProceed = await validateAndCheckRateLimit();
    if (canProceed) {
      setActiveModal('intro');
    }
  };

  /**
   * Handle update info (from confirmation modal)
   */
  const handleUpdateInfo = () => {
    setActiveModal('lead_form');
  };

  /**
   * Handle intro modal confirm - start call
   */
  const handleStartCall = async () => {
    setActiveModal('none');
    await initiateCall();
  };

  /**
   * Handle call end
   */
  const handleEndCall = () => {
    endCall();
  };

  /**
   * Handle feedback modal close
   */
  const handleFeedbackClose = () => {
    setActiveModal('none');
    resetCall();
  };

  // Show feedback modal when call ends
  const showFeedbackModal = callState.isEnded;

  return (
    <>
      {/* Floating Button */}
      {callState.isIdle && (
        <button
          onClick={handleButtonClick}
          className="fixed bottom-6 left-6 z-[9997] bg-[#0066FF] hover:bg-[#0052CC] text-white rounded-full px-4 py-2.5 sm:px-5 sm:py-3 shadow-lg transition-all duration-300 hover:shadow-xl group"
          aria-label="Talk to Sophia AI"
        >
          <div className="flex items-center gap-2 sm:gap-3 justify-center">
            <Phone className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <div className="flex flex-col items-start text-left">
              <span className="font-semibold text-xs sm:text-sm leading-tight">
                Talk to Sophia
              </span>
              <span className="text-[10px] sm:text-xs text-white/80 leading-tight whitespace-nowrap">
                2-min consultation
              </span>
            </div>
          </div>
        </button>
      )}

      {/* Email Lookup Modal */}
      <EmailLookupModal
        open={activeModal === 'email_lookup'}
        onClose={() => setActiveModal('none')}
        onUserFound={handleUserFound}
        onUserNotFound={handleUserNotFound}
      />

      {/* Lead Form Modal */}
      <LeadFormModal
        open={activeModal === 'lead_form'}
        onClose={() => setActiveModal('none')}
        onSubmit={handleLeadFormSubmit}
        initialEmail={pendingEmail}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        open={activeModal === 'confirmation'}
        onClose={() => setActiveModal('none')}
        onConfirm={handleConfirmedUser}
        onUpdateInfo={handleUpdateInfo}
        userData={leadData}
      />

      {/* Intro Modal */}
      <IntroModal
        open={activeModal === 'intro'}
        onClose={() => setActiveModal('none')}
        onConfirm={handleStartCall}
      />

      {/* Call Active Card (includes connecting + connected states) */}
      <CallActiveCard
        callState={callState.state}
        callStatus={callStatus}
        callDuration={callDuration}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        onEndCall={handleEndCall}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        open={showFeedbackModal}
        onClose={handleFeedbackClose}
        leadData={leadData}
        callStartTime={null} // Will be passed from useVoiceCallFlow if needed
        callDuration={callDuration}
        vapiCallId=""
        rating={rating}
        feedbackText={feedbackText}
        onRatingChange={setRating}
        onFeedbackTextChange={setFeedbackText}
      />
    </>
  );
};

export default VoiceCallButton;
