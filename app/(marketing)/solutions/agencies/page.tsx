"use client";

import Link from "next/link";
import { ArrowRight, LayoutTemplate, Palette, Globe, UploadCloud, Users, CreditCard, PieChart, ShieldCheck, Cpu, Sparkles, Layers, Activity, FileText, BarChart3, TrendingUp, CheckCircle2 } from "lucide-react";
import SectionBadge from "~/components/marketing/SectionBadge";
import { useScrollReveal } from "~/hooks/useScrollReveal";
import FAQSection from "~/components/marketing/sections/FAQSection";
import TestimonialsSection from "~/components/marketing/sections/TestimonialsSection";
import FinalCTASection from "~/components/marketing/sections/FinalCTASection";
import { useState } from "react";

export default function AgencySolutionsPage() {
  const ref = useScrollReveal();
  const playbookRef = useScrollReveal();

  const [activeBrand, setActiveBrand] = useState(0);

  const brands = [
    { name: "Default", color: "bg-emerald-500", border: "border-emerald-500/20", glow: "shadow-[0_0_30px_rgba(16,185,129,0.3)]", logo: "AB", text: "text-emerald-400" },
    { name: "Apex Digital", color: "bg-orange-500", border: "border-orange-500/20", glow: "shadow-[0_0_30px_rgba(249,115,22,0.3)]", logo: "AD", text: "text-orange-400" },
    { name: "Nova Consulting", color: "bg-indigo-500", border: "border-indigo-500/20", glow: "shadow-[0_0_30px_rgba(99,102,241,0.3)]", logo: "NC", text: "text-indigo-400" },
  ];

  return (
    <>
      {/* 1. The Portfolio Hero - Deep Dive Content */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-20 overflow-hidden min-h-[90vh] border-b border-white/[0.05]">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-emerald-600/10 rounded-full blur-[150px] pointer-events-none translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-1/2 left-0 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none -translate-x-1/2" />

        <div ref={ref} className="m-container relative z-10 flex flex-col items-center">

          <div className="text-center max-w-4xl mx-auto mb-16">
            <SectionBadge label="AGENCY COMMAND CENTER" className="m-reveal mb-8" color="emerald" />

            <h1
              className="m-reveal m-reveal-delay-1 text-[36px] md:text-[46px] lg:text-[54px] font-light tracking-[-0.03em] leading-[1.07] mb-8 text-transparent bg-clip-text"
              style={{
                backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.7) 0%, white 35%, white 100%)"
              }}
            >
              Don't sell advice.<br />Sell the entire infrastructure.
            </h1>

            <p className="m-reveal m-reveal-delay-2 text-[18px] md:text-[20px] text-white/50 mb-12 font-normal leading-relaxed max-w-3xl mx-auto">
              Your clients don't want another 40-page strategy deck. They want a button they can press to make their operations faster. AgentBlue gives you the enterprise-grade audit engine to sell high-ticket automation roadmaps—all under your own brand.
            </p>

            <div className="m-reveal m-reveal-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/audit"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black rounded-xl font-semibold text-[15px] hover:bg-white/90 transition-all w-full sm:w-auto"
              >
                Start an Agency Trial <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Large Portfolio Dashboard Mockup */}
          <div className="m-reveal m-reveal-delay-4 w-full max-w-6xl mx-auto relative">
            <div className="relative border border-white/[0.08] bg-[#0A0A0A]/90 backdrop-blur-3xl rounded-xl shadow-2xl overflow-hidden">

              {/* Dashboard Layout */}
              <div className="flex h-[500px]">
                {/* Sidebar */}
                <div className="w-64 border-r border-white/[0.05] bg-black/50 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-10">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <Cpu className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span className="font-bold text-white tracking-widest uppercase text-xs">AgentBlue</span>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-3">Portfolio</div>
                      <div className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-lg text-white border border-white/10 shadow-[inset_0_1px_rgba(255,255,255,0.1)]">
                        <Users className="w-4 h-4 text-emerald-400" /> <span className="text-sm font-medium">Clients (12)</span>
                      </div>
                      <div className="flex items-center gap-3 px-3 py-2 text-white/40 hover:text-white hover:bg-white/[0.02] rounded-lg transition-colors cursor-pointer">
                        <PieChart className="w-4 h-4" /> <span className="text-sm">Global Analytics</span>
                      </div>
                      <div className="flex items-center gap-3 px-3 py-2 text-white/40 hover:text-white hover:bg-white/[0.02] rounded-lg transition-colors cursor-pointer">
                        <LayoutTemplate className="w-4 h-4" /> <span className="text-sm">Branding Center</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-3 py-2 border border-emerald-500/20 bg-emerald-500/5 rounded-lg text-emerald-400 text-xs font-medium text-center hover:bg-emerald-500/10 cursor-pointer transition-colors">
                    + Add New Client
                  </div>
                </div>

                {/* Main Table Area */}
                <div className="flex-1 p-8 overflow-hidden flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-medium text-white">Client Roster</h2>
                    <div className="flex gap-3">
                      <div className="px-3 py-1.5 rounded-md border border-white/[0.08] text-xs font-semibold text-white/60">Filter</div>
                      <div className="px-3 py-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-xs font-bold text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]">Mass Export PDFs</div>
                    </div>
                  </div>

                  <div className="border border-white/[0.05] rounded-xl overflow-hidden bg-white/[0.01] flex-1">
                    <table className="w-full text-left text-sm text-white/70">
                      <thead className="bg-[#0c0c0c] text-xs uppercase text-white/40 border-b border-white/[0.05]">
                        <tr>
                          <th className="px-6 py-4 font-semibold tracking-wider">Company</th>
                          <th className="px-6 py-4 font-semibold tracking-wider">Maturity Score</th>
                          <th className="px-6 py-4 font-semibold tracking-wider">Detected Leakage</th>
                          <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                          <th className="px-6 py-4"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.02]">
                        {[
                          { name: "Acme Logistics", score: "24/100", leak: "$142,500/yr", status: "Audit Finished", sbg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
                          { name: "Horizon Dental Group", score: "68/100", leak: "$32,000/yr", status: "In Progress", sbg: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
                          { name: "Silverman Tech", score: "12/100", leak: "$280,000/yr", status: "Reviewing Proposal", sbg: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
                          { name: "Nexus Real Estate", score: "89/100", leak: "$8,500/yr", status: "Retainer Active", sbg: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
                        ].map((row, i) => (
                          <tr key={i} className="hover:bg-white/[0.02] transition-colors cursor-pointer group">
                            <td className="px-6 py-4 font-medium text-white">{row.name}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                  <div className="h-full bg-white max-w-[80%]" style={{ width: `${parseInt(row.score)}%` }}></div>
                                </div>
                                <span className="text-xs font-mono">{row.score}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-mono font-bold text-red-400/80">{row.leak}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${row.sbg}`}>
                                {row.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-xs text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity font-semibold">View Report →</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 2. The Interactive White-Label Demonstration */}
      <section className="relative py-32 border-b border-white/[0.05] overflow-hidden">
        {/* subtle bg glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-emerald-600/5 rounded-full blur-[120px]" />
        </div>
        <div ref={playbookRef} className="m-container relative z-10">

          <div className="grid lg:grid-cols-2 gap-0 border border-white/[0.07] rounded-2xl overflow-hidden">

            {/* LEFT: Text + Brand Switcher */}
            <div className="p-10 md:p-14 flex flex-col justify-center border-r border-white/[0.07] bg-[#050505]">
              <SectionBadge label="THE ENGINE IS YOURS" className="mb-6" color="emerald" />
              <h2 className="text-3xl md:text-4xl font-normal leading-[1.15] tracking-[-0.03em] mb-6 text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.7) 0%, white 35%, white 100%)" }}>
                White-label everything.<br />Complete brand ownership.
              </h2>
              <div className="space-y-5 text-[15px] text-white/50 leading-relaxed font-light mb-10">
                <p>
                  Your clients hire YOU because they trust YOUR agency. If you point them to a third-party audit tool, you lose your authority as the expert.
                </p>
                <p>
                  AgentBlue solves this. Our assessment intake forms, scorecards, and generated PDF blueprints are fully customizable. Swap the colors, inject your agency logo, and host the assessment on your own custom domain.
                </p>
                <p className="font-medium text-white/80 border-l-2 border-emerald-500 pl-4 py-1 italic text-[14px]">
                  You do the consulting. We do the math entirely in the background.
                </p>
              </div>

              {/* Feature checklist */}
              <div className="space-y-3 mb-10">
                {[
                  "Custom domain & logo on all client portals",
                  "Branded PDF reports with your agency colors",
                  "White-labeled intake forms and scorecards",
                  "Your name, not ours, on every deliverable",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-[13px] text-white/60">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>

              {/* Tab Switcher */}
              <div>
                <div className="text-[10px] text-white/30 uppercase tracking-widest mb-3 font-semibold">Preview a brand theme →</div>
                <div className="p-1 bg-white/[0.03] border border-white/[0.05] rounded-xl flex items-center justify-between">
                  {brands.map((brand, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveBrand(i)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all ${activeBrand === i ? `bg-white/10 text-white shadow-md` : `text-white/40 hover:text-white/70`}`}
                    >
                      {brand.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: Live Brand Demo */}
            <div className="flex items-center justify-center p-10 md:p-14 bg-black relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.04)_0%,transparent_70%)]" />
              <div className={`w-full max-w-md transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] bg-[#0A0A0A] border rounded-2xl flex flex-col overflow-hidden relative z-10 ${brands[activeBrand].border} ${brands[activeBrand].glow}`}>

                {/* Header */}
                <div className="p-5 border-b border-white/[0.05] flex justify-between items-center bg-black/60">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-base ${brands[activeBrand].color}`}>
                      {brands[activeBrand].logo}
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm">{brands[activeBrand].name}</div>
                      <div className="text-[9px] uppercase text-white/30 tracking-widest font-mono">CONFIDENTIAL ROADMAP</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-white/40 font-mono">LIVE</span>
                  </div>
                </div>

                {/* Report Body */}
                <div className="p-6 space-y-5">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Operational Diagnostic</h3>
                    <div className={`w-10 h-0.5 mb-4 ${brands[activeBrand].color}`}></div>
                    <div className="text-[12px] text-white/50 font-mono space-y-1">
                      <div>Client: <span className="text-white/80">Acme Logistics Corp</span></div>
                      <div>Date: <span className="text-white/80">October 14th</span></div>
                      <div>Prepared by: <span className={`font-bold ${brands[activeBrand].text}`}>Senior Partner</span></div>
                    </div>
                  </div>

                  <div className="p-4 bg-black/60 border border-white/[0.06] rounded-xl">
                    <div className="text-[10px] uppercase tracking-widest text-white/30 mb-2 font-semibold">Priority 1 Recommendation</div>
                    <div className="font-semibold text-white text-[14px] mb-1.5">Automate Zendesk → HubSpot Sync</div>
                    <p className="text-[12px] text-white/40 mb-3">Losing ~42 hrs/week to manual CRM updates from support tickets.</p>
                    <div className={`w-full py-1.5 flex items-center justify-center text-[11px] font-bold rounded-lg text-white ${brands[activeBrand].color}`}>
                      Implement Now — ROI: $45,000
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.05] opacity-50">
                    <div className="h-4 w-24 bg-white/5 rounded" />
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-white/50" />
                      <span className="text-[9px] uppercase tracking-widest font-mono text-white">Verified Secure</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. The Feature Grid / Bento Box */}
      <section className="bg-black py-32 border-b border-white/[0.05]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <SectionBadge label="AGENCY PLATFORM" className="mb-12" color="emerald" />
          <h2 className="text-3xl md:text-5xl font-normal leading-[1.15] tracking-[-0.03em] mb-16 text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.7) 0%, white 35%, white 100%)" }}>
            The infrastructure to scale your operations.
          </h2>

          {/* Inner Grid Container: EXACT 3-Column replication */}
          <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-white/[0.08] bg-black">

            {/* COLUMN 1: Identify Upsell Opportunities */}
            <div className="border-r border-b border-white/[0.08] p-10 flex flex-col gap-8 bg-black">
              <div>
                <h3 className="text-[20px] font-semibold text-white mb-3 tracking-tight flex items-center">
                  Identify Upsell Opportunities <ArrowRight className="w-4 h-4 ml-2 text-white/40" />
                </h3>
                <p className="text-[14px] text-zinc-400 leading-relaxed font-normal">
                  Our system automatically flags operational bottlenecks inside your clients' workflows—serving you new revenue opportunities on a silver platter before they even ask.
                </p>
              </div>

              <div className="mt-8 flex-1 min-h-[300px] flex items-end">
                <div className="w-[120%] -ml-[10%] bg-[#0A0A0A] border border-white/[0.05] rounded-t-xl rounded-b-none p-6 pb-0 flex flex-col gap-4">
                  <div className="w-full flex justify-between text-[11px] text-zinc-500 uppercase tracking-wider mb-2 px-2">
                    <span>Improvements</span>
                    <div className="flex gap-4">
                      <span>Score</span>
                      <span>Impact</span>
                    </div>
                  </div>

                  {/* Fake UI Items matching reference */}
                  <div className="bg-[#1C1C1E] border border-white/[0.04] rounded-xl p-5 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <h4 className="text-white text-[13px] font-semibold w-[60%]">Implement Structured Data (FAQ & HowTo Schema)</h4>
                      <div className="flex items-center gap-6">
                        <span className="text-white font-mono text-[14px] font-semibold">100</span>
                        <span className="border border-red-500/20 text-red-500 bg-red-500/5 text-[9px] px-2 py-0.5 rounded-full font-bold tracking-widest uppercase">High</span>
                      </div>
                    </div>
                    <p className="text-[#8E8E93] text-[11px] leading-relaxed">
                      HowTo schema to highlight key questions and step-by-step guides, increasing chances of featured AI snippets.
                    </p>
                  </div>

                  <div className="bg-[#1C1C1E] border border-white/[0.04] rounded-xl p-5 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <h4 className="text-white text-[13px] font-semibold w-[60%]">Strengthen Keyword Targeting</h4>
                      <div className="flex items-center gap-6">
                        <span className="text-white font-mono text-[14px] font-semibold">100</span>
                        <span className="border border-red-500/20 text-red-500 bg-red-500/5 text-[9px] px-2 py-0.5 rounded-full font-bold tracking-widest uppercase">High</span>
                      </div>
                    </div>
                    <p className="text-[#8E8E93] text-[11px] leading-relaxed">
                      Integrate relevant keywords naturally into headings, subheadings, and body content to boost topical authority and search visibility.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 2: Automated Client Reporting */}
            <div className="border-r border-b border-white/[0.08] p-10 flex flex-col gap-8 bg-black">
              <div>
                <h3 className="text-[20px] font-semibold text-white mb-3 tracking-tight flex items-center">
                  Automated Client Reporting <ArrowRight className="w-4 h-4 ml-2 text-white/40" />
                </h3>
                <p className="text-[14px] text-zinc-400 leading-relaxed font-normal">
                  Stop wasting the last week of every month building decks. We aggregate data across all client integrations and auto-generate beautiful, branded performance reports.
                </p>
              </div>

              <div className="mt-8 flex-1 min-h-[300px] flex flex-col justify-end overflow-hidden">
                <div className="bg-[#0A0A0C] border border-white/10 rounded-t-xl rounded-b-none p-5 shadow-[0_-20px_40px_rgba(0,0,0,0.8)] font-mono text-[11px] leading-relaxed flex flex-col gap-3 transform translate-y-4">
                  {/* Terminal Header */}
                  <div className="flex items-center gap-1.5 mb-2 pb-3 border-b border-white/5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                    <span className="ml-2 text-white/30 text-[10px] tracking-widest font-sans uppercase">agent.sh</span>
                  </div>

                  <div className="text-emerald-400 mt-1">
                    <span className="text-[#ec4899]">➜</span> <span className="text-blue-400">~</span> npx attensira audit --client "Acme Logistics"
                  </div>
                  <div className="text-white/60">
                    <span className="text-emerald-400">✓</span> 14 active workflows detected<br />
                    <span className="text-emerald-400">✓</span> 3 bottlenecks flagged for review<br />
                    <span className="text-white/40">Calculating upsell opportunity score...</span>
                  </div>

                  <div className="text-emerald-400 mt-2">
                    <span className="text-[#ec4899]">➜</span> <span className="text-blue-400">~</span> npx attensira report --generate --format=pdf
                  </div>
                  <div className="text-white/80 bg-white/5 p-3 rounded-lg border border-white/5 mt-1 relative">
                    <div className="absolute top-2 right-2 text-[9px] text-white/30 font-sans tracking-widest">OUTPUT</div>
                    <span className="text-purple-400 font-semibold">Client:</span> Acme Logistics Corp<br /><br />
                    <span className="text-purple-400 font-semibold">Opportunities Found:</span><br />
                    <span className="text-white/50">- RAG for Support Docs ($42k ROI)</span><br />
                    <span className="text-white/50">- Invoice Auto-Extraction ($18k ROI)</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/40 mt-1 mb-1">
                    <span className="text-[#ec4899]">➜</span> <span className="text-blue-400">~</span>
                    <div className="w-2 h-3.5 bg-white/60 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 3: Find Where AI Already Recommends You */}
            <div className="border-r lg:border-r-0 border-b border-white/[0.08] p-10 flex flex-col gap-8 bg-black">
              <div>
                <h3 className="text-[20px] font-semibold text-white mb-3 tracking-tight flex items-center">
                  Monitor Client Health &amp; AI Visibility <ArrowRight className="w-4 h-4 ml-2 text-white/40" />
                </h3>
                <p className="text-[14px] text-zinc-400 leading-relaxed font-normal">
                  See which automations save the most time, which clients need attention, and which AI models are already recommending your clients—all from one unified command center.
                </p>
              </div>

              <div className="mt-8 flex-1 min-h-[300px] flex flex-col justify-end">
                <div className="flex flex-col relative px-2">

                  {/* Notification 1 — client usage spike */}
                  <div className="bg-[#1C1C1E]/80 backdrop-blur-2xl border border-white/10 rounded-[24px] p-5 flex flex-col shadow-2xl relative overflow-hidden z-30">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                          <div className="w-3 h-3 rounded-sm bg-emerald-400" />
                        </div>
                        <span className="text-white/60 text-[11px] font-medium tracking-wide">AgentBlue</span>
                      </div>
                      <span className="text-white/40 text-[11px]">just now</span>
                    </div>
                    <div>
                      <h4 className="text-white/90 text-[14px] font-semibold mb-1">🟢 Acme Logistics — 45h saved</h4>
                      <p className="text-white/60 text-[12px] leading-snug">
                        Invoice extraction automation processed <span className="text-white font-medium">312 documents</span> this week. Zero manual hours logged.
                      </p>
                    </div>
                  </div>

                  {/* Notification 2 — client needs attention */}
                  <div className="bg-[#1C1C1E]/80 backdrop-blur-2xl border border-amber-500/20 rounded-[24px] p-5 flex flex-col shadow-2xl relative overflow-hidden z-20 scale-[0.94] -mt-6 origin-top opacity-80">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent"></div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                          <div className="w-3 h-3 rounded-sm bg-amber-400" />
                        </div>
                        <span className="text-white/60 text-[11px] font-medium tracking-wide">AgentBlue</span>
                      </div>
                      <span className="text-white/40 text-[11px]">12m ago</span>
                    </div>
                    <div>
                      <h4 className="text-amber-300/90 text-[14px] font-semibold mb-1">⚠️ Horizon Dental — needs review</h4>
                      <p className="text-white/60 text-[12px] leading-snug">
                        2 automations <span className="text-white font-medium">paused for 3 days</span>. Client usage dropped 40%. Consider a check-in.
                      </p>
                    </div>
                  </div>

                  {/* Notification 3 — upsell flag */}
                  <div className="bg-[#1C1C1E]/80 backdrop-blur-2xl border border-white/10 rounded-[24px] p-5 flex flex-col shadow-2xl relative overflow-hidden z-10 scale-[0.88] -mt-6 origin-top opacity-50">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                          <div className="w-3 h-3 rounded-sm bg-blue-400" />
                        </div>
                        <span className="text-white/60 text-[11px] font-medium tracking-wide">AgentBlue</span>
                      </div>
                      <span className="text-white/40 text-[11px]">1h ago</span>
                    </div>
                    <div>
                      <h4 className="text-white/90 text-[14px] font-semibold mb-1">💡 Silverman Tech — upsell ready</h4>
                      <p className="text-white/60 text-[12px] leading-snug">
                        New bottleneck detected: <span className="text-white font-medium">support triage</span>. Est. $28k ROI. Blueprint ready to deploy.
                      </p>
                    </div>
                  </div>

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
