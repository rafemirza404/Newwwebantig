"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Cal.com configuration - Update these with your actual Cal.com details
const CAL_USERNAME = "your-username"; // Replace with your Cal.com username
const CAL_EVENT_SLUG = "30min"; // Replace with your event slug

interface CalendarBookingProps {
  trigger?: React.ReactNode;
  buttonText?: React.ReactNode;
  buttonClassName?: string;
  onBookingSuccess?: () => void;
}

export const CalendarBooking = ({
  trigger,
  buttonText = "Schedule Free Call",
  buttonClassName = "",
  onBookingSuccess
}: CalendarBookingProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleBookingSuccess = () => {
    console.log("Booking created successfully");
    if (onBookingSuccess) {
      onBookingSuccess();
    }
    setIsOpen(false);
  };

  return (
    <>
      {trigger ? (
        <div onClick={() => setIsOpen(true)}>
          {trigger}
        </div>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className={buttonClassName}
        >
          {buttonText}
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule Your Free Consultation</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {/* Embed Cal.com using iframe until we configure @calcom/atoms properly */}
            <iframe
              src={`https://cal.com/${CAL_USERNAME}/${CAL_EVENT_SLUG}`}
              width="100%"
              height="600px"
              frameBorder="0"
              title="Schedule a meeting"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CalendarBooking;
