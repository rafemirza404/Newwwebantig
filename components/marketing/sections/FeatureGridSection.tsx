"use client";

import { useScrollReveal } from "~/hooks/useScrollReveal";
import {
  Target,
  Search,
  Lightbulb,
  Activity,
  ArrowRight,
  Zap,
  CheckCircle2,
  Copy,
} from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Maturity Scoring Engine",
    description:
      "Real-time benchmarking across 8 core business functions. Track your AI adoption score against industry leaders.",
    mockup: "score",
  },
  {
    icon: Search,
    title: "Actionable Blueprints",
    description:
      "Don't just find gaps. Generate complete implementation blueprints with tool stacks, setup times, and true ROI.",
    mockup: "solutions",
  },
  {
    icon: Lightbulb,
    title: "Deep Workflow Analysis",
    description:
      "AI extracts pain points directly from team audits, automatically identifying manual bottlenecks and calculating hours wasted.",
    mockup: "insights",
  },
];

// Complex Premium Mockups

function ScoreMockup() {
  return (
    <div className="relative h-full w-full bg-[#050505] p-6 overflow-hidden group-hover:bg-[#080808] transition-colors duration-500">
      {/* Background radial glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col h-full space-y-5">
        <div className="flex items-end justify-between border-b border-white/[0.05] pb-4">
          <div>
            <div className="text-[10px] text-white/30 uppercase tracking-widest font-semibold mb-1">
              Global Score
            </div>
            <div className="text-3xl font-light text-white flex items-baseline gap-1">
              82<span className="text-sm font-normal text-white/30">/100</span>
            </div>
          </div>
          <div className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-wide flex items-center gap-1">
            <Activity className="w-3 h-3" /> +12%
          </div>
        </div>

        <div className="space-y-4 pt-2">
          {[
            {
              label: "Sales Pipeline",
              score: 82,
              color: "from-emerald-600 to-emerald-400",
              bg: "bg-emerald-500/10",
              border: "border-emerald-500/20",
              glow: "shadow-[0_0_10px_rgba(52,211,153,0.3)]",
            },
            {
              label: "Client Onboarding",
              score: 54,
              color: "from-amber-600 to-amber-400",
              bg: "bg-amber-500/10",
              border: "border-amber-500/20",
              glow: "",
            },
            {
              label: "Support Resolution",
              score: 91,
              color: "from-blue-600 to-blue-400",
              bg: "bg-blue-500/10",
              border: "border-blue-500/20",
              glow: "shadow-[0_0_10px_rgba(59,130,246,0.3)]",
            },
            {
              label: "Financial Ops",
              score: 32,
              color: "from-rose-600 to-rose-400",
              bg: "bg-rose-500/10",
              border: "border-rose-500/20",
              glow: "",
            },
          ].map((item, i) => (
            <div key={item.label} className="relative">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] text-white/60 font-medium">
                  {item.label}
                </span>
                <span className="text-[10px] text-white/40 font-mono">
                  {item.score}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden flex">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${item.color} ${item.glow} transition-all duration-1000 origin-left`}
                  style={{
                    width: `${item.score}%`,
                    transitionDelay: `${i * 150}ms`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent pointer-events-none" />
    </div>
  );
}

function SolutionsMockup() {
  return (
    <div className="relative h-full w-full bg-[#050505] p-5 overflow-hidden group-hover:bg-[#080808] transition-colors duration-500 font-mono">
      {/* Background glow */}
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col h-full space-y-3">
        {/* IDE-like header */}
        <div className="flex items-center gap-1.5 border-b border-white/[0.05] pb-3 mb-2">
          <div className="w-2 h-2 rounded-full bg-white/20" />
          <div className="w-2 h-2 rounded-full bg-white/20" />
          <div className="w-2 h-2 rounded-full bg-white/20" />
          <span className="text-[9px] text-white/30 ml-2 uppercase tracking-widest font-sans">
            Blueprint.json
          </span>
        </div>

        {/* Blueprint Card 1 */}
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 relative hover:border-blue-500/30 hover:bg-blue-500/[0.02] transition-colors cursor-default group/card">
          <div className="absolute top-3 right-3 opacity-0 group-hover/card:opacity-100 transition-opacity">
            <Copy className="w-3 h-3 text-white/30 hover:text-white/70" />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 rounded bg-blue-500/20 text-blue-400">
              <Zap className="w-3 h-3" />
            </div>
            <span className="text-[11px] text-white/80 font-sans font-medium">
              Lead Routing AI
            </span>
          </div>
          <div className="flex gap-2 mb-3">
            <span className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] text-white/40">
              Make.com
            </span>
            <span className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] text-white/40">
              OpenAI
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] border-t border-white/[0.04] pt-2">
            <span className="text-white/30">
              Setup: <span className="text-white/60">2 hrs</span>
            </span>
            <span className="text-emerald-400 font-medium">ROI: High</span>
          </div>
        </div>

        {/* Blueprint Card 2 */}
        <div className="bg-white/[0.01] border border-white/[0.03] rounded-xl p-3 relative opacity-60">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 rounded bg-white/5 text-white/40">
              <CheckCircle2 className="w-3 h-3" />
            </div>
            <span className="text-[11px] text-white/50 font-sans font-medium">
              Invoice Parser
            </span>
          </div>
          <div className="flex gap-2">
            <span className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] text-white/30">
              DocumentAI
            </span>
          </div>
        </div>
      </div>

      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent pointer-events-none" />
    </div>
  );
}

function InsightsMockup() {
  return (
    <div className="relative h-full w-full bg-[#050505] p-5 overflow-hidden group-hover:bg-[#080808] transition-colors duration-500">
      {/* Background glow */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl opacity-50" />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-5">
          <span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
            AI Extracted Context
          </span>
          <span className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded-full">
            Audit Active
          </span>
        </div>

        <div className="space-y-3 relative">
          {[
            {
              tag: "Data Entry",
              quote:
                "I spend 3 hours every Friday manually copying invoice data into our CRM.",
              wasted: "12h/mo",
              color: "text-purple-400",
              bg: "bg-purple-500/10",
              border: "border-purple-500/20",
            },
            {
              tag: "Ticket Triage",
              quote:
                "Routing support tickets to the right department takes up half my morning.",
              wasted: "20h/mo",
              color: "text-rose-400",
              bg: "bg-rose-500/10",
              border: "border-rose-500/20",
            },
          ].map((item, i) => (
            <div
              key={item.tag}
              className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-3 group-hover:border-white/[0.08] transition-colors relative z-10 backdrop-blur-sm shadow-xl"
            >
              <div className="flex items-start gap-2 mb-2 opacity-70">
                <span className="text-white/90 text-[12px] italic leading-[1.4]">
                  "{item.quote}"
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px] pt-1 border-t border-white/[0.04]">
                <div className="flex gap-1.5 mt-1.5">
                  <span
                    className={`px-1.5 py-0.5 rounded-md ${item.bg} ${item.color} ${item.border} border font-medium tracking-wide`}
                  >
                    {item.tag}
                  </span>
                </div>
                <span className="text-white/40 flex items-center gap-1 mt-1.5">
                  Waste:{" "}
                  <span className="text-white/80 font-mono">{item.wasted}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/80 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}

const mockups = [ScoreMockup, SolutionsMockup, InsightsMockup];

export default function FeatureGridSection() {
  const ref = useScrollReveal();

  return (
    <section className="m-section relative overflow-hidden">
      {/* Ambient glows like Attensira */}
      <div className="m-glow-left opacity-60" />
      <div className="m-glow-right opacity-60" />

      <div
        ref={ref}
        className="m-container relative z-10 w-full max-w-[1280px] mx-auto"
      >
        <div className="text-center mb-16 flex flex-col items-center">
          <div className="m-reveal mb-8 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/[0.03] shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-emerald-400">
              CAPABILITIES
            </span>
          </div>

          <h2
            className="m-reveal m-reveal-delay-1 text-[32px] md:text-[42px] leading-[1.15] font-normal tracking-[-0.03em] text-center mb-5 max-w-2xl mx-auto text-transparent bg-clip-text"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.6) 0%, white 35%, white 65%, rgba(255,255,255,0.5) 100%)",
            }}
          >
            Everything you need to
            <br className="hidden sm:block" />
            Optimize Operations
          </h2>
        </div>

        {/* 3-column feature cards with embedded mockups */}
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feat, i) => {
            const MockupComponent = mockups[i];
            const Icon = feat.icon;

            return (
              <div
                key={feat.title}
                className={`m-reveal m-reveal-delay-${i + 1} flex flex-col gap-6 group`}
              >
                {/* Premium Card Display Area */}
                <div className="relative h-[280px] w-full rounded-2xl border border-white/[0.08] bg-[#0a0a0a] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.6)] transition-all duration-500 group-hover:border-white/[0.15] group-hover:shadow-[0_8px_40px_rgba(255,255,255,0.05)]">
                  <MockupComponent />
                  {/* Inner glowing border on hover */}
                  <div className="absolute inset-0 rounded-2xl border border-white/0 group-hover:border-white/[0.05] transition-colors pointer-events-none" />
                </div>

                {/* Text Content Below */}
                <div className="px-2">
                  <h3 className="text-xl font-medium text-white mb-3 flex items-center group-hover:text-amber-50/[0.95] transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-[15px] text-white/50 leading-relaxed font-light">
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
