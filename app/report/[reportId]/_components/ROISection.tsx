import Link from "next/link";
import { Lock, Clock, TrendingUp, Zap, DollarSign } from "lucide-react";
import type { RoiAnalysis, TotalRoiSummary } from "../page";

interface ROISectionProps {
  roi: RoiAnalysis;
  totalRoiSummary: TotalRoiSummary | null;
  isPro: boolean;
}

export default function ROISection({ roi, totalRoiSummary, isPro }: ROISectionProps) {
  if (!isPro) {
    return (
      <section>
        <h2 className="text-foreground font-medium text-[24px] mb-6 tracking-tight">ROI Analysis</h2>
        <div className="bg-gradient-to-br from-card to-card/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl p-8 relative overflow-hidden">
          <div className="blur-md opacity-40 pointer-events-none select-none mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {["40h / wk", "$120k / yr", "48h setup", "6 weeks"].map((v, i) => (
                <div key={i} className="bg-background rounded-2xl p-8 text-center shadow-sm flex flex-col items-center justify-center">
                  <TrendingUp className="w-5 h-5 opacity-40 mb-5" />
                  <p className="text-4xl font-semibold mb-2 tracking-tight text-muted-foreground">{v}</p>
                  <p className="text-muted-foreground text-[14px] font-medium">Metric</p>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[3px] rounded-2xl z-10">
            <div className="text-center bg-card/90 border border-border/50 px-10 py-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm">
              <div className="p-4 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
                <Lock className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-foreground font-medium text-[22px] tracking-tight mb-3">ROI Analysis Locked</h3>
              <p className="text-muted-foreground text-[15px] leading-relaxed mb-8 text-center">
                Upgrade to see your projected hours saved, annual savings, and payback period.
              </p>
              <Link
                href="/dashboard/billing"
                className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground text-[15px] font-medium rounded-full shadow-sm transition-all hover:scale-[1.02]"
              >
                Unlock for $29/mo →
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const hrsPerWeek = totalRoiSummary?.total_hours_saved_per_week;
  const annualSavings = totalRoiSummary?.total_cost_saved_per_year;
  const setupHours = totalRoiSummary?.total_setup_hours_required;
  const narrative = totalRoiSummary?.overall_roi_narrative ?? roi.roi_narrative;

  const metrics = [
    {
      icon: <Clock className="w-5 h-5" />,
      label: "Hours Saved / Week",
      value: hrsPerWeek ? `${hrsPerWeek}h` : roi.estimated_hrs_saved_monthly ? `${roi.estimated_hrs_saved_monthly}h/mo` : "—",
      color: "#60A5FA",
    },
    {
      icon: <DollarSign className="w-5 h-5" />,
      label: "Annual Savings",
      value: annualSavings
        ? `$${Math.round(annualSavings).toLocaleString()}`
        : roi.total_cost_saved_per_year
        ? `$${Math.round(roi.total_cost_saved_per_year).toLocaleString()}`
        : "—",
      color: "#4ADE80",
    },
    {
      icon: <Zap className="w-5 h-5" />,
      label: "Total Setup Time",
      value: setupHours ? `${setupHours}h` : "—",
      color: "#7C6EF8",
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: "Payback Period",
      value: roi.payback_period ?? "—",
      color: "#F59E0B",
    },
  ];

  return (
    <section>
      <h2 className="text-foreground font-medium text-[24px] mb-6 tracking-tight">ROI Analysis</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="bg-card shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] border border-border/30 rounded-3xl p-6 text-center flex flex-col items-center justify-center transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex justify-center mb-4 p-3 rounded-2xl bg-background shadow-sm border border-border/50" style={{ color: m.color }}>
              {m.icon}
            </div>
            <p className="text-3xl font-semibold mb-1.5 tracking-tight" style={{ color: m.color }}>{m.value}</p>
            <p className="text-muted-foreground text-[14px] font-medium">{m.label}</p>
          </div>
        ))}
      </div>

      {narrative && (
        <div className="mt-6 bg-secondary/30 border border-border/10 rounded-2xl p-6">
          <p className="text-foreground text-[15px] leading-relaxed">{narrative}</p>
        </div>
      )}
    </section>
  );
}
