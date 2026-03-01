import Link from "next/link";
import { Lock, Clock, TrendingUp, Zap, Info } from "lucide-react";
import type { RoiAnalysis } from "../page";

interface ROISectionProps {
  roi: RoiAnalysis;
  isPro: boolean;
}

export default function ROISection({ roi, isPro }: ROISectionProps) {
  if (!isPro) {
    return (
      <section>
        <h2 className="text-foreground font-medium text-[24px] mb-6 tracking-tight">ROI Analysis</h2>
        <div className="bg-gradient-to-br from-card to-card/50 border-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl p-8 relative overflow-hidden">
          {/* Blurred background content */}
          <div className="blur-md opacity-40 pointer-events-none select-none mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {["40h / mo", "30-50% lift", "30-60 days"].map((v, i) => (
                <div key={i} className="bg-background rounded-2xl p-8 text-center border-none shadow-sm flex flex-col items-center justify-center">
                  <div className="flex justify-center mb-5 p-3 rounded-xl bg-secondary/50 shadow-sm border border-border/50 text-foreground">
                    <TrendingUp className="w-5 h-5 opacity-40" />
                  </div>
                  <p className="text-4xl font-semibold mb-2 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-muted-foreground to-secondary-foreground">{v}</p>
                  <p className="text-muted-foreground text-[14px] font-medium">Metric Placeholder</p>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-secondary/30 border border-border/10 rounded-2xl p-6 opacity-60">
              <div className="h-4 bg-muted-foreground/20 rounded w-full mb-2"></div>
              <div className="h-4 bg-muted-foreground/20 rounded w-2/3"></div>
            </div>
          </div>

          {/* Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[3px] rounded-2xl z-10 transition-all duration-300">
            <div className="text-center bg-card/90 border border-border/50 px-10 py-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm">
              <div className="p-4 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
                <Lock className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-foreground font-medium text-[22px] tracking-tight mb-3">ROI Analysis Locked</h3>
              <p className="text-muted-foreground text-[15px] leading-relaxed mb-8 text-center">
                Upgrade to see your projected hours saved, revenue lift, and payback period.
              </p>
              <Link
                href="/dashboard/billing"
                className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground text-[15px] font-medium rounded-full shadow-sm transition-all hover:scale-[1.02] relative"
              >
                Unlock for $29/mo →
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const metrics = [
    {
      icon: <Clock className="w-5 h-5" />,
      label: "Hours Saved / Month",
      value: roi.estimated_hrs_saved_monthly ? `${roi.estimated_hrs_saved_monthly}h` : "—",
      color: "#60A5FA",
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: "Potential Revenue Lift",
      value: roi.potential_revenue_lift ?? "—",
      color: "#4ADE80",
    },
    {
      icon: <Zap className="w-5 h-5" />,
      label: "Payback Period",
      value: roi.payback_period ?? "—",
      color: "#7C6EF8",
    },
  ];

  return (
    <section>
      <h2 className="text-foreground font-medium text-[24px] mb-6 tracking-tight">ROI Analysis</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((m) => (
          <div key={m.label} className="bg-card shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] border border-border/30 rounded-3xl p-8 text-center flex flex-col items-center justify-center transition-all hover:-translate-y-1 hover:shadow-lg">
            <div className="flex justify-center mb-5 p-3 rounded-2xl bg-background shadow-sm border border-border/50" style={{ color: m.color }}>
              {m.icon}
            </div>
            <p className="text-4xl font-semibold mb-2 tracking-tight" style={{ color: m.color }}>{m.value}</p>
            <p className="text-muted-foreground text-[15px] font-medium">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-secondary/30 border border-border/10 rounded-2xl p-6">
        <p className="text-muted-foreground text-[14px] leading-relaxed flex items-start gap-4">
          <Info className="w-5 h-5 flex-shrink-0 text-primary mt-0.5" />
          <span>
            These projections are based on industry benchmarks for your specific vertical implementing AI automation at your current maturity level.
            Actual results will vary. Start with the Quick Win items above for fastest ROI.
          </span>
        </p>
      </div>
    </section>
  );
}
