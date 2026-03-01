"use client";

import Link from "next/link";
import { CheckCircle2, Circle, Clock, Target, Zap, ArrowUpRight, ListFilter } from "lucide-react";
import ScoreBar from "~/components/dashboard/shared/ScoreBar";
import { DashboardHeader } from "~/components/dashboard/shared/DashboardHeader";

interface DirectDashboardProps {
  firstName: string;
  email?: string;
  latestReport: any;
  sessions: any[];
  implItems: any[];
  plan: string;
}

const FUNCTION_LABELS: Record<string, string> = {
  sales: "Sales",
  marketing: "Marketing",
  operations: "Operations",
  finance: "Finance",
  hr: "HR",
  customer_service: "Customer Service",
  technology: "Technology",
  strategy: "Strategy",
};

const PRIORITY_LABELS: Record<string, string> = {
  quick_win: "Quick Win",
  medium: "Medium",
  strategic: "Strategic",
};

const TABS = ["All", "To-Do", "In Progress", "Completed", "Reports"];

export default function DirectDashboard({ firstName, email = "", latestReport, sessions, implItems, plan }: DirectDashboardProps) {
  const hasAudit = sessions.length > 0;
  const score = latestReport?.overall_score ?? null;
  const functionScores = latestReport?.function_scores ?? {};
  const gaps = latestReport?.full_gaps ?? latestReport?.gaps_preview ?? [];
  const resolvedItems = implItems.filter((i) => i.status === "done").length;
  const totalTimeSaved = implItems.reduce((sum, i) => sum + (i.time_saved_hrs ?? 0), 0);

  // Build search items from sessions
  const searchItems = sessions.map((s) => ({
    id: s.id,
    name: s.business_name,
    href: s.status === "complete" ? "/dashboard/reports" : `/audit/${s.id}`,
  }));

  // Build notifications from sessions
  const notifications = sessions.slice(0, 5).map((s: any) => ({
    id: s.id,
    label: s.business_name,
    meta: `${s.status === "complete" ? "Audit completed" : s.status === "in_progress" ? "Audit in progress" : "Audit started"} · ${new Date(s.started_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
    type: "audit" as const,
  }));

  return (
    <div className="p-8 max-w-[1500px] mx-auto min-h-screen font-sans">
      <DashboardHeader
        firstName={firstName}
        email={email}
        searchItems={searchItems}
        notifications={notifications}
      />

      {!hasAudit ? (
        /* No audit yet — onboarding prompt */
        <div className="bg-card shadow-card rounded-[32px] p-16 text-center border border-border mt-10 animate-fade-in hover-glow transition-smooth">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/20">
            <Target className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-foreground text-3xl font-medium mb-4 tracking-tight">Run your first audit</h2>
          <p className="text-muted-foreground text-base mb-10 max-w-lg mx-auto">
            Answer 15 questions about your business and get an AI-powered report identifying automation gaps and real ROI opportunities.
          </p>
          <Link
            href="/audit/new"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full transition-smooth shadow-glow hover:scale-105 text-lg"
          >
            <Zap className="w-5 h-5" />
            Start My Audit — It&apos;s Free
          </Link>
        </div>
      ) : (
        <>
          {/* Hero section */}
          <div className="mb-10 animate-fade-in">
            <h1 className="text-foreground text-[56px] leading-[1.1] font-medium tracking-tight mb-8">
              Business<br />Overview
            </h1>

            {/* Pill Tabs */}
            <div className="flex space-x-3 overflow-x-auto pb-4 scrollbar-hide">
              <button className="px-6 py-2.5 rounded-full bg-foreground text-background font-medium text-[15px] whitespace-nowrap transition-transform hover:scale-105 active:scale-95 shadow-sm">
                Dashboard
              </button>
              {TABS.map((tab) => (
                <button key={tab} className="px-6 py-2.5 rounded-full bg-secondary text-muted-foreground hover:bg-foreground hover:text-background font-medium text-[15px] whitespace-nowrap transition-smooth">
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Top Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">

            {/* Primary Color Card - Maturity Score */}
            <div className="bg-primary rounded-[32px] p-7 text-primary-foreground flex flex-col justify-between relative min-h-[190px] shadow-glow hover-lift animate-slide-up" style={{ animationDelay: '50ms' }}>
              <p className="font-medium text-[15px]">Maturity Score</p>
              <div className="absolute top-6 right-6 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm cursor-pointer hover:scale-105 transition-smooth">
                <ArrowUpRight className="w-5 h-5 text-white" />
              </div>
              <div className="mt-8">
                <p className="text-primary-foreground/80 font-semibold text-xs tracking-wide mb-1 flex items-center gap-1">
                  <span className="text-[14px]">{score !== null && score >= 70 ? "Great shape" : "Needs attention"}</span>
                </p>
                <h3 className="text-6xl font-medium tracking-tight whitespace-nowrap leading-none">{score !== null ? score : "—"}</h3>
              </div>
            </div>

            {/* Secondary Card - Pending Audits */}
            <div className="bg-secondary rounded-[32px] p-7 text-foreground flex flex-col justify-between relative min-h-[190px] shadow-sm hover-lift animate-slide-up" style={{ animationDelay: '100ms' }}>
              <p className="font-medium text-[15px]">Gaps Found</p>
              <div className="absolute top-6 right-6 w-12 h-12 bg-background rounded-full flex items-center justify-center shadow-sm cursor-pointer hover:scale-105 transition-smooth border border-border">
                <ArrowUpRight className="w-5 h-5 text-foreground" />
              </div>
              <div className="mt-8">
                <p className="text-primary font-semibold text-xs tracking-wide mb-1 flex items-center gap-1">
                  {resolvedItems > 0 ? `${resolvedItems} resolved` : "Start implementing"}
                </p>
                <h3 className="text-6xl font-medium tracking-tight whitespace-nowrap leading-none">{gaps.length}</h3>
              </div>
            </div>

            {/* Card Component - Details */}
            <div className="bg-card rounded-[32px] p-7 text-foreground flex flex-col justify-between relative min-h-[190px] lg:col-span-1 md:col-span-2 shadow-card hover-lift border border-border animate-slide-up" style={{ animationDelay: '150ms' }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center bg-secondary">
                  <Clock className="w-5 h-5 text-foreground" />
                </div>
                <p className="font-medium text-[16px] leading-snug">Time &<br />Efficiency</p>
                <div className="ml-auto w-12 h-12 bg-background border border-border rounded-full flex items-center justify-center shadow-sm cursor-pointer hover:scale-105 transition-smooth">
                  <ArrowUpRight className="w-5 h-5 text-foreground" />
                </div>
              </div>

              <div className="flex items-end justify-between mt-auto">
                <div>
                  <p className="text-muted-foreground text-[12px] mb-1">Time Saved Weekly</p>
                  <h3 className="text-4xl font-medium tracking-tight">{totalTimeSaved > 0 ? totalTimeSaved : 0}<span className="text-xl opacity-50 ml-1">hrs</span></h3>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground text-[12px] mb-1">Items Run</p>
                  <h3 className="text-3xl font-medium tracking-tight text-muted-foreground">{resolvedItems}</h3>
                </div>
              </div>

              {/* Progress bar line */}
              <div className="w-full h-1 bg-secondary rounded-full mt-5 overflow-hidden flex border border-border/50">
                <div className="h-full bg-primary rounded-l-full" style={{ width: `${Math.min(100, Math.max(5, (resolvedItems / (gaps.length || 1)) * 100))}%` }}></div>
              </div>
            </div>

          </div>

          {/* Lower Section */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">

            {/* Score by function */}
            <div className="xl:col-span-4 bg-card shadow-card rounded-[32px] p-7 text-foreground border border-border hover-glow transition-smooth animate-slide-up" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center justify-between mb-8 z-10 relative">
                <h2 className="text-[18px] font-medium tracking-tight">Scores By Function</h2>
                <div className="w-10 h-10 bg-secondary border border-border rounded-full flex items-center justify-center shadow-sm cursor-pointer hover:scale-105 transition-smooth">
                  <ArrowUpRight className="w-[18px] h-[18px] text-foreground" />
                </div>
              </div>

              {Object.keys(functionScores).length === 0 ? (
                <p className="text-muted-foreground text-sm">No function scores yet.</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(functionScores).map(([key, val]) => (
                    <ScoreBar
                      key={key}
                      label={FUNCTION_LABELS[key] ?? key}
                      score={val as number}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Recommendations table */}
            <div className="xl:col-span-8 bg-card shadow-card rounded-[32px] p-7 text-foreground border border-border overflow-hidden flex flex-col hover-glow transition-smooth animate-slide-up" style={{ animationDelay: '250ms' }}>
              <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                <div className="flex items-center gap-4 mr-auto">
                  <div className="w-12 h-12 rounded-full border border-border bg-secondary flex items-center justify-center">
                    <ListFilter className="w-5 h-5 text-foreground" />
                  </div>
                  <h2 className="text-[18px] tracking-tight font-medium">Recent Recommendations</h2>
                </div>
              </div>

              {implItems.length === 0 ? (
                <div className="p-8 text-center border-t border-border/50 flex-1 flex flex-col items-center justify-center">
                  <p className="text-muted-foreground text-sm">Complete an audit to get personalised recommendations.</p>
                </div>
              ) : (
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left text-[14px] whitespace-nowrap border-spacing-y-4 border-separate">
                    <thead>
                      <tr className="text-muted-foreground text-[12px]">
                        <th className="px-2 pb-2 font-medium">Recommendation</th>
                        <th className="px-2 pb-2 font-medium">Priority</th>
                        <th className="px-2 pb-2 font-medium text-right">Time Saved</th>
                        <th className="px-2 pb-2 font-medium text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-foreground">
                      {implItems.slice(0, 7).map((item) => (
                        <tr key={item.id} className="group transition-smooth hover:bg-secondary/50 rounded-lg">
                          <td className="px-2 py-3 rounded-l-lg">
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-[12px] font-bold text-foreground border border-border">
                                {item.gap_name.charAt(0)}
                              </span>
                              <span className="font-medium text-foreground truncate max-w-[200px]">{item.gap_name}</span>
                            </div>
                          </td>
                          <td className="px-2 py-3">
                            <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${item.priority === "quick_win" ? "bg-primary/10 text-primary" :
                              item.priority === "medium" ? "bg-amber-500/10 text-amber-500" :
                                "bg-secondary text-muted-foreground"
                              }`}>
                              {PRIORITY_LABELS[item.priority] ?? item.priority}
                            </span>
                          </td>
                          <td className="px-2 py-3 text-right font-medium">
                            {item.time_saved_hrs ? `${item.time_saved_hrs}h` : "—"}
                          </td>
                          <td className="px-2 py-3 text-right rounded-r-lg">
                            {item.status === "done" ? (
                              <span className="flex items-center justify-end gap-1.5 text-primary text-[12px] font-semibold">
                                <CheckCircle2 className="w-4 h-4" /> Done
                              </span>
                            ) : item.status === "in_progress" ? (
                              <span className="flex items-center justify-end gap-1.5 text-amber-500 text-[12px] font-semibold">
                                <Clock className="w-4 h-4 ml-auto" /> Working
                              </span>
                            ) : (
                              <span className="flex items-center justify-end gap-1.5 text-muted-foreground text-[12px] font-semibold">
                                <Circle className="w-4 h-4 ml-auto" /> Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
