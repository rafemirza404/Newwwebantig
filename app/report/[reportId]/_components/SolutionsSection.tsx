import Link from "next/link";
import { Lock, Zap, Clock, TrendingUp } from "lucide-react";
import type { Solution } from "../page";

const TYPE_CONFIG: Record<string, {
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}> = {
  quick_win: {
    label: "Quick Win",
    icon: <Zap className="w-3.5 h-3.5" />,
    color: "text-[#4ADE80]",
    bg: "bg-[#4ADE80]/10",
  },
  medium: {
    label: "Medium Term",
    icon: <Clock className="w-3.5 h-3.5" />,
    color: "text-[#F59E0B]",
    bg: "bg-[#F59E0B]/10",
  },
  strategic: {
    label: "Strategic",
    icon: <TrendingUp className="w-3.5 h-3.5" />,
    color: "text-[#7C6EF8]",
    bg: "bg-[#7C6EF8]/10",
  },
};

interface SolutionsSectionProps {
  solutions: Solution[];
  isPro: boolean;
}

export default function SolutionsSection({ solutions, isPro }: SolutionsSectionProps) {
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
            return (
              <div
                key={i}
                className="flex items-center gap-5 px-6 py-5 hover:bg-secondary/20 transition-colors"
              >
                {/* Step number */}
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] flex-shrink-0">
                  {i + 1}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-foreground text-[17px] font-medium tracking-tight">{solution.name}</p>
                </div>

                {/* Time saved */}
                {solution.hrs && (
                  <span className="inline-flex flex-shrink-0 items-center justify-center bg-secondary text-foreground text-[14px] font-medium px-3 py-1.5 rounded-xl border border-border/40">
                    ~{solution.hrs}h saved
                  </span>
                )}

                {/* Type badge */}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md flex-shrink-0 border shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]`} style={{ backgroundColor: `${TYPE_CONFIG[solution.type]?.color.replace('text-[', '').replace(']', '')}15` || '#2dd48a15', borderColor: `${TYPE_CONFIG[solution.type]?.color.replace('text-[', '').replace(']', '')}30` || '#2dd48a30', color: TYPE_CONFIG[solution.type]?.color.replace('text-[', '').replace(']', '') || '#2DD48A' }}>
                  {config.icon}
                  <span className="text-[12px] font-medium leading-none">{config.label}</span>
                </div>
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
            <Link
              href="/dashboard/billing"
              className="text-primary text-[15px] hover:underline font-medium"
            >
              Unlock with Pro →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
