"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        {children}
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}
