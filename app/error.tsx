"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("[GlobalError]", error);
        // TODO: Send to monitoring service (e.g., Sentry)
    }, [error]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-card border-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-3xl p-10 text-center">
                <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">⚠️</span>
                </div>
                <h2 className="text-foreground text-xl font-bold mb-2">Something went wrong</h2>
                <p className="text-muted-foreground text-[15px] mb-8">
                    An unexpected error occurred. Please try again or go back to the dashboard.
                </p>
                {error.digest && (
                    <p className="text-muted-foreground/50 text-xs mb-4 font-mono">
                        Error ID: {error.digest}
                    </p>
                )}
                <div className="flex gap-3">
                    <button
                        onClick={reset}
                        className="flex-1 px-6 py-3 bg-secondary hover:bg-secondary/80 text-foreground text-sm font-semibold rounded-full shadow-sm transition-colors"
                    >
                        Try Again
                    </button>
                    <Link
                        href="/dashboard"
                        className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-full shadow-sm transition-colors"
                    >
                        Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
