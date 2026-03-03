"use client";

import { useState, useEffect, useCallback, useRef, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, Loader2, CheckCircle2 } from "lucide-react";

interface AuditSessionProps {
  sessionId: string;
  businessName: string;
  initialAnswerCount: number;
  startProcessing: boolean;
}

const PROCESSING_STEPS = [
  "Building your business profile",
  "Identifying automation gaps",
  "Mapping AI solutions (per gap)",
  "Assembling your report",
  "Designing automation diagrams",
  "Compiling final report",
];

const CATEGORY_LABELS: Record<string, string> = {
  sales: "Sales & Lead Generation",
  customer_onboarding: "Customer Onboarding",
  operations: "Operations",
  finance: "Finance & Admin",
  customer_support: "Customer Support",
  marketing: "Marketing & Content",
  hr: "HR & Team",
  data_reporting: "Data & Reporting",
  technology: "Technology",
  general: "Discovery",
  complete: "Complete",
};

export default function AuditSession({
  sessionId,
  businessName,
  initialAnswerCount,
  startProcessing,
}: AuditSessionProps) {
  const router = useRouter();

  const [questionText, setQuestionText] = useState("");
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("general");
  const [questionCount, setQuestionCount] = useState(initialAnswerCount);
  const [answerText, setAnswerText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [processing, setProcessing] = useState(startProcessing);
  const [processingStep, setProcessingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const pollingRef = useRef<boolean>(false);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const currentQuestionTextRef = useRef("");
  const currentOrderRef = useRef(initialAnswerCount);

  // Auto-resize textarea
  useLayoutEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [answerText]);

  // Cycle processing steps
  useEffect(() => {
    if (!processing) return;
    const interval = setInterval(() => {
      setProcessingStep((i) => Math.min(i + 1, PROCESSING_STEPS.length - 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [processing]);

  // On mount — fetch next question for both fresh starts and resumed sessions
  useEffect(() => {
    if (startProcessing) {
      pollStatus();
      return;
    }
    fetchFirstQuestion();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scheduleRetry = useCallback((fn: () => void, delayMs: number) => {
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    setRetrying(true);
    retryTimerRef.current = setTimeout(() => {
      setRetrying(false);
      setError(null);
      fn();
    }, delayMs);
  }, []);

  const fetchFirstQuestion = useCallback(async (attempt = 0) => {
    setIsStreaming(true);
    setStreamingText("");
    setError(null);

    try {
      const res = await fetch("/api/audit/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          questionText: "__START__",
          answerText: "__START__",
          category: "general",
          questionOrder: -1,
        }),
      });

      await readSSEStream(res, -1);
    } catch (err) {
      console.error("[AuditSession] First question error:", err);
      setIsStreaming(false);
      if (attempt < 4) {
        const delay = Math.min(2000 * (attempt + 1), 8000);
        setError(`Connection issue — retrying in ${delay / 1000}s…`);
        scheduleRetry(() => fetchFirstQuestion(attempt + 1), delay);
      } else {
        setError("Can't reach the server. Check your connection and refresh.");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, scheduleRetry]);

  const pollStatus = useCallback(async () => {
    if (pollingRef.current) return;
    pollingRef.current = true;
    let attempts = 0;

    const poll = async () => {
      if (attempts > 120) {
        setError("Processing is taking longer than expected. Check your dashboard for the report.");
        pollingRef.current = false;
        return;
      }
      attempts++;
      try {
        const res = await fetch(`/api/audit/status/${sessionId}`);
        if (!res.ok) throw new Error(`Status check failed: ${res.status}`);
        const data = await res.json();
        if (data.status === "complete" && data.reportId) {
          router.push(`/report/${data.reportId}`);
        } else if (data.status === "failed") {
          setError("Report generation failed. Please try again from your dashboard.");
          pollingRef.current = false;
        } else {
          setTimeout(poll, 3000);
        }
      } catch (err) {
        console.error("[AuditSession] Poll error:", err);
        setTimeout(poll, 4000);
      }
    };
    poll();
  }, [sessionId, router]);

  const triggerCompletion = useCallback(async (closingMessage?: string | null) => {
    setClosing(false);
    setProcessing(true);
    if (closingMessage) {
      setQuestionText(closingMessage);
    }

    try {
      const res = await fetch("/api/audit/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (data.status === "processing" || data.status === "complete") {
        pollStatus();
        return;
      }
      if (data.reportId) {
        router.push(`/report/${data.reportId}`);
        return;
      }
    } catch (err) {
      console.error("[AuditSession] Completion trigger failed, polling:", err);
    }
    pollStatus();
  }, [sessionId, router, pollStatus]);

  async function readSSEStream(res: Response, questionOrder: number) {
    if (!res.ok || !res.body) {
      throw new Error(`Answer API returned ${res.status}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let accumulatedQuestion = "";
    let isComplete = false;
    let closingMessage: string | null = null;
    let category = "general";

    setIsStreaming(true);
    setStreamingText("");

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;

          let event: { type: string; text?: string; questionText?: string; meta?: { question_category?: string; is_complete?: boolean; closing_message?: string | null; }; message?: string };
          try {
            event = JSON.parse(raw);
          } catch {
            continue;
          }

          if (event.type === "token" && event.text) {
            accumulatedQuestion += event.text;
            setStreamingText(accumulatedQuestion);
          } else if (event.type === "complete") {
            const finalText = (event.questionText ?? accumulatedQuestion).trim();
            isComplete = event.meta?.is_complete ?? false;
            closingMessage = event.meta?.closing_message ?? null;
            category = event.meta?.question_category ?? "general";

            setStreamingText("");
            setIsStreaming(false);

            if (!isComplete) {
              setQuestionText(finalText);
              currentQuestionTextRef.current = finalText;
              setCurrentCategory(category);
              setQuestionCount((c) => c + 1);
              currentOrderRef.current = questionOrder + 1;
              setTimeout(() => textareaRef.current?.focus(), 100);
            }
          } else if (event.type === "error") {
            setError(event.message ?? "Something went wrong");
            setIsStreaming(false);
          }
        }
      }
    } finally {
      reader.cancel();
    }

    if (isComplete) {
      await triggerCompletion(closingMessage);
    }
  }

  const handleSubmit = useCallback(async (attempt = 0) => {
    if (submitting || isStreaming || !answerText.trim()) return;
    setSubmitting(true);
    setError(null);

    const answer = answerText.trim();
    const orderToSubmit = currentOrderRef.current;
    const questionToSubmit = currentQuestionTextRef.current || questionText;
    const categoryToSubmit = currentCategory;

    // Only clear the textarea on the first attempt so the answer isn't lost on retry
    if (attempt === 0) setAnswerText("");

    try {
      const res = await fetch("/api/audit/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          questionText: questionToSubmit,
          answerText: answer,
          category: categoryToSubmit,
          questionOrder: orderToSubmit,
        }),
      });

      setSubmitting(false);
      await readSSEStream(res, orderToSubmit);
    } catch (err) {
      console.error("[AuditSession] Submit error:", err);
      setSubmitting(false);
      if (attempt < 4) {
        const delay = Math.min(2000 * (attempt + 1), 8000);
        setError(`Connection issue — retrying in ${delay / 1000}s…`);
        // Restore the answer to the textarea so the user can see it / re-edit
        setAnswerText(answer);
        scheduleRetry(() => handleSubmit(attempt + 1), delay);
      } else {
        setError("Can't reach the server. Your answer is still in the box — try submitting again.");
        setAnswerText(answer);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitting, isStreaming, answerText, questionText, currentCategory, sessionId, scheduleRetry]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(0);
    }
  };

  // ─── Processing screen ─────────────────────────────────────────────────────
  if (processing) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-card border-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-3xl p-10 flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-[#60A5FA]" />
          <div className="w-16 h-16 mb-8 rounded-2xl bg-secondary flex items-center justify-center shadow-sm">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
          <h2 className="text-foreground text-[22px] font-bold mb-2 tracking-tight text-center">
            Analysing {businessName}
          </h2>
          <p className="text-muted-foreground text-[15px] mb-10 text-center">
            {closing ? questionText : "This takes about 30–60 seconds"}
          </p>

          <div className="w-full text-left space-y-4 px-2">
            {PROCESSING_STEPS.map((step, i) => (
              <div key={step} className="flex items-center gap-4">
                {i < processingStep ? (
                  <CheckCircle2 className="w-5 h-5 text-[#4ADE80] flex-shrink-0" />
                ) : i === processingStep ? (
                  <Loader2 className="w-5 h-5 text-primary animate-spin flex-shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full border border-border/50 flex-shrink-0 bg-secondary/50" />
                )}
                <span className={`text-[15px] font-medium transition-colors duration-300 ${
                  i < processingStep ? "text-foreground" :
                  i === processingStep ? "text-foreground" :
                  "text-muted-foreground/50"
                }`}>
                  {step}
                </span>
              </div>
            ))}
          </div>

          {error && (
            <div className="mt-10 space-y-4 w-full text-center">
              <p className="text-destructive font-semibold text-sm bg-destructive/10 rounded-lg p-3">{error}</p>
              <Link href="/dashboard" className="inline-flex items-center justify-center px-6 py-3 bg-secondary hover:bg-secondary/80 text-foreground text-sm font-semibold rounded-full shadow-sm transition-colors mt-2">
                ← Go to Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Question screen ───────────────────────────────────────────────────────
  const displayText = isStreaming ? streamingText : questionText;
  const isLoading = submitting || isStreaming;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between p-6 max-w-[1400px] mx-auto w-full">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors bg-secondary/50 hover:bg-secondary px-4 py-2 rounded-full"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>
        <div className="flex items-center gap-3 bg-secondary/50 px-4 py-2 rounded-full">
          {isLoading && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
          <span className="text-foreground text-sm font-semibold tabular-nums uppercase tracking-wider">
            {questionCount > 0 ? `Question ${questionCount}` : "Starting..."}
          </span>
        </div>
      </header>

      {/* Progress bar */}
      <div className="px-6 w-full max-w-2xl mx-auto mb-6">
        <div className="h-1.5 bg-secondary rounded-full relative overflow-hidden">
          {isLoading && questionText === "" ? (
            <div className="absolute inset-y-0 left-0 w-1/3 bg-primary/50 rounded-full animate-pulse" />
          ) : (
            <div
              className="h-full bg-primary rounded-full"
              style={{
                width: `${Math.min(95, (questionCount / 20) * 100)}%`,
                transition: "width 0.5s ease-out",
              }}
            />
          )}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center px-6 pb-20 w-full">
        <div className="w-full max-w-2xl space-y-4">
          {/* Category pill */}
          {(questionText || isStreaming) && (
            <p className="text-primary text-[11px] uppercase font-bold tracking-widest bg-primary/10 px-3 py-1.5 rounded-full inline-block">
              {CATEGORY_LABELS[currentCategory] ?? currentCategory}
            </p>
          )}

          {/* Question card */}
          <div className="bg-card shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-3xl p-8 sm:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-[200px] pointer-events-none" />

            {/* Question text with typing cursor */}
            {(displayText || isStreaming) ? (
              <h2 className="text-foreground text-[26px] sm:text-[30px] font-bold leading-tight mb-8 relative z-10 min-h-[60px]">
                {displayText}
                {isStreaming && (
                  <span className="inline-block w-0.5 h-7 bg-primary ml-1 animate-pulse align-middle" />
                )}
              </h2>
            ) : (
              <div className="min-h-[80px] flex items-center mb-8">
                <div className="space-y-3 w-full">
                  <div className="h-7 bg-secondary rounded-xl animate-pulse w-4/5" />
                  <div className="h-7 bg-secondary rounded-xl animate-pulse w-3/5" />
                </div>
              </div>
            )}

            {/* Answer textarea */}
            {!isStreaming && questionText && (
              <div className="relative z-10">
                <textarea
                  ref={textareaRef}
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your answer... (Enter to submit, Shift+Enter for new line)"
                  disabled={submitting}
                  rows={2}
                  className={`w-full resize-none bg-secondary/60 border border-border/40 rounded-2xl px-5 py-4 text-foreground text-[15px] leading-relaxed placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:bg-secondary/80 transition-all duration-200 ${
                    submitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  style={{ minHeight: "80px", maxHeight: "300px", overflow: "auto" }}
                />
                <button
                  onClick={() => handleSubmit()}
                  disabled={!answerText.trim() || submitting || retrying}
                  className="absolute bottom-4 right-4 w-9 h-9 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                >
                  {submitting || retrying ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            )}

            {error && (
              <p className={`font-medium text-sm text-center mt-4 py-3 rounded-xl relative z-10 ${retrying ? "text-amber-500 bg-amber-500/10" : "text-destructive bg-destructive/10"}`}>
                {retrying ? <Loader2 className="w-3 h-3 animate-spin inline mr-1.5" /> : null}{error}
              </p>
            )}
          </div>

          {/* Hint */}
          {!isStreaming && questionText && (
            <p className="text-muted-foreground/50 text-[12px] text-center font-medium">
              Press <kbd className="bg-secondary/70 border border-border/40 px-1.5 py-0.5 rounded text-[11px] font-mono">Enter</kbd> to submit &nbsp;·&nbsp; <kbd className="bg-secondary/70 border border-border/40 px-1.5 py-0.5 rounded text-[11px] font-mono">Shift + Enter</kbd> for new line
            </p>
          )}
        </div>
      </main>

      <footer className="w-full text-center py-6">
        <p className="text-muted-foreground/60 text-xs font-semibold uppercase tracking-wider">
          Your answers are saved automatically
        </p>
      </footer>
    </div>
  );
}
