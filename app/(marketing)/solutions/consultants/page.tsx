"use client";

import Link from "next/link";
import { ArrowRight, MessageSquareCode, Workflow, Wallet, Zap, Calculator, ArrowUpRight } from "lucide-react";
import SectionBadge from "~/components/marketing/SectionBadge";
import { useScrollReveal } from "~/hooks/useScrollReveal";
import FAQSection from "~/components/marketing/sections/FAQSection";
import TestimonialsSection from "~/components/marketing/sections/TestimonialsSection";
import FinalCTASection from "~/components/marketing/sections/FinalCTASection";


export default function ConsultantSolutionsPage() {
  const ref = useScrollReveal();
  const playbookRef = useScrollReveal();


  return (
    <>
      {/* 1. The Manifesto Hero - Deep Dive Content */}
      <section className="relative pt-32 pb-32 md:pt-48 md:pb-40 overflow-hidden min-h-screen border-b border-white/[0.05]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />

        <div ref={ref} className="m-container relative z-10 flex flex-col items-center">

          <div className="text-center max-w-4xl mx-auto mb-20">
            <SectionBadge label="CONSULTANT MANIFESTO" className="m-reveal mb-8" color="purple" />

            <h1
              className="m-reveal m-reveal-delay-1 text-[36px] md:text-[46px] lg:text-[54px] font-light tracking-[-0.03em] leading-[1.07] mb-8 text-transparent bg-clip-text"
              style={{
                backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.7) 0%, white 35%, white 100%)"
              }}
            >
              Stop billing hourly.<br />Charge for outcomes.
            </h1>

            <p className="m-reveal m-reveal-delay-2 text-[18px] md:text-[20px] text-white/50 mb-12 font-normal leading-relaxed max-w-3xl mx-auto">
              If you charge per hour to research a client's business, you're being punished for efficiency. The faster you figure out their problems, the less you get paid. This is broken. AgentBlue productizes your consulting.
            </p>

            <div className="m-reveal m-reveal-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/audit"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black rounded-xl font-semibold text-[15px] hover:bg-white/90 transition-all w-full sm:w-auto"
              >
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Epic Split Screen: Before vs After */}
          <div className="m-reveal m-reveal-delay-4 w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">

            {/* BEFORE: The Hourly Consultant */}
            <div className="flex-1 bg-[#111] border border-red-500/10 rounded-2xl p-8 relative overflow-hidden group hover:border-red-500/20 transition-colors">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-3xl rounded-full" />
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/[0.05]">
                <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 font-bold border border-red-500/20">X</div>
                <div>
                  <h3 className="text-xl font-medium text-white/90">The Hourly Consultant</h3>
                  <p className="text-xs tracking-widest uppercase text-white/30 font-mono mt-1">Status: Unscalable</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="mt-1 w-6 h-6 flex items-center justify-center text-white/40"><MessageSquareCode className="w-4 h-4" /></div>
                  <div>
                    <h4 className="text-sm font-semibold text-white/80">Endless Discovery Calls</h4>
                    <p className="text-xs text-white/50 leading-relaxed max-w-[280px]">Spending 10+ unbilled hours interviewing stakeholders just to map out existing workflows.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="mt-1 w-6 h-6 flex items-center justify-center text-white/40"><Workflow className="w-4 h-4" /></div>
                  <div>
                    <h4 className="text-sm font-semibold text-white/80">Manual Process Mapping</h4>
                    <p className="text-xs text-white/50 leading-relaxed max-w-[280px]">Building complex Miro boards and flowchart diagrams purely by hand over days.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="mt-1 w-6 h-6 flex items-center justify-center text-white/40"><Wallet className="w-4 h-4" /></div>
                  <div>
                    <h4 className="text-sm font-semibold text-white/80">Scope Creep & Resistance</h4>
                    <p className="text-xs text-white/50 leading-relaxed max-w-[280px]">Clients push back on your implementation hours because they lack mathematical proof of ROI.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* AFTER: The Productized Consultant */}
            <div className="flex-1 bg-[#0A0A0A] border border-purple-500/30 rounded-2xl p-8 relative overflow-hidden shadow-[0_0_50px_rgba(167,139,250,0.1)] z-10">
              <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500/10 blur-3xl rounded-full" />
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-purple-500/[0.02] to-transparent pointer-events-none" />

              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-purple-500/20">
                <div className="w-10 h-10 bg-purple-500 flex items-center justify-center text-white font-bold rounded-xl shadow-[0_0_15px_purple]">A</div>
                <div>
                  <h3 className="text-xl font-medium text-white shadow-purple-500/50">The AgentBlue Consultant</h3>
                  <p className="text-xs tracking-widest uppercase text-purple-400 font-mono mt-1 font-bold">Status: High Leverage</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4 items-start relative z-10">
                  <div className="mt-1 w-6 h-6 flex items-center justify-center text-purple-400 bg-purple-500/10 rounded shadow-md"><Zap className="w-3 h-3" /></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-white">The $2,500 "Sprint"</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500 text-white font-bold">PAID DISCOVERY</span>
                    </div>
                    <p className="text-xs text-white/70 leading-relaxed max-w-[280px] mt-1">Sell the AgentBlue automated audit as an initial product. The software does 90% of the data gathering in a 10-minute assessment.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start relative z-10">
                  <div className="mt-1 w-6 h-6 flex items-center justify-center text-emerald-400 bg-emerald-500/10 rounded"><Calculator className="w-3 h-3" /></div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Mathematical Pipeline</h4>
                    <p className="text-xs text-white/70 leading-relaxed max-w-[280px] mt-1">The system automatically calculates precisely how much money they lose to manual labor per year, outputting concrete ROI.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start relative z-10">
                  <div className="mt-1 w-6 h-6 flex items-center justify-center text-blue-400 bg-blue-500/10 rounded"><ArrowUpRight className="w-3 h-3" /></div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Effortless Upsell</h4>
                    <p className="text-xs text-white/70 leading-relaxed max-w-[280px] mt-1">Use the step-by-step roadmap PDF to pitch a $15k implementation retainer. The client already agrees with the math.</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 2. The 3-Step Framework */}
      <section className="relative py-32 border-b border-white/[0.05] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-purple-600/5 rounded-full blur-[100px]" />
        </div>
        <div ref={playbookRef} className="m-container relative z-10">
          <div className="text-center mb-16">
            <SectionBadge label="CONSULTING FRAMEWORK" className="mb-6 flex justify-center" color="purple" />
            <h2 className="text-3xl md:text-4xl font-normal leading-[1.15] tracking-[-0.03em] text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.7) 0%, white 35%, white 100%)" }}>
              The Audit → Roadmap → Implement strategy.
            </h2>
            <p className="text-[15px] text-white/40 mt-4 max-w-xl mx-auto leading-relaxed">
              Top consultants don&apos;t sell AI. They sell certainty. This is the three-step model that closes six-figure retainers without a single sales call.
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-white/[0.07] rounded-2xl overflow-hidden">

            {/* Step 1 */}
            <div className="p-10 border-r border-white/[0.07] bg-[#050505] relative group">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-sm">1</div>
                <span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">Paid Discovery</span>
              </div>
              <h3 className="text-[20px] font-semibold text-white mb-3 tracking-tight">The $2,500 Diagnostic Sprint</h3>
              <p className="text-[14px] text-zinc-400 leading-relaxed mb-8">
                Stop doing free discovery. Sell a 10-minute AI-powered operational audit as a fixed-fee product. The software maps their workflows, calculates their losses, and produces a prioritized roadmap—automatically.
              </p>
              <div className="space-y-2.5">
                {["Client fills 10-min intake form", "AgentBlue processes all workflow data", "You receive a fully calculated ROI scorecard"].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-[12px] text-white/50">
                    <div className="w-1 h-1 rounded-full bg-purple-400 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-10 border-r border-white/[0.07] bg-black relative group">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">2</div>
                <span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">Evidence-Based Roadmap</span>
              </div>
              <h3 className="text-[20px] font-semibold text-white mb-3 tracking-tight">Your Brand. Their Math.</h3>
              <p className="text-[14px] text-zinc-400 leading-relaxed mb-8">
                AgentBlue generates a white-labeled 30-page PDF roadmap under your agency brand. It shows them exactly what to automate, in what order, with financial projections for each step. The client doesn&apos;t argue with their own numbers.
              </p>
              <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                <div className="text-[10px] text-white/30 uppercase tracking-widest mb-3 font-semibold">Sample Roadmap Output</div>
                <div className="space-y-2">
                  {[
                    { label: "Invoice Auto-Processing", val: "$42k/yr ROI", color: "text-emerald-400" },
                    { label: "Support Triage via RAG", val: "$28k/yr ROI", color: "text-blue-400" },
                    { label: "CRM Data Enrichment", val: "$19k/yr ROI", color: "text-purple-400" },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between text-[12px]">
                      <span className="text-white/50">{row.label}</span>
                      <span className={`font-semibold ${row.color}`}>{row.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-10 bg-[#050505] relative group">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">3</div>
                <span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">Retainer Close</span>
              </div>
              <h3 className="text-[20px] font-semibold text-white mb-3 tracking-tight">The Pre-Sold Implementation</h3>
              <p className="text-[14px] text-zinc-400 leading-relaxed mb-8">
                The roadmap is the pitch deck. Because the client already approved the math in Step 1, pitching a $15k–$50k implementation retainer is a formality. You&apos;re not selling—you&apos;re confirming what they already know they need.
              </p>
              <div className="space-y-2.5">
                {["Client already validated the ROI", "Retainer scoped directly from roadmap", "AgentBlue monitors delivery & results"].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-[12px] text-white/50">
                    <div className="w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. The Revenue Math Section */}
      <section className="relative py-32 border-b border-white/[0.05] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-purple-600/5 rounded-full blur-[120px]" />
        </div>
        <div className="m-container relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left: Copy */}
            <div>
              <SectionBadge label="THE MATH" className="mb-6" color="purple" />
              <h2 className="text-3xl md:text-4xl font-normal leading-[1.15] tracking-[-0.03em] mb-6 text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.7) 0%, white 35%, white 100%)" }}>
                Same expertise.<br />10x the revenue.
              </h2>
              <div className="space-y-5 text-[15px] text-white/50 leading-relaxed mb-8">
                <p>
                  A consultant billing $200/hour needs 500 hours of client work to hit $100k. That&apos;s 12+ weeks of fully booked days with zero sick days, zero revisions, and zero sales time.
                </p>
                <p>
                  With AgentBlue, a single client engagement—one $2,500 audit + one $25k implementation retainer—is $27,500. Four clients a year is $110k. And the audit takes 10 minutes.
                </p>
                <p className="font-medium text-white/80 border-l-2 border-purple-500 pl-4 py-1 italic text-[14px]">
                  You don&apos;t scale by working more hours. You scale by selling outcomes.
                </p>
              </div>
              <Link
                href="/audit"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-purple-500 text-white rounded-xl font-semibold text-[14px] hover:bg-purple-400 transition-all"
              >
                Start Your First Audit Sprint <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Right: Income comparison cards */}
            <div className="space-y-4">
              {/* Hourly model */}
              <div className="p-6 bg-[#0A0A0A] border border-red-500/10 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-2xl rounded-full" />
                <div className="flex items-center gap-3 mb-5">
                  <div className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-[11px] font-bold uppercase tracking-widest">Before</div>
                  <span className="text-white/40 text-[13px]">Billing by the hour</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Rate", val: "$200/hr" },
                    { label: "Hours/Month", val: "80 hrs" },
                    { label: "Monthly Revenue", val: "$16k" },
                  ].map((stat, i) => (
                    <div key={i}>
                      <div className="text-[10px] text-white/30 uppercase tracking-widest mb-1">{stat.label}</div>
                      <div className="text-[18px] font-semibold text-white/60">{stat.val}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-white/[0.04] text-[12px] text-white/30">
                  Capped by time available. No leverage. Punished for being fast.
                </div>
              </div>

              {/* Productized model */}
              <div className="p-6 bg-[#0A0A0A] border border-purple-500/30 rounded-2xl relative overflow-hidden shadow-[0_0_40px_rgba(168,85,247,0.06)]">
                <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/8 blur-2xl rounded-full" />
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
                <div className="flex items-center gap-3 mb-5">
                  <div className="px-2.5 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 text-[11px] font-bold uppercase tracking-widest">After</div>
                  <span className="text-white/40 text-[13px]">Productized with AgentBlue</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Audit Sprint", val: "$2.5k" },
                    { label: "Avg Retainer", val: "$25k" },
                    { label: "4 Clients/yr", val: "$110k" },
                  ].map((stat, i) => (
                    <div key={i}>
                      <div className="text-[10px] text-white/30 uppercase tracking-widest mb-1">{stat.label}</div>
                      <div className="text-[18px] font-semibold text-purple-300">{stat.val}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-purple-500/10 text-[12px] text-purple-300/50">
                  Outcome-based. Scalable. Clients pre-sold by the math, not by you.
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Shared Global Sections */}
      <TestimonialsSection />
      <FAQSection />
      <FinalCTASection />
    </>
  );
}
