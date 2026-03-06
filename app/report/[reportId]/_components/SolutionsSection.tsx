"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, Zap, Clock, TrendingUp } from "lucide-react";
import type { Solution } from "../page";

const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; colorHex: string }> = {
  quick_win: { label: "Quick Win", icon: <Zap className="w-3.5 h-3.5" />, colorHex: "#4ADE80" },
  medium: { label: "Medium Term", icon: <Clock className="w-3.5 h-3.5" />, colorHex: "#F59E0B" },
  strategic: { label: "Strategic", icon: <TrendingUp className="w-3.5 h-3.5" />, colorHex: "#7C6EF8" },
};

interface SolutionsSectionProps {
  solutions: Solution[];
  isPro: boolean;
}

export default function SolutionsSection({ solutions, isPro }: SolutionsSectionProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const visibleSolutions = isPro ? solutions : solutions.filter((s) => !s.locked);
  const lockedCount = solutions.filter((s) => s.locked).length;

  return (
    <section>
      <h2 className="text-foreground font-medium text-[24px] mb-6 tracking-tight">
        AI Solutions & Implementation Steps
      </h2>

      <div className="bg-card shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-border/40 rounded-3xl overflow-hidden p-2">
        {visibleSolutions.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-muted-foreground text-[15px]">No solutions available.</p>
          </div>
        )}

        <div className="divide-y divide-border/10">
          {visibleSolutions.map((solution, i) => {
            const config = TYPE_CONFIG[solution.type] ?? TYPE_CONFIG.quick_win;
            const isExpanded = expandedIndex === i;
            const roi = solution.roi;

            return (
              <div key={i} className="border-b border-border/10 last:border-0">
                {/* Header row — clickable */}
                <button
                  onClick={() => setExpandedIndex(isExpanded ? null : i)}
                  className="w-full text-left flex items-center gap-5 px-6 py-5 hover:bg-secondary/20 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] flex-shrink-0 text-[13px]">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-[16px] font-medium tracking-tight">{solution.name}</p>
                    {solution.solution_description && (
                      <p className="text-muted-foreground text-[13px] mt-0.5 line-clamp-1">{solution.solution_description}</p>
                    )}
                  </div>

                  {/* Per-solution ROI teaser */}
                  {roi && (
                    <div className="text-right flex-shrink-0 hidden md:block">
                      <p className="text-[#4ADE80] font-semibold text-[14px]">
                        ${Math.round(roi.cost_saved_per_year).toLocaleString()}/yr
                      </p>
                      <p className="text-muted-foreground text-[11px]">{roi.hours_saved_per_week}h saved/wk</p>
                    </div>
                  )}

                  {/* Complexity badge */}
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md flex-shrink-0 border text-[12px] font-medium"
                    style={{
                      backgroundColor: `${config.colorHex}15`,
                      borderColor: `${config.colorHex}30`,
                      color: config.colorHex,
                    }}
                  >
                    {config.icon}
                    <span>{config.label}</span>
                  </div>

                  {/* Chevron */}
                  <svg
                    className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Expanded panel */}
                {isExpanded && (
                  <div className="px-6 pb-6 space-y-4 border-t border-border/10">
                    {/* How it works */}
                    {solution.how_it_works && (
                      <div className="mt-4">
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          How It Works
                        </p>
                        <p className="text-foreground text-[14px] leading-relaxed whitespace-pre-line">
                          {solution.how_it_works}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Tools */}
                      {((solution.primary_tools && solution.primary_tools.length > 0) || solution.why_these_tools) && (
                        <div className="bg-secondary/30 rounded-xl p-4">
                          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Tools Required
                          </p>
                          {solution.primary_tools && solution.primary_tools.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {solution.primary_tools.map((t) => (
                                <span key={t} className="text-[12px] px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 font-medium">
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                          {solution.new_tools_required && solution.new_tools_required.length > 0 && (
                            <>
                              <p className="text-[11px] text-muted-foreground mb-1">New tools needed:</p>
                              <div className="flex flex-wrap gap-1.5">
                                {solution.new_tools_required.map((t) => (
                                  <span key={t} className="text-[12px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20 font-medium">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </>
                          )}
                          {solution.why_these_tools && (
                            <p className="text-muted-foreground text-[13px] mt-2 leading-relaxed">{solution.why_these_tools}</p>
                          )}
                        </div>
                      )}

                      {/* ROI breakdown */}
                      {roi && (
                        <div className="bg-secondary/30 rounded-xl p-4">
                          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            ROI Breakdown
                          </p>
                          <div className="space-y-2">
                            <div className="flex justify-between text-[13px]">
                              <span className="text-muted-foreground">Hours saved / week</span>
                              <span className="text-foreground font-medium">{roi.hours_saved_per_week}h</span>
                            </div>
                            <div className="flex justify-between text-[13px]">
                              <span className="text-muted-foreground">Annual savings</span>
                              <span className="text-[#4ADE80] font-semibold">${Math.round(roi.cost_saved_per_year).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-[13px]">
                              <span className="text-muted-foreground">Breakeven</span>
                              <span className="text-foreground font-medium">{roi.breakeven_weeks} weeks</span>
                            </div>
                          </div>
                          {roi.additional_roi_notes && (
                            <p className="text-muted-foreground text-[12px] mt-2 leading-relaxed border-t border-border/20 pt-2">
                              {roi.additional_roi_notes}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Who implements */}
                    {solution.who_implements_this && (
                      <p className="text-[13px] text-muted-foreground">
                        <span className="font-medium text-foreground">Implemented by: </span>
                        {solution.who_implements_this}
                      </p>
                    )}

                    {/* Case study callout */}
                    {solution.reference_case_study && (
                      <div className="bg-primary/5 border border-primary/15 rounded-xl p-4">
                        <p className="text-[11px] font-semibold text-primary uppercase tracking-wider mb-2">
                          Reference Case Study · {solution.reference_case_study.industry}
                        </p>
                        <p className="text-foreground font-medium text-[14px] mb-2">
                          {solution.reference_case_study.title}
                        </p>
                        <p className="text-muted-foreground text-[13px] leading-relaxed mb-1.5">
                          <span className="font-medium text-foreground">Problem: </span>
                          {solution.reference_case_study.problem}
                        </p>
                        <p className="text-muted-foreground text-[13px] leading-relaxed mb-1.5">
                          <span className="font-medium text-foreground">Solution: </span>
                          {solution.reference_case_study.solution}
                        </p>
                        <p className="text-[#4ADE80] text-[13px] font-medium">
                          Result: {solution.reference_case_study.result}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Locked solutions teaser */}
        {!isPro && lockedCount > 0 && (
          <div className="border-t border-border/10 bg-secondary/10 px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-muted-foreground" />
              <span className="text-muted-foreground text-[15px] font-medium">
                {lockedCount} more AI solutions locked
              </span>
            </div>
            <Link href="/dashboard/billing" className="text-primary text-[15px] hover:underline font-medium">
              Unlock with Pro →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
