import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { ComparisonData } from "../page";

interface Props {
  comparison: ComparisonData;
}

export default function ComparisonBanner({ comparison }: Props) {
  const delta = comparison.overall_score_change ?? 0;
  const isPositive = delta > 0;
  const isNeutral = delta === 0;

  const color = isPositive ? "#4ADE80" : isNeutral ? "#94A3B8" : "#F87171";
  const bgBorder = isPositive
    ? "bg-[#4ADE80]/5 border-[#4ADE80]/20"
    : isNeutral
    ? "bg-secondary/30 border-border/20"
    : "bg-[#F87171]/5 border-[#F87171]/20";
  const Icon = isPositive ? TrendingUp : isNeutral ? Minus : TrendingDown;

  const prevDate = comparison.previous_audit_date
    ? new Date(comparison.previous_audit_date).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className={`rounded-2xl border p-4 flex items-start gap-4 ${bgBorder}`}>
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}20`, color }}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-3 mb-1">
          <span className="text-foreground font-semibold text-[15px]">
            {isPositive ? "+" : ""}
            {delta} points since last audit
          </span>
          {prevDate && (
            <span className="text-muted-foreground text-[12px]">vs {prevDate}</span>
          )}
        </div>
        {comparison.comparison_narrative && (
          <p className="text-muted-foreground text-[14px] leading-relaxed">
            {comparison.comparison_narrative}
          </p>
        )}
      </div>
    </div>
  );
}
