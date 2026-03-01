"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

// This page is hit when Agent 1 signals completion but /complete hasn't been called yet.
// It triggers the complete API and then polls for the report.
export default function CompleteRedirectPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/audit/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json();
        if (data.reportId) {
          router.push(`/report/${data.reportId}`);
          return;
        }
      } catch (err) {
        console.error("[CompleteRedirect] Completion trigger failed:", err);
        // fall through to poll
      }

      // Poll status
      let attempts = 0;
      const poll = async () => {
        if (attempts > 90) return;
        attempts++;
        const res = await fetch(`/api/audit/status/${sessionId}`);
        const data = await res.json();
        if (data.status === "complete" && data.reportId) {
          router.push(`/report/${data.reportId}`);
        } else {
          setTimeout(poll, 2000);
        }
      };
      poll();
    })();
  }, [sessionId, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="text-center w-full max-w-sm bg-card border-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl p-8">
        <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-6" />
        <p className="text-foreground text-lg font-semibold">Generating your report…</p>
        <p className="text-muted-foreground text-[15px] mt-2">This takes about 30 seconds</p>
      </div>
    </div>
  );
}
