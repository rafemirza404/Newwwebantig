"use client";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

// Lazy-loaded feature components (keep existing marketing features)
import dynamic from "next/dynamic";

const Chatbot = dynamic(() => import("@/components/features/chatbot/Chatbot"), {
  ssr: false,
});
const VoiceCallButton = dynamic(
  () => import("@/components/features/voice-call/VoiceCallButton"),
  { ssr: false }
);

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {children}
        <Toaster />
        <Sonner />
        <Chatbot />
        <VoiceCallButton />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
