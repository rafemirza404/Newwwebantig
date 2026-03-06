"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, AlertTriangle, AlertCircle, Info } from "lucide-react";
import type { Gap } from "../page";

const SEVERITY_STYLES: Record<string, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
  high: {
    bg: "bg-[#F87171]/5",
    border: "border-[#F87171]/30",
    text: "text-[#F87171]",
    icon: <AlertTriangle className="w-4 h-4" />,
  },
  medium: {
    bg: "bg-[#F59E0B]/5",
    border: "border-[#F59E0B]/30",
    text: "text-[#F59E0B]",
    icon: <AlertCircle className="w-4 h-4" />,
  },
  low: {
    bg: "bg-[#60A5FA]/5",
    border: "border-[#60A5FA]/30",
    text: "text-[#60A5FA]",
    icon: <Info className="w-4 h-4" />,
  },
};

const SEVERITY_LABEL: Record<string, string> = {
  high: "High Priority",
  medium: "Medium Priority",
  low: "Low Priority",
};

const POTENTIAL_CONFIG = {
  high: { label: "High automation potential", color: "#4ADE80" },
  medium: { label: "Medium potential", color: "#F59E0B" },
  low: { label: "Low potential", color: "#94A3B8" },
};

interface GapsSectionProps {
  gaps: Gap[];
  teaserGap: Gap | null;
  isPro: boolean;
  narrative?: string | null;
}

export default function GapsSection({ gaps, teaserGap, isPro, narrative }: GapsSectionProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <section>
      <h2 className="text-foreground font-medium text-[24px] mb-6 tracking-tight">
        AI Opportunity Gaps
        {!isPro && (
          <span className="ml-3 text-[14px] text-muted-foreground font-medium tracking-tight">
            (showing {gaps.length} of all gaps)
          </span>
        )}
      </h2>

      {/* Gap analysis narrative */}
      {narrative && (
        <div className="bg-secondary/30 rounded-2xl p-5 mb-6">
          <p className="text-foreground text-[15px] leading-relaxed">{narrative}</p>
        </div>
      )}

      <div className="space-y-4">
        {gaps.map((gap, i) => {
          const style = SEVERITY_STYLES[gap.severity] ?? SEVERITY_STYLES.medium;
          const isExpanded = expandedIndex === i;
          const annualHours = gap.time_cost_per_week_hours
            ? Math.round(gap.time_cost_per_week_hours * 52)
            : null;
          const potentialCfg = gap.automation_potential
            ? POTENTIAL_CONFIG[gap.automation_potential]
            : null;

          return (
            <div
              key={i}
              className={`bg-card shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] border-l-4 rounded-2xl overflow-hidden ${style.border} transition-all`}
            >
              {/* Header — clickable */}
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : i)}
                className="w-full text-left px-6 py-5 flex items-start gap-4 hover:bg-secondary/20 transition-colors"
              >
                <span className={`p-2 rounded-xl bg-background shadow-sm border border-border/50 ${style.text} flex-shrink-0 mt-0.5`}>
                  {style.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    {gap.priority_rank && (
                      <span className="text-[11px] font-bold text-muted-foreground w-5 h-5 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                        {gap.priority_rank}
                      </span>
                    )}
                    <h3 className="text-foreground font-medium text-[17px] tracking-tight">{gap.name}</h3>
                    <span className={`text-[12px] font-medium px-2.5 py-0.5 rounded-md ${style.bg} ${style.text}`}>
                      {SEVERITY_LABEL[gap.severity]}
                    </span>
                    {potentialCfg && (
                      <span
                        className="text-[11px] font-medium px-2 py-0.5 rounded-md"
                        style={{
                          backgroundColor: `${potentialCfg.color}18`,
                          color: potentialCfg.color,
                        }}
                      >
                        {potentialCfg.label}
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-[14px] leading-relaxed line-clamp-2">{gap.description}</p>
                </div>

                {/* Annual cost teaser + chevron */}
                <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                  {gap.estimated_annual_cost !== undefined && (
                    <div className="text-right">
                      <p className="text-[#F87171] font-semibold text-[15px]">
                        ${gap.estimated_annual_cost.toLocaleString()}
                      </p>
                      <p className="text-muted-foreground text-[11px]">/ year</p>
                    </div>
                  )}
                  <svg
                    className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Expanded detail panel */}
              {isExpanded && (
                <div className="px-6 pb-6 border-t border-border/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {gap.why_this_matters && (
                      <div className="bg-secondary/30 rounded-xl p-4">
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                          Why This Matters
                        </p>
                        <p className="text-foreground text-[14px] leading-relaxed">{gap.why_this_matters}</p>
                      </div>
                    )}
                    {gap.affected_team_members && (
                      <div className="bg-secondary/30 rounded-xl p-4">
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                          Who&apos;s Affected
                        </p>
                        <p className="text-foreground text-[14px] leading-relaxed">{gap.affected_team_members}</p>
                      </div>
                    )}
                  </div>

                  {/* Cost of inaction */}
                  {(annualHours || gap.estimated_annual_cost || gap.time_cost_per_week_hours) && (
                    <div className="flex flex-wrap gap-3 mt-4">
                      {gap.time_cost_per_week_hours && (
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-secondary/40 border border-border/20 rounded-xl">
                          <span className="text-foreground font-bold text-[16px]">{gap.time_cost_per_week_hours}h</span>
                          <span className="text-muted-foreground text-[13px]">per week</span>
                        </div>
                      )}
                      {annualHours && (
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#F87171]/5 border border-[#F87171]/20 rounded-xl">
                          <span className="text-[#F87171] font-bold text-[16px]">{annualHours}h</span>
                          <span className="text-muted-foreground text-[13px]">lost per year</span>
                        </div>
                      )}
                      {gap.estimated_annual_cost && (
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#F87171]/5 border border-[#F87171]/20 rounded-xl">
                          <span className="text-[#F87171] font-bold text-[16px]">${gap.estimated_annual_cost.toLocaleString()}</span>
                          <span className="text-muted-foreground text-[13px]">annual cost</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Teaser gap */}
        {teaserGap && (
          <div className="border border-border/50 rounded-2xl p-6 bg-card relative overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
            <div className="blur-md opacity-40 pointer-events-none select-none">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <div>
                  <h3 className="text-foreground font-medium text-[17px] tracking-tight mb-2">{teaserGap.name}</h3>
                  <p className="text-muted-foreground text-[15px] max-w-3xl">{teaserGap.description}</p>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-[2px]">
              <div className="text-center bg-card/90 border border-border/50 px-6 py-4 rounded-2xl shadow-lg flex flex-col items-center">
                <Lock className="w-6 h-6 text-amber-500 mb-3" />
                <p className="text-foreground text-[14px] font-medium tracking-tight">+{1} more gap hidden</p>
              </div>
            </div>
          </div>
        )}

        {/* Upgrade CTA */}
        {!isPro && (
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-10 text-center relative overflow-hidden mt-8">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50 pointer-events-none" />
            <Lock className="w-10 h-10 text-primary mx-auto mb-5 drop-shadow-sm" />
            <h3 className="text-foreground text-[28px] font-medium mb-3 tracking-tight relative z-10">Unlock Your Full Gap Analysis</h3>
            <p className="text-muted-foreground text-[15px] mb-8 max-w-lg mx-auto relative z-10">
              Get all identified gaps, AI-powered solutions, process diagrams, and a 90-day implementation roadmap.
            </p>
            <Link
              href="/dashboard/billing"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground text-[15px] font-medium rounded-full shadow-sm transition-all hover:scale-[1.02] relative z-10"
            >
              Upgrade to Pro — $29/mo →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
