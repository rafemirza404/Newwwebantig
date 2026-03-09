"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, ChevronRight, Gauge, Activity, Zap, Server, ChevronUp, ChevronDown, RefreshCw, Layers } from "lucide-react";
import SectionBadge from "~/components/marketing/SectionBadge";
import { useScrollReveal } from "~/hooks/useScrollReveal";
import FAQSection from "~/components/marketing/sections/FAQSection";
import TestimonialsSection from "~/components/marketing/sections/TestimonialsSection";
import FinalCTASection from "~/components/marketing/sections/FinalCTASection";
import { useState } from "react";

export default function BusinessSolutionsPage() {
    const ref = useScrollReveal();
    const manifestoRef = useScrollReveal();

    const [activeTab, setActiveTab] = useState(0);

    return (
        <>
            {/* 1. The Manifesto Hero - Deep Dive Content */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-20 overflow-hidden min-h-[90vh] border-b border-white/[0.05]">
                <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none translate-x-1/2 -translate-y-1/2" />
                <div className="absolute top-1/2 left-0 w-[800px] h-[800px] bg-emerald-600/5 rounded-full blur-[150px] pointer-events-none -translate-x-1/2" />

                <div ref={ref} className="m-container relative z-10 flex flex-col items-center">

                    <div className="text-center max-w-4xl mx-auto mb-16">
                        <SectionBadge label="BUSINESS OWNERS & OPERATORS" className="m-reveal mb-8" color="blue" />

                        <h1
                            className="m-reveal m-reveal-delay-1 text-[36px] md:text-[46px] lg:text-[54px] font-light tracking-[-0.03em] leading-[1.07] mb-8 text-transparent bg-clip-text"
                            style={{
                                backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.7) 0%, white 35%, white 100%)"
                            }}
                        >
                            You're bleeding margins you can't even see.
                        </h1>

                        <p className="m-reveal m-reveal-delay-2 text-[18px] md:text-[20px] text-white/50 mb-12 font-normal leading-relaxed max-w-3xl mx-auto">
                            Every growing business eventually hits a wall. Revenue goes up, but profit margins stay flat. To scale, you keep hiring more people to do the exact same manual tasks. AgentBlue gives you an X-Ray for your company's operational inefficiencies.
                        </p>

                        <div className="m-reveal m-reveal-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/audit"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black rounded-xl font-semibold text-[15px] hover:bg-white/90 transition-all w-full sm:w-auto"
                            >
                                Launch Operations Scanner <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Static Mac-Style Dashboard Mockup */}
                    <div className="m-reveal m-reveal-delay-4 w-full max-w-5xl mx-auto relative">
                        <div className="relative border border-white/[0.08] bg-[#0A0A0A]/90 backdrop-blur-3xl rounded-xl shadow-2xl overflow-hidden">

                            {/* Mac Window Header */}
                            <div className="h-10 bg-white/[0.02] border-b border-white/[0.05] flex items-center px-4 gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                                <div className="ml-4 text-xs font-mono text-white/30 truncate flex-1 text-center">agentblue_operations_scanner_v2.0</div>
                            </div>

                            {/* Dashboard Content */}
                            <div className="flex h-[400px] text-white">
                                {/* Mini Sidebar */}
                                <div className="hidden sm:flex w-16 border-r border-white/[0.05] p-3 flex-col items-center gap-6 bg-black/20">
                                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                                        <Activity className="w-4 h-4" />
                                    </div>
                                    <div className="w-8 h-8 rounded-lg text-white/30 flex items-center justify-center hover:bg-white/5 cursor-pointer transition-colors">
                                        <Layers className="w-4 h-4" />
                                    </div>
                                    <div className="w-8 h-8 rounded-lg text-white/30 flex items-center justify-center hover:bg-white/5 cursor-pointer transition-colors">
                                        <Server className="w-4 h-4" />
                                    </div>
                                </div>

                                {/* Main content */}
                                <div className="flex-1 p-6 relative overflow-hidden flex flex-col">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-xl font-medium flex items-center gap-2">
                                                Operations Monitor
                                            </h3>
                                            <p className="text-xs text-white/40 mt-1">Live tracking 4 active agents</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20 font-medium">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                            System Optimal
                                        </div>
                                    </div>

                                    {/* 3 Metric Cards */}
                                    <div className="grid grid-cols-3 gap-4 mb-6">
                                        <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl flex flex-col justify-center">
                                            <div className="text-[10px] text-white/40 uppercase tracking-widest mb-2 font-mono">Cost Avoided</div>
                                            <div className="text-2xl font-normal tracking-tight">$12,450</div>
                                            <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-2 bg-emerald-500/10 w-fit px-1.5 py-0.5 rounded">
                                                <ChevronUp className="w-3 h-3" /> 24% this week
                                            </div>
                                        </div>
                                        <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl flex flex-col justify-center">
                                            <div className="text-[10px] text-white/40 uppercase tracking-widest mb-2 font-mono">Time Saved</div>
                                            <div className="text-2xl font-normal tracking-tight">142 hrs</div>
                                            <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-2 bg-emerald-500/10 w-fit px-1.5 py-0.5 rounded">
                                                <ChevronUp className="w-3 h-3" /> 12% this week
                                            </div>
                                        </div>
                                        <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl flex flex-col justify-center">
                                            <div className="text-[10px] text-white/40 uppercase tracking-widest mb-2 font-mono">Manual Errors</div>
                                            <div className="text-2xl font-normal tracking-tight">0</div>
                                            <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-2 bg-emerald-500/10 w-fit px-1.5 py-0.5 rounded">
                                                <ChevronDown className="w-3 h-3" /> 100% fixed
                                            </div>
                                        </div>
                                    </div>

                                    {/* Lower Section: Activity & Graph */}
                                    <div className="flex-1 flex gap-4">
                                        {/* Live Activity Feed */}
                                        <div className="flex-1 border border-white/[0.05] bg-black/40 rounded-xl p-5 overflow-hidden relative shadow-inner">
                                            <div className="text-[10px] text-white/30 mb-5 font-mono flex items-center justify-between">
                                                <span>LIVE AGENT EVENTS</span>
                                                <span className="text-emerald-500/50">Listening...</span>
                                            </div>

                                            <div className="space-y-4 relative z-10 w-full">
                                                {/* Event 1 */}
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 w-5 h-5 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shrink-0">
                                                        <Zap className="w-2.5 h-2.5 text-amber-400" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium text-white/90 truncate">Invoice parsing complete</div>
                                                        <div className="text-xs text-white/40 mt-0.5 flex items-center gap-1.5 truncate">
                                                            45 PDF invoices. <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-2.5 h-2.5" /> Success</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Event 2 (Active) */}
                                                <div className="flex items-start gap-3 relative">
                                                    <div className="mt-0.5 w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.3)] shrink-0">
                                                        <RefreshCw className="w-2.5 h-2.5 text-blue-400 animate-[spin_3s_linear_infinite]" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium text-white/90 truncate">Triaging priority ticket</div>
                                                        <div className="text-[11px] text-white/40 mt-0.5 truncate">Routing to tech tier 2...</div>

                                                        {/* Animated Progress Bar */}
                                                        <div className="w-full h-1 bg-white/5 rounded-full mt-2.5 overflow-hidden relative">
                                                            <div className="absolute top-0 bottom-0 left-0 bg-blue-500/80 rounded-full animate-pulse blur-[1px] transition-all duration-1000" style={{ width: '65%' }}></div>
                                                            <div className="absolute top-0 bottom-0 left-0 bg-blue-400 rounded-full transition-all duration-1000" style={{ width: '65%' }}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Background ambiance in feed */}
                                            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-blue-500/10 blur-3xl rounded-full mix-blend-screen animate-pulse pointer-events-none"></div>
                                        </div>

                                        {/* Live Graph/Trends */}
                                        <div className="flex-1 border border-white/[0.05] bg-black/40 rounded-xl p-5 overflow-hidden relative shadow-inner flex flex-col justify-between hidden md:flex">
                                            <div className="text-[10px] text-white/30 mb-2 font-mono flex items-center justify-between">
                                                <span>AI PROCESSING LOAD</span>
                                                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span> Live</span>
                                            </div>

                                            {/* Animated Bar Chart */}
                                            <div className="flex-1 flex items-end gap-[3px] pt-4 w-full">
                                                {[30, 45, 25, 60, 40, 75, 50, 85, 55, 65, 45, 80, 60, 30, 40].map((height, i) => (
                                                    <div key={i} className="flex-1 bg-white/[0.02] rounded-t-[2px] relative group h-full flex items-end">
                                                        {/* Animated overlay */}
                                                        <div
                                                            className="w-full bg-blue-500/80 rounded-t-[2px] animate-pulse"
                                                            style={{
                                                                height: `${height}%`,
                                                                animationDelay: `${i * 150}ms`,
                                                                animationDuration: '2s'
                                                            }}
                                                        >
                                                            {/* Glowing top edge */}
                                                            <div className="absolute top-0 left-0 right-0 h-[2px] bg-blue-300 blur-[1px]"></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            {/* Grid lines ambiance */}
                                            <div className="absolute inset-x-5 inset-y-12 border-y border-white/[0.02] pointer-events-none flex flex-col justify-between">
                                                <div className="w-full h-px"></div>
                                                <div className="w-full h-px bg-white/[0.02]"></div>
                                                <div className="w-full h-px bg-white/[0.02]"></div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. The Interactive Value Calculator / Left-Right Scroll Story */}
            <section className="relative py-32 border-b border-white/[0.05]">
                <div ref={manifestoRef} className="m-container">

                    <div className="grid lg:grid-cols-2 gap-20">

                        {/* Left Column: Interactive Selector */}
                        <div className="relative flex flex-col gap-4 z-10">

                            {/* Step 1 */}
                            <button
                                onClick={() => setActiveTab(0)}
                                className={`w-full text-left p-6 md:p-8 rounded-2xl border transition-all duration-300 group ${activeTab === 0
                                    ? 'bg-blue-500/10 border-blue-500/30'
                                    : 'bg-[#0A0A0A] border-white/5 hover:border-white/10 hover:bg-white/[0.03]'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs transition-colors duration-300 ${activeTab === 0 ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-white/5 text-white/40 group-hover:bg-white/10 group-hover:text-white/60'
                                            }`}>
                                            01
                                        </div>
                                        <h3 className={`text-xl font-medium transition-colors duration-300 ${activeTab === 0 ? 'text-white' : 'text-white/50 group-hover:text-white/80'}`}>
                                            Stop guessing. Start diagnosing.
                                        </h3>
                                    </div>
                                    <ArrowRight className={`w-5 h-5 transition-all duration-300 ${activeTab === 0 ? 'text-blue-400 opacity-100 translate-x-0' : 'text-white/20 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                                </div>
                                <p className={`text-sm md:text-base leading-relaxed pl-12 pr-4 transition-all duration-300 ${activeTab === 0 ? 'text-white/80' : 'text-white/40 group-hover:text-white/60'}`}>
                                    You wouldn't treat a patient without taking their vitals first. Why treat your business any differently? Our 10-minute diagnostic tool forces you to look objectively at how data moves through your organization.
                                </p>
                            </button>

                            {/* Step 2 */}
                            <button
                                onClick={() => setActiveTab(1)}
                                className={`w-full text-left p-6 md:p-8 rounded-2xl border transition-all duration-300 group ${activeTab === 1
                                    ? 'bg-emerald-500/10 border-emerald-500/30'
                                    : 'bg-[#0A0A0A] border-white/5 hover:border-white/10 hover:bg-white/[0.03]'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs transition-colors duration-300 ${activeTab === 1 ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-white/5 text-white/40 group-hover:bg-white/10 group-hover:text-white/60'
                                            }`}>
                                            02
                                        </div>
                                        <h3 className={`text-xl font-medium transition-colors duration-300 ${activeTab === 1 ? 'text-white' : 'text-white/50 group-hover:text-white/80'}`}>
                                            Reveal the hard numbers.
                                        </h3>
                                    </div>
                                    <ArrowRight className={`w-5 h-5 transition-all duration-300 ${activeTab === 1 ? 'text-emerald-400 opacity-100 translate-x-0' : 'text-white/20 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                                </div>
                                <p className={`text-sm md:text-base leading-relaxed pl-12 pr-4 transition-all duration-300 ${activeTab === 1 ? 'text-white/80' : 'text-white/40 group-hover:text-white/60'}`}>
                                    "We need AI" is a useless statement. "If we automate our onboarding flow, we save 32 hours per week, translating to $48,000 annually" is a business case. We do the math for you.
                                </p>
                            </button>

                            {/* Step 3 */}
                            <button
                                onClick={() => setActiveTab(2)}
                                className={`w-full text-left p-6 md:p-8 rounded-2xl border transition-all duration-300 group ${activeTab === 2
                                    ? 'bg-purple-500/10 border-purple-500/30'
                                    : 'bg-[#0A0A0A] border-white/5 hover:border-white/10 hover:bg-white/[0.03]'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs transition-colors duration-300 ${activeTab === 2 ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'bg-white/5 text-white/40 group-hover:bg-white/10 group-hover:text-white/60'
                                            }`}>
                                            03
                                        </div>
                                        <h3 className={`text-xl font-medium transition-colors duration-300 ${activeTab === 2 ? 'text-white' : 'text-white/50 group-hover:text-white/80'}`}>
                                            Deploy the exact blueprints.
                                        </h3>
                                    </div>
                                    <ArrowRight className={`w-5 h-5 transition-all duration-300 ${activeTab === 2 ? 'text-purple-400 opacity-100 translate-x-0' : 'text-white/20 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                                </div>
                                <p className={`text-sm md:text-base leading-relaxed pl-12 pr-4 transition-all duration-300 ${activeTab === 2 ? 'text-white/80' : 'text-white/40 group-hover:text-white/60'}`}>
                                    Once we know where the holes are, we give you the exact blueprints to patch them. We tell you what software to buy, what prompts to use, and step-by-step how to string them together.
                                </p>
                            </button>

                        </div>

                        {/* Right Column: Dynamic Mockups based on active Tab */}
                        <div className="h-[450px] lg:h-auto lg:sticky lg:top-36 relative flex items-center">

                            {/* Visual 1 */}
                            <div className={`absolute inset-0 transition-all duration-700 ${activeTab === 0 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95 pointer-events-none'}`}>
                                <div className="w-full h-full bg-[#080808] border border-white/10 rounded-2xl flex flex-col p-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full" />
                                    <div className="text-xs font-mono text-white/40 mb-6 uppercase tracking-widest">Diagnostic Interface</div>
                                    <div className="space-y-6 flex-1">
                                        <div className="p-5 border border-white/10 rounded-xl bg-white/[0.02]">
                                            <div className="text-lg font-medium text-white mb-2">How do you currently handle new lead intake?</div>
                                            <div className="grid gap-3 mt-4">
                                                <div className="p-3 border border-white/5 bg-black rounded-lg text-sm text-white/60">They sit in a shared inbox until someone replies.</div>
                                                <div className="p-3 border border-blue-500/30 bg-blue-500/10 rounded-lg text-sm text-blue-100 flex items-center justify-between">
                                                    We manually enter them into a CRM. <CheckCircle2 className="w-4 h-4 text-blue-400" />
                                                </div>
                                                <div className="p-3 border border-white/5 bg-black rounded-lg text-sm text-white/60">It is fully automated end-to-end.</div>
                                            </div>
                                        </div>
                                        <div className="p-5 border border-white/10 rounded-xl bg-white/[0.02] opacity-50 blur-[2px]">
                                            <div className="text-lg font-medium text-white mb-2">What is your primary customer support channel?</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Visual 2 */}
                            <div className={`absolute inset-0 transition-all duration-700 ${activeTab === 1 ? 'opacity-100 translate-y-0 scale-100 z-10' : 'opacity-0 translate-y-12 scale-95 pointer-events-none'}`}>
                                <div className="w-full h-full bg-[#080808] border border-emerald-500/20 rounded-2xl flex flex-col p-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full" />
                                    <div className="text-xs font-mono text-emerald-400 mb-6 uppercase tracking-widest">Financial Impact Engine</div>
                                    <div className="w-full max-w-sm mx-auto mt-12 space-y-8">
                                        <div className="text-center">
                                            <div className="text-sm text-white/50 mb-2">Projected Annual Savings</div>
                                            <div className="text-6xl font-normal text-emerald-400 tracking-tighter mb-4">$108,000</div>
                                            <div className="inline-flex px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 text-xs rounded-full font-bold">
                                                +24% Net Margin Increase
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-8 border-t border-white/10">
                                            <div>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-white/60">Currently Wasted Labor (Hours)</span>
                                                    <span className="text-white">1,240 hrs</span>
                                                </div>
                                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden"><div className="w-[80%] h-full bg-red-500/50 rounded-full" /></div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-white/60">Cost Output with Automation</span>
                                                    <span className="text-white">120 hrs</span>
                                                </div>
                                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden"><div className="w-[15%] h-full bg-emerald-500/80 rounded-full" /></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Visual 3 */}
                            <div className={`absolute inset-0 transition-all duration-700 ${activeTab === 2 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95 pointer-events-none'}`}>
                                <div className="w-full h-full bg-[#080808] border border-purple-500/20 rounded-2xl flex flex-col p-0 relative overflow-hidden">
                                    {/* PDF Report Header Simulation */}
                                    <div className="h-32 bg-gradient-to-br from-purple-900/40 to-black border-b border-purple-500/20 p-6 flex flex-col justify-end">
                                        <div className="text-[10px] text-purple-300 font-mono mb-2 uppercase tracking-widest">CONFIDENTIAL REPORT</div>
                                        <div className="text-2xl font-serif text-white">Automation Blueprint: Phase 1</div>
                                    </div>
                                    <div className="p-6 overflow-hidden">
                                        <div className="space-y-4 relative">
                                            {/* Roadmap Line */}
                                            <div className="absolute left-3 top-2 bottom-8 w-px bg-white/10"></div>

                                            <div className="relative pl-10">
                                                <div className="absolute left-2 top-1.5 w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_purple]"></div>
                                                <div className="text-sm font-bold text-white mb-1">Step 1: Make.com CRM Integration</div>
                                                <div className="text-xs text-white/50 leading-relaxed mb-3">Connecting your Zendesk instance to Hubspot using webhooks to prevent manual entry.</div>
                                                <div className="flex gap-2">
                                                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/40 border border-white/10">Complexity: Low</span>
                                                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/40 border border-white/10">Value: High</span>
                                                </div>
                                            </div>

                                            <div className="relative pl-10 opacity-60">
                                                <div className="absolute left-2 top-1.5 w-2 h-2 rounded-full bg-white/20"></div>
                                                <div className="text-sm font-bold text-white mb-1">Step 2: AI Email Triage Agent</div>
                                                <div className="text-xs text-white/50 leading-relaxed">Deploying an LLM to read incoming support tickets and categorize them automatically.</div>
                                            </div>

                                            <div className="relative pl-10 opacity-30">
                                                <div className="absolute left-2 top-1.5 w-2 h-2 rounded-full bg-white/20"></div>
                                                <div className="text-sm font-bold text-white mb-1">Step 3: Auto-Drafting Responses</div>
                                            </div>
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
