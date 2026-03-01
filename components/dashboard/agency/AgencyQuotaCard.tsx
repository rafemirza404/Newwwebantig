"use client";

import React from 'react';
import { Zap } from 'lucide-react';

export function AgencyQuotaCard() {
    return (
        <div className="bg-card border-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl p-6 h-full flex flex-col relative overflow-hidden">
            <p className="text-foreground text-[15px] tracking-wide font-medium">AI-Generated Strategy Actions</p>
            <p className="text-foreground text-3xl font-bold tracking-tight mt-1.5 justify-start">45 <span className="text-muted-foreground text-xl">/ 100</span></p>

            <p className="text-muted-foreground text-[13px] font-medium mt-6 mb-3">Smart Quota Usage</p>

            {/* Progress Bars */}
            <div className="flex w-full h-2 rounded-full overflow-hidden mb-4 bg-secondary">
                <div className="bg-primary h-full" style={{ width: '45%' }}></div>
                <div className="bg-white h-full border-l border-card" style={{ width: '15%' }}></div>
                <div className="bg-muted-foreground/30 h-full border-l border-card" style={{ width: '40%' }}></div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-6">
                <div className="flex items-center gap-2 text-[11px] font-medium">
                    <span className="w-2.5 h-2.5 rounded-sm bg-primary"></span>
                    <span className="text-foreground">Audits (45%)</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-medium">
                    <span className="w-2.5 h-2.5 rounded-sm bg-white"></span>
                    <span className="text-foreground">Reports (15%)</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-medium">
                    <span className="w-2.5 h-2.5 rounded-sm bg-muted-foreground/30"></span>
                    <span className="text-foreground">Other (40%)</span>
                </div>
            </div>

            {/* Clean Plan Status Box instead of literal Credit Card */}
            <div className="mt-auto aspect-[1.7] w-full rounded-xl p-5 relative overflow-hidden flex flex-col justify-between shadow-lg bg-primary/10 border border-primary/20">
                <div className="relative z-10 flex justify-between items-start">
                    <div className="text-lg font-bold tracking-wider opacity-90 flex items-center gap-2 text-foreground">
                        <Zap className="w-5 h-5 text-primary" />
                        AGENTBLUE PRO
                    </div>
                </div>

                <div className="relative z-10 w-full mt-auto">
                    <p className="text-muted-foreground text-sm font-medium mb-3">
                        Upgrade your plan to get unlimited audits, custom reports, and dedicated strategy sessions.
                    </p>
                    <button className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors w-full shadow-md">
                        Manage Plan
                    </button>
                </div>
            </div>
        </div>
    );
}
