"use client";

import "../(marketing)/marketing.css";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { TooltipProvider } from "~/components/ui/tooltip";
import MarketingNav from "~/components/marketing/MarketingNav";
import MarketingFooter from "~/components/marketing/MarketingFooter";
import { Toaster } from "~/components/ui/toaster";
import { Toaster as Sonner } from "~/components/ui/sonner";

const queryClient = new QueryClient();

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="marketing-page min-h-screen flex flex-col">
          <MarketingNav />
          <main className="flex-1">{children}</main>
          <MarketingFooter />
        </div>
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
