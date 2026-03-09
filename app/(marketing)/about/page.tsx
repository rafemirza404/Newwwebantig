"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Linkedin, Target, Scale, FileText, BarChart3, Zap, Shield, Brain, ArrowUpRight } from "lucide-react";
import SectionBadge from "~/components/marketing/SectionBadge";
import { useScrollReveal } from "~/hooks/useScrollReveal";

const beliefs = [
  {
    icon: Target,
    title: "Diagnosis Before Prescription",
    description:
      "You wouldn't want surgery without a diagnosis. Why automate without understanding what's actually broken? Every client starts with our Operations Intelligence Audit—no exceptions.",
  },
  {
    icon: Scale,
    title: "Zero Vendor Bias",
    description:
      "We don't earn commissions from software vendors. We're not certified resellers. We recommend what's genuinely best for your business, even if it means using tools you already own.",
  },
  {
    icon: FileText,
    title: "You Own Everything",
    description:
      "The blueprints, roadmaps, and documentation we create are yours forever. Implement with your team, hire freelancers, or let us build it. Total flexibility. Zero lock-in.",
  },
  {
    icon: BarChart3,
    title: "ROI-Accountable, Always",
    description:
      "Every automation is tied to measurable outcomes: time saved, costs reduced, revenue enabled. No vanity metrics. Just quantified business impact.",
  },
];

const stats = [
  { val: "312+", label: "Workflows Automated", sub: "and counting" },
  { val: "$4.2M", label: "Client ROI Generated", sub: "documented & verified" },
  { val: "98%", label: "Client Retention Rate", sub: "year over year" },
  { val: "10 min", label: "Average Audit Time", sub: "to full operational diagnosis" },
];

export default function AboutPage() {
  const heroRef = useScrollReveal();
  const missionRef = useScrollReveal();

  return (
    <>
      {/* 1. Hero */}
      <section className="relative pt-40 pb-32 overflow-hidden border-b border-white/[0.05]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-purple-600/8 rounded-full blur-[150px] pointer-events-none" />
        <div ref={heroRef} className="m-container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <SectionBadge label="OUR STORY" className="m-reveal mb-8 flex justify-center" color="purple" />
            <h1
              className="m-reveal m-reveal-delay-1 text-[42px] md:text-[58px] lg:text-[68px] font-light tracking-[-0.03em] leading-[1.05] mb-8 text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.7) 0%, white 35%, white 100%)" }}
            >
              We believe AI should pay<br />for itself on day one.
            </h1>
            <p className="m-reveal m-reveal-delay-2 text-[17px] md:text-[19px] text-white/50 mb-12 font-normal leading-relaxed max-w-2xl mx-auto">
              AgentBlue was built by consultants who were tired of watching businesses buy AI tools they didn't understand, from vendors who didn't care. We do it differently.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Stats Bar */}
      <section className="border-b border-white/[0.05] bg-[#050505]">
        <div className="m-container">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-white/[0.05]">
            {stats.map((stat, i) => (
              <div key={i} className="px-8 py-10 text-center">
                <div className="text-[36px] md:text-[44px] font-semibold text-white tracking-tight mb-1">{stat.val}</div>
                <div className="text-[13px] text-white/60 font-medium">{stat.label}</div>
                <div className="text-[11px] text-white/25 mt-0.5">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Why We Exist */}
      <section className="relative py-32 border-b border-white/[0.05] overflow-hidden">
        <div ref={missionRef} className="m-container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left: copy */}
            <div>
              <SectionBadge label="WHY WE EXIST" className="mb-6" color="purple" />
              <h2 className="text-3xl md:text-4xl font-normal leading-[1.15] tracking-[-0.03em] mb-8 text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.7) 0%, white 35%, white 100%)" }}>
                Born from frustration.<br />Built on principle.
              </h2>
              <div className="space-y-5 text-[15px] text-white/50 leading-relaxed">
                <p>
                  We've seen it too many times: businesses buy automation platforms after watching a flashy demo, then struggle for months trying to make them work. They hire freelancers who build whatever's easiest, not what actually matters.
                </p>
                <p>
                  AgentBlue was founded on a different principle: <span className="text-white/80 font-medium">strategy before tools</span>. Every engagement starts with diagnosis—understanding your actual workflows, quantifying real costs, and prioritizing opportunities based on ROI.
                </p>
                <p>
                  We don't sell software. We sell certainty. The kind that comes with a 30-page roadmap, mathematical proof, and a zero-lock-in guarantee.
                </p>
              </div>

              <div className="mt-10 flex items-center gap-4">
                <Link href="/audit" className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-black rounded-xl font-semibold text-[14px] hover:bg-white/90 transition-all">
                  Run a Free Audit <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/solutions/agencies" className="inline-flex items-center gap-2 px-6 py-3.5 border border-white/10 text-white/70 rounded-xl font-medium text-[14px] hover:border-white/20 hover:text-white transition-all">
                  See Solutions <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right: manifesto card */}
            <div className="relative">
              <div className="absolute -inset-4 bg-purple-500/5 rounded-3xl blur-2xl" />
              <div className="relative border border-white/[0.07] rounded-2xl overflow-hidden bg-[#050505]">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
                <div className="p-8 border-b border-white/[0.05]">
                  <div className="text-[10px] text-white/30 uppercase tracking-widest font-semibold mb-4">Our Operating Principles</div>
                  {[
                    { icon: Brain, label: "Diagnose first, always", color: "text-purple-400" },
                    { icon: Shield, label: "Zero vendor commissions — ever", color: "text-emerald-400" },
                    { icon: FileText, label: "You own every deliverable", color: "text-blue-400" },
                    { icon: Zap, label: "Every automation is ROI-accountable", color: "text-amber-400" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 py-3.5 border-b border-white/[0.04] last:border-0">
                      <item.icon className={`w-4 h-4 ${item.color} shrink-0`} />
                      <span className="text-[14px] text-white/70">{item.label}</span>
                    </div>
                  ))}
                </div>
                <div className="p-6 bg-black/40">
                  <blockquote className="text-[15px] text-white/60 leading-relaxed italic border-l-2 border-purple-500 pl-4">
                    "Strategy first. Tools second. Results always."
                  </blockquote>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. What We Believe */}
      <section className="py-32 border-b border-white/[0.05]">
        <div className="m-container">
          <div className="grid lg:grid-cols-12 gap-16">

            {/* Left: sticky header */}
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-32">
                <SectionBadge label="OUR BELIEFS" className="mb-6" color="purple" />
                <h2 className="text-3xl md:text-4xl font-normal leading-[1.15] tracking-[-0.03em] mb-6 text-transparent bg-clip-text"
                  style={{ backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.7) 0%, white 35%, white 100%)" }}>
                  The principles that guide every engagement.
                </h2>
                <p className="text-[14px] text-white/35 leading-relaxed">
                  These aren't marketing copy. They're the constraints we hold ourselves to every time we take on a new client.
                </p>
              </div>
            </div>

            {/* Right: numbered list */}
            <div className="lg:col-span-8">
              <div className="divide-y divide-white/[0.06]">
                {beliefs.map((belief, i) => {
                  const Icon = belief.icon;
                  return (
                    <div key={i} className="flex gap-8 md:gap-12 py-10 first:pt-0 group">
                      {/* Index number */}
                      <div className="shrink-0 w-8 text-right">
                        <span className="text-[48px] font-semibold leading-none text-white/[0.06] select-none group-hover:text-white/[0.10] transition-colors">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 pt-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Icon className="w-4 h-4 text-white/30 shrink-0" />
                          <h3 className="text-[18px] md:text-[20px] font-semibold text-white tracking-tight">
                            {belief.title}
                          </h3>
                        </div>
                        <p className="text-[14px] text-zinc-400 leading-relaxed max-w-xl">
                          {belief.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* 5. Founder */}
      <section className="py-32 border-b border-white/[0.05] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="m-container relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left: Founder card */}
            <div className="flex justify-center lg:justify-start">
              <div className="border border-white/[0.07] rounded-2xl overflow-hidden bg-[#050505] w-full max-w-sm relative">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
                <div className="p-8 flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full border-2 border-purple-500/30 overflow-hidden mb-5 bg-white/5">
                    <Image
                      src="/rafe.png"
                      alt="Rafe Mirza"
                      width={96}
                      height={96}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="text-[10px] text-purple-400 uppercase tracking-widest font-semibold mb-2">Founder & CEO</div>
                  <h3 className="text-[22px] font-semibold text-white mb-3">Rafe Mirza</h3>
                  <p className="text-[13px] text-white/50 leading-relaxed mb-6">
                    Consultant and technical strategist specializing in automation, integrations, and AI solutions for operations-heavy businesses.
                  </p>
                  <a
                    href="https://www.linkedin.com/in/rafe-mirza-3a952b2b5/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0077B5]/10 border border-[#0077B5]/30 rounded-xl text-[#0077B5] text-[13px] font-medium hover:bg-[#0077B5]/20 transition-all"
                  >
                    <Linkedin className="w-4 h-4" />
                    Connect on LinkedIn
                  </a>
                </div>
                <div className="border-t border-white/[0.05] p-5 bg-black/30">
                  <div className="text-[10px] text-white/25 uppercase tracking-widest mb-3 font-semibold">Milestones</div>
                  <div className="space-y-2">
                    {[
                      { year: "2021", event: "First AI audit delivered to a logistics client" },
                      { year: "2023", event: "Launched the AgentBlue platform" },
                      { year: "2024", event: "Crossed $4M in documented client ROI" },
                    ].map((m, i) => (
                      <div key={i} className="flex items-start gap-3 text-[12px]">
                        <span className="text-white/30 font-mono shrink-0 w-8">{m.year}</span>
                        <span className="text-white/50">{m.event}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: copy */}
            <div>
              <SectionBadge label="THE FOUNDER" className="mb-6" color="purple" />
              <h2 className="text-3xl md:text-4xl font-normal leading-[1.15] tracking-[-0.03em] mb-6 text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.7) 0%, white 35%, white 100%)" }}>
                Built by someone who's been in the trenches.
              </h2>
              <div className="space-y-5 text-[15px] text-white/50 leading-relaxed">
                <p>
                  Rafe Mirza started as an operations consultant helping mid-market businesses untangle their messy, manual workflows. He kept running into the same problem: clients were buying AI tools based on demos, not data.
                </p>
                <p>
                  That frustration became AgentBlue — a platform that replaces vendor-powered hype with a cold, mathematical audit of exactly where your business is losing money.
                </p>
                <p className="text-white/80 font-medium border-l-2 border-purple-500 pl-4 py-1 italic text-[14px]">
                  "I built the tool I always wished my clients had access to before we started working together."
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Final CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-600/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="m-container relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-light tracking-[-0.03em] mb-6 text-transparent bg-clip-text"
            style={{ backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.6) 0%, white 40%, white 100%)" }}>
            Ready to see what we'd find<br />in your operations?
          </h2>
          <p className="text-[16px] text-white/40 mb-10 max-w-lg mx-auto">
            Start with a free 10-minute audit. No sales call required. Get a personalized ROI scorecard.
          </p>
          <Link href="/audit" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-xl font-semibold text-[15px] hover:bg-white/90 transition-all">
            Start Free Audit <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
