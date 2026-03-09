"use client";

import Link from "next/link";
import { useScrollReveal } from "~/hooks/useScrollReveal";
import {
  ArrowRight,
  Building2,
  Users,
  TrendingUp,
  Briefcase,
} from "lucide-react";

// Mockup for Business
function BusinessMockup() {
  return (
    <div className="relative w-full h-[240px] bg-[#050505] overflow-hidden border-b border-white/[0.05]">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl opacity-70 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="absolute inset-0 p-8 flex flex-col justify-center relative z-10">
        <div className="flex justify-between items-end mb-6 border-b border-white/[0.08] pb-4">
          <div>
            <div className="text-[11px] text-white/40 uppercase tracking-widest font-semibold mb-2">
              Projected Annual Savings
            </div>
            <div className="text-4xl font-light text-white flex items-baseline gap-1">
              $42,500
              <span className="text-sm font-normal text-white/30">/yr</span>
            </div>
          </div>
          <div className="px-2.5 py-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold tracking-wide flex items-center gap-1.5 shadow-lg shadow-emerald-500/10">
            <TrendingUp className="w-3.5 h-3.5" /> +312% ROI
          </div>
        </div>

        <div className="space-y-3">
          {[
            {
              label: "Data Entry Workload",
              before: "40 hrs",
              after: "2 hrs",
              color: "text-emerald-400",
              bg: "bg-emerald-500/10",
            },
            {
              label: "Lead Response Time",
              before: "24 hrs",
              after: "5 min",
              color: "text-emerald-400",
              bg: "bg-emerald-400/10",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-sm py-1.5 px-3 -mx-3 rounded-lg hover:bg-white/[0.02] transition-colors"
            >
              <span className="text-white/60 font-medium">{item.label}</span>
              <div className="flex items-center gap-3">
                <span className="text-white/30 line-through text-xs">
                  {item.before}
                </span>
                <ArrowRight className="w-3 h-3 text-white/20" />
                <span
                  className={`px-2 py-0.5 rounded text-xs font-mono font-medium ${item.color} ${item.bg}`}
                >
                  {item.after}
                </span>
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

// Mockup for Agencies
function AgencyMockup() {
  return (
    <div className="relative w-full h-[240px] bg-[#050505] overflow-hidden border-b border-white/[0.05]">
      {/* Background glow */}
      <div className="absolute bottom-0 right-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="absolute inset-x-0 bottom-0 p-6 flex justify-center items-end h-full perspective-[1200px] relative z-10">
        {/* Client Cards Stacking */}
        <div className="relative w-full max-w-[320px] h-[160px] flex justify-center mt-10">
          {/* Card 3 (Back) */}
          <div className="absolute bottom-10 w-[80%] h-[100px] bg-white/[0.02] border border-white/[0.04] rounded-xl transform scale-90 opacity-40 blur-[2px] transition-transform duration-500 group-hover:translate-y-[-10px]" />

          {/* Card 2 (Middle) */}
          <div className="absolute bottom-4 w-[90%] h-[110px] bg-[#080808] border border-white/[0.06] rounded-xl transform scale-95 opacity-80 blur-[0.5px] p-4 transition-transform duration-500 group-hover:translate-y-[-5px]">
            <div className="w-1/3 h-2 bg-white/10 rounded mb-3" />
            <div className="w-1/2 h-2 bg-white/5 rounded" />
          </div>

          {/* Card 1 (Front) */}
          <div className="absolute bottom-0 w-full h-[120px] bg-[#0c0c0c] border border-white/[0.1] shadow-[0_10px_40px_rgba(0,0,0,0.8)] rounded-xl p-5 flex flex-col justify-between group-hover:border-blue-500/30 group-hover:shadow-[0_10px_40px_rgba(59,130,246,0.15)] transition-all duration-500">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/10">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[13px] font-medium text-white/95">
                    Acme Corp Audit
                  </div>
                  <div className="text-[10px] text-white/40 mt-0.5">
                    Report finalized • 2m ago
                  </div>
                </div>
              </div>
              <div className="px-2 py-1 rounded bg-white/5 text-white/70 text-[9px] font-bold tracking-wider border border-white/[0.05] uppercase">
                Ready
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 px-3 py-2 rounded-lg bg-blue-500/[0.03] border border-blue-500/[0.05] group-hover:bg-blue-500/10 group-hover:border-blue-500/20 transition-colors">
              <span className="text-[11px] text-blue-400 font-medium tracking-wide">
                Generate Presentation PDF
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-400/50 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </div>
      </div>

      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/30 to-transparent pointer-events-none" />
    </div>
  );
}

export default function AudienceSection() {
  const ref = useScrollReveal();

  return (
    <section className="m-section relative overflow-hidden">
      <div
        ref={ref}
        className="m-container relative z-10 w-full max-w-[1280px] mx-auto"
      >
        <div className="text-center mb-16 flex flex-col items-center">
          <div className="m-reveal mb-8 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/[0.03] shadow-[0_0_15px_rgba(59,130,246,0.1)]">
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-blue-400">
              WHO IT'S FOR
            </span>
          </div>

          <h2
            className="m-reveal m-reveal-delay-1 text-[32px] md:text-[42px] leading-[1.15] font-normal tracking-[-0.03em] text-center mb-5 max-w-2xl mx-auto text-transparent bg-clip-text"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.6) 0%, white 35%, white 65%, rgba(255,255,255,0.5) 100%)",
            }}
          >
            Built for
            <br className="hidden sm:block" />
            Two Audiences
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Business Owners Card */}
          <div className="m-reveal m-reveal-delay-1 group flex flex-col relative rounded-2xl border border-white/[0.08] bg-[#0a0a0a] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-500 hover:border-white/[0.15] hover:shadow-[0_8px_40px_rgba(255,255,255,0.05)]">
            <BusinessMockup />
            <div className="p-8 lg:p-10 relative z-10 flex flex-col flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-medium text-white group-hover:text-amber-50/[0.95] transition-colors">
                  For Business Owners
                </h3>
              </div>
              <p className="text-[15px] text-white/50 leading-relaxed font-light mb-8 flex-1">
                Run your own AI operations audit. Discover where you&apos;re
                leaving money on the table with manual processes, and get a
                clear roadmap to automate intelligently.
              </p>
              <Link
                href="/solutions/business"
                className="inline-flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white transition-colors no-underline group/link bg-white/5 hover:bg-white/10 py-2.5 px-4 rounded-lg w-fit border border-white/[0.05] hover:border-white/[0.1]"
              >
                Explore Business Solutions
                <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1 text-white/40 group-hover/link:text-white/80" />
              </Link>
            </div>
            {/* Inner hover border */}
            <div className="absolute inset-0 rounded-2xl border border-white/0 group-hover:border-white/[0.05] transition-colors pointer-events-none" />
          </div>

          {/* Agencies Card */}
          <div className="m-reveal m-reveal-delay-2 group flex flex-col relative rounded-2xl border border-white/[0.08] bg-[#0a0a0a] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-500 hover:border-white/[0.15] hover:shadow-[0_8px_40px_rgba(255,255,255,0.05)]">
            <AgencyMockup />
            <div className="p-8 lg:p-10 relative z-10 flex flex-col flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-medium text-white group-hover:text-amber-50/[0.95] transition-colors">
                  For Agencies
                </h3>
              </div>
              <p className="text-[15px] text-white/50 leading-relaxed font-light mb-8 flex-1">
                Audit your clients&apos; operations at scale. Generate branded
                reports in minutes. Prove ROI. Add AI consulting to your service
                stack without hiring analysts.
              </p>
              <Link
                href="/solutions/agencies"
                className="inline-flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white transition-colors no-underline group/link bg-white/5 hover:bg-white/10 py-2.5 px-4 rounded-lg w-fit border border-white/[0.05] hover:border-white/[0.1]"
              >
                Explore Agency Partners
                <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1 text-white/40 group-hover/link:text-white/80" />
              </Link>
            </div>
            {/* Inner hover border */}
            <div className="absolute inset-0 rounded-2xl border border-white/0 group-hover:border-white/[0.05] transition-colors pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
}
