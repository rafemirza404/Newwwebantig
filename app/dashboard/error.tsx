"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("[DashboardError]", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-card border-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-3xl p-10 text-center">
                <div className="w-14 h-14 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl">📊</span>
                </div>
                <h2 className="text-foreground text-xl font-bold mb-2">Dashboard Error</h2>
                <p className="text-muted-foreground text-[15px] mb-8">
                    Something went wrong loading your dashboard. Your data is safe — try refreshing.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={reset}
                        className="flex-1 px-6 py-3 bg-secondary hover:bg-secondary/80 text-foreground text-sm font-semibold rounded-full shadow-sm transition-colors"
                    >
                        Retry
                    </button>
                    <Link
                        href="/"
                        className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-full shadow-sm transition-colors"
                    >
                        Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
