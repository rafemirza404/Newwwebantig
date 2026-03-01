import { Zap, Clock, TrendingUp, Lock } from "lucide-react";
import Link from "next/link";

interface RoadmapItem {
  solution_name: string;
  gap_name: string;
  estimated_setup_hours: number;
}

interface Roadmap {
  intro: string;
  quick_wins: RoadmapItem[];
  medium_term: RoadmapItem[];
  strategic: RoadmapItem[];
  closing: string;
}

interface RoadmapSectionProps {
  roadmap: Roadmap;
  isPro: boolean;
}

const PHASES = [
  {
    key: "quick_wins" as const,
    label: "Quick Wins",
    sublabel: "Week 1",
    icon: <Zap className="w-4 h-4" />,
    color: "#4ADE80",
    bg: "bg-[#4ADE80]/10",
    border: "border-[#4ADE80]/20",
  },
  {
    key: "medium_term" as const,
    label: "Medium Term",
    sublabel: "Month 1",
    icon: <Clock className="w-4 h-4" />,
    color: "#F59E0B",
    bg: "bg-[#F59E0B]/10",
    border: "border-[#F59E0B]/20",
  },
  {
    key: "strategic" as const,
    label: "Strategic",
    sublabel: "Month 1–3",
    icon: <TrendingUp className="w-4 h-4" />,
    color: "#7C6EF8",
    bg: "bg-[#7C6EF8]/10",
    border: "border-[#7C6EF8]/20",
  },
];

export default function RoadmapSection({ roadmap, isPro }: RoadmapSectionProps) {
  if (!roadmap) return null;

  if (!isPro) {
    return (
      <section>
        <h2 className="text-foreground font-medium text-[24px] mb-6 tracking-tight">90-Day Implementation Roadmap</h2>
        <div className="bg-card border-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl p-8 relative overflow-hidden">
          <div className="blur-md opacity-40 pointer-events-none select-none grid grid-cols-1 md:grid-cols-3 gap-4">
            {PHASES.map((p) => (
              <div key={p.key} className="rounded-xl p-4 bg-secondary/30">
                <p className="text-sm font-semibold mb-3">{p.label}</p>
                <div className="space-y-2">
                  {[1,2].map(i => <div key={i} className="h-4 bg-muted/30 rounded w-full" />)}
                </div>
              </div>
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-2xl">
            <div className="text-center bg-card/90 border border-border/50 px-8 py-6 rounded-2xl shadow-lg">
              <Lock className="w-8 h-8 text-amber-500 mx-auto mb-3" />
              <p className="text-foreground font-medium mb-1">Roadmap locked</p>
              <p className="text-muted-foreground text-sm mb-4">Upgrade to see your full implementation plan</p>
              <Link href="/dashboard/billing" className="inline-flex items-center px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-full transition-all">
                Unlock with Pro →
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-foreground font-medium text-[24px] mb-2 tracking-tight">90-Day Implementation Roadmap</h2>
      <p className="text-muted-foreground text-[15px] mb-6">{roadmap.intro}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {PHASES.map((phase) => {
          const items = roadmap[phase.key] ?? [];
          return (
            <div key={phase.key} className={`bg-card shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl overflow-hidden`}>
              <div className={`px-5 py-4 border-b ${phase.border} ${phase.bg} flex items-center gap-3`}>
                <span style={{ color: phase.color }}>{phase.icon}</span>
                <div>
                  <p className="text-foreground font-medium text-[14px]">{phase.label}</p>
                  <p className="text-muted-foreground text-[11px]">{phase.sublabel}</p>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {items.length === 0 ? (
                  <p className="text-muted-foreground text-[13px]">No items in this phase</p>
                ) : items.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5" style={{ backgroundColor: `${phase.color}20`, color: phase.color }}>
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-foreground text-[13px] font-medium leading-snug">{item.solution_name}</p>
                      <p className="text-muted-foreground text-[11px] mt-0.5">{item.estimated_setup_hours}h setup</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {roadmap.closing && (
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6">
          <p className="text-foreground text-[15px] leading-relaxed">{roadmap.closing}</p>
        </div>
      )}
    </section>
  );
}
