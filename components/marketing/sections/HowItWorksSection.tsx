"use client";

import { useState } from "react";
import { useScrollReveal } from "~/hooks/useScrollReveal";
import { howItWorksContent } from "~/data/howItWorksContent";
import SectionBadge from "~/components/marketing/SectionBadge";
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Globe,
  Sparkles,
  FileText,
  CheckCircle2,
} from "lucide-react";

export default function HowItWorksSection() {
  const ref = useScrollReveal();
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="m-section">
      <div className="m-glow-center" />
      <div ref={ref} className="m-container relative z-10">
        <div className="text-center mb-16 flex flex-col items-center">
          <SectionBadge
            label="HOW IT WORKS"
            className="m-reveal mb-5 lg:mb-5"
          />

          <h2
            className="m-reveal m-reveal-delay-1 text-[32px] md:text-[42px] leading-[1.15] font-normal tracking-[-0.03em] text-center mb-5 max-w-2xl mx-auto text-transparent bg-clip-text"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.6) 0%, white 35%, white 65%, rgba(255,255,255,0.5) 100%)",
            }}
          >
            From Audit to Action
            <br className="hidden sm:block" />
            in 3 simple steps
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Steps */}
          <div className="lg:col-span-5 flex flex-col relative space-y-10 pl-8 md:pl-10">
            {/* Continuous faint tracking line */}
            <div className="absolute left-0 top-2 bottom-2 w-[1px] bg-white/5" />

            {howItWorksContent.steps.map((step, index) => {
              const isActive = index === activeStep;
              return (
                <div
                  key={step.number}
                  onClick={() => setActiveStep(index)}
                  className={`relative overflow-visible z-10 flex items-start gap-6 cursor-pointer group m-reveal m-reveal-delay-${index + 1}`}
                >
                  {/* Torch Glow & Active Track Line */}
                  {isActive && (
                    <>
                      {/* Radial light spill */}
                      <div
                        className="absolute left-[-50px] top-1/2 -translate-y-1/2 w-[300px] h-[300px] pointer-events-none -z-10"
                        style={{
                          background:
                            "radial-gradient(circle at left center, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 40%, transparent 70%)",
                        }}
                      />
                      {/* Bright gradient line overlaying the faint track */}
                      <div
                        className="absolute left-[-32px] md:left-[-40px] top-[-10px] bottom-[-10px] w-[1px]"
                        style={{
                          background:
                            "linear-gradient(to bottom, transparent, rgba(255,255,255,0.6), transparent)",
                        }}
                      />
                    </>
                  )}

                  <div
                    className={`relative z-10 flex shrink-0 items-center justify-center w-9 h-9 rounded-lg text-xs font-bold font-mono transition-all duration-500 border ${isActive
                        ? "bg-white text-black border-transparent shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                        : "bg-transparent text-white border-[#3F3F46] group-hover:border-white/30"
                      }`}
                  >
                    {step.number}
                  </div>
                  <div
                    className={`flex flex-col pt-1.5 ml-2 transition-all duration-300 ${isActive ? "opacity-100" : "opacity-40 group-hover:opacity-80"}`}
                  >
                    <h3
                      className={`text-[19px] font-medium mb-2 tracking-tight ${isActive ? "text-white" : "text-white/70"}`}
                    >
                      {step.title}
                    </h3>
                    <p
                      className={`text-[15px] font-light leading-[1.65] max-w-[380px] ${isActive ? "text-white/60" : "text-white/40"}`}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Dynamic Mockup */}
          <div
            className="lg:col-span-7 m-reveal m-reveal-delay-3"
            style={{ perspective: "1000px" }}
          >
            <div
              className="w-full relative rounded-xl overflow-hidden bg-[#0a0a0a] border border-white/[0.08] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] transition-transform duration-700 hover:rotate-0"
              style={{
                transform: "rotateY(-4deg) rotateX(2deg)",
              }}
            >
              {/* Browser Chrome */}
              <div className="bg-[#0f0f0f] px-4 py-3 flex items-center justify-between border-b border-white/[0.04] relative">
                {/* Mac window controls */}
                <div className="flex items-center gap-1.5 opacity-80">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-black/20" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-black/20" />
                  <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-black/20" />
                </div>

                {/* Centered URL Bar */}
                <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-[260px]">
                  <div className="bg-white/[0.03] border border-white/[0.04] shadow-inner rounded-md px-4 py-1.5 text-white/40 text-[11px] font-mono flex items-center justify-center gap-2">
                    <div className="w-3.5 h-3.5 bg-gradient-to-br from-[#4F7CFF] to-[#2b5ae2] shadow-sm rounded-sm flex items-center justify-center text-[8px] font-bold text-white">
                      A
                    </div>
                    <span className="truncate">
                      {howItWorksContent.mockup.url}
                    </span>
                  </div>
                </div>

                {/* Right side navigation icons */}
                <div className="flex items-center gap-3 opacity-50">
                  <ChevronLeft className="w-4 h-4 text-white" />
                  <ChevronRight className="w-4 h-4 text-white/50" />
                  <RotateCw className="w-3.5 h-3.5 text-white" />
                </div>
              </div>

              {/* Dynamic Presentation Area */}
              <div className="relative p-8 md:p-14 min-h-[420px] flex items-center justify-center bg-[#050505] overflow-hidden">
                {/* Subtle Grid */}
                <div
                  className="absolute inset-0 opacity-[0.2]"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                  }}
                />

                {/* Step 0 Content */}
                <div
                  className={`absolute transition-all duration-700 flex flex-col items-center w-full max-w-sm ${activeStep === 0 ? "opacity-100 scale-100 translate-y-0 z-10" : "opacity-0 scale-95 translate-y-4 pointer-events-none z-0"}`}
                >
                  <div className="relative w-full">
                    {/* Glowing backlight */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-purple-500/0 rounded-3xl blur-xl opacity-50" />

                    <div className="relative border border-white/[0.08] bg-black/80 backdrop-blur-xl rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                      <div className="w-12 h-12 bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-xl flex items-center justify-center mb-6 shadow-inner">
                        <Sparkles className="w-5 h-5 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                      </div>
                      <h4 className="text-white font-medium mb-1.5 text-lg">
                        Connect your business
                      </h4>
                      <p className="text-[13px] text-white/50 mb-8 leading-relaxed">
                        Let our top-tier AI agents silently analyze your core
                        workflows and tech stack in seconds.
                      </p>

                      <div className="relative group/input">
                        <label className="text-[10px] text-white/30 uppercase tracking-widest font-semibold mb-2 block ml-1">
                          System Access URL
                        </label>
                        <div className="w-full bg-[#050505] border border-blue-500/30 rounded-xl px-4 py-3.5 flex items-center shadow-[inset_0_2px_8px_rgba(0,0,0,0.8),0_0_15px_rgba(59,130,246,0.15)] transition-all">
                          <Globe className="w-4 h-4 text-blue-400/80 mr-3" />
                          <span className="text-white/80 tracking-wide text-[13px] font-mono">
                            {howItWorksContent.mockup.inputPlaceholder}
                          </span>
                          <div className="w-[1.5px] h-4 bg-blue-400 ml-1.5 animate-pulse shadow-[0_0_4px_rgba(59,130,246,1)]" />
                        </div>

                        {/* Simulated Cursor */}
                        <div className="absolute -bottom-4 right-10 flex flex-col items-center">
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="drop-shadow-lg text-white"
                          >
                            <path
                              d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 01.35-.15h6.87c.45 0 .67-.54.35-.85L6.35 2.86a.5.5 0 00-.85.35z"
                              fill="currentColor"
                            />
                          </svg>
                          <div className="bg-blue-500 rounded-full px-2 py-0.5 text-[9px] font-bold mt-1 text-white whitespace-nowrap shadow-lg">
                            Scan Now
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 1 Content */}
                <div
                  className={`absolute transition-all duration-700 flex flex-col items-center w-full max-w-sm ${activeStep === 1 ? "opacity-100 scale-100 translate-y-0 z-10" : "opacity-0 scale-95 translate-y-4 pointer-events-none z-0"}`}
                >
                  <div className="relative w-full">
                    {/* Glowing backlight */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/20 to-teal-500/0 rounded-3xl blur-xl opacity-50" />

                    <div className="relative border border-white/[0.08] bg-black/80 backdrop-blur-xl rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col items-center">
                      <div className="relative w-32 h-32 mb-8 flex justify-center items-center">
                        {/* Scanning background glow */}
                        <div className="absolute inset-0 bg-emerald-500/5 rounded-full blur-[30px] animate-pulse" />

                        {/* Outer thick ring (static) */}
                        <svg
                          className="absolute w-full h-full transform -rotate-90 opacity-20"
                          viewBox="0 0 100 100"
                        >
                          <circle
                            cx="50"
                            cy="50"
                            r="46"
                            fill="none"
                            strokeWidth="1.5"
                            className="stroke-white"
                          />
                        </svg>

                        {/* Inner segmented rotating ring */}
                        <svg
                          className="absolute w-[80%] h-[80%] transform animate-[spin_6s_linear_infinite] opacity-30"
                          viewBox="0 0 100 100"
                        >
                          <circle
                            cx="50"
                            cy="50"
                            r="46"
                            fill="none"
                            strokeWidth="2"
                            strokeDasharray="10 20"
                            strokeLinecap="round"
                            className="stroke-emerald-300"
                          />
                        </svg>

                        {/* Main Animated Green Ring */}
                        <svg
                          className="absolute w-full h-full transform -rotate-90"
                          viewBox="0 0 100 100"
                        >
                          <circle
                            cx="50"
                            cy="50"
                            r="46"
                            fill="none"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeDasharray="289"
                            strokeDashoffset={activeStep === 1 ? "60" : "289"}
                            className="stroke-emerald-400 transition-all duration-[2.5s] ease-[cubic-bezier(0.22,1,0.36,1)] drop-shadow-[0_0_12px_rgba(52,211,153,0.5)]"
                          />
                        </svg>

                        {/* Percentage */}
                        <div className="absolute inset-0 flex items-center justify-center flex-col z-10">
                          <span className="text-4xl font-extralight text-white tracking-tighter drop-shadow-md">
                            {howItWorksContent.mockup.scanningPercentage}
                          </span>
                        </div>
                      </div>

                      <div className="text-[10px] text-emerald-400 uppercase tracking-[0.25em] font-semibold animate-pulse mb-6 border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 rounded-full backdrop-blur-sm">
                        {howItWorksContent.mockup.scanningText}
                      </div>

                      {/* Simulated loading bars - Mac Terminal Style */}
                      <div className="w-full bg-[#050505] border border-white/[0.04] rounded-xl p-4 shadow-inner space-y-4 font-mono">
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-md bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between text-[10px] text-white/50 mb-1.5">
                              <span>Analyzing data schemas...</span>
                              <span className="text-emerald-400">100%</span>
                            </div>
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full w-full bg-gradient-to-r from-emerald-600 to-emerald-400" />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-md bg-blue-500/10 flex items-center justify-center border border-blue-500/20 relative overflow-hidden">
                            <div className="absolute inset-0 bg-blue-500/20 animate-ping opacity-50" />
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-sm animate-pulse relative z-10" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between text-[10px] text-white/50 mb-1.5">
                              <span>Mapping workflow bottlenecks...</span>
                              <span className="text-blue-400 animate-pulse">
                                45%
                              </span>
                            </div>
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full w-[45%] bg-gradient-to-r from-blue-600 to-blue-400 relative">
                                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/50" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2 Content */}
                <div
                  className={`absolute transition-all duration-700 flex flex-col items-center w-full max-w-sm ${activeStep === 2 ? "opacity-100 scale-100 translate-y-0 z-10" : "opacity-0 scale-95 translate-y-4 pointer-events-none z-0"}`}
                >
                  <div className="relative w-full">
                    {/* Glowing backlight */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/0 via-amber-500/20 to-orange-500/0 rounded-3xl blur-xl opacity-50" />

                    <div className="relative border border-white/[0.08] bg-black/80 backdrop-blur-xl rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                      <div className="flex justify-between items-start mb-6 border-b border-white/[0.05] pb-6">
                        <div>
                          <div className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-1.5 flex items-center gap-1.5">
                            <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                            System Maturity
                          </div>
                          <div className="text-5xl font-extralight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50 tracking-tight flex items-baseline gap-1">
                            82
                            <span className="text-xl text-white/20 font-light">
                              /100
                            </span>
                          </div>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-2xl flex items-center justify-center shadow-lg">
                          <FileText className="w-5 h-5 text-white/80" />
                        </div>
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-3">
                          High-Impact Automations
                        </div>

                        <div className="flex items-center justify-between p-3.5 rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-transparent relative overflow-hidden group/item">
                          <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                          <div className="flex items-center gap-3 relative z-10">
                            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                            </div>
                            <span className="text-[13px] text-emerald-50 font-medium">
                              CRM Data Entry
                            </span>
                          </div>
                          <span className="text-[11px] px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/20 relative z-10 shadow-[0_0_10px_rgba(52,211,153,0.2)]">
                            +$12k/yr
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-default">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                              <RotateCw className="w-3.5 h-3.5 text-white/40" />
                            </div>
                            <span className="text-[13px] text-white/70">
                              Lead Routing
                            </span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded border border-white/10 text-white/50 font-medium tracking-wide">
                            Low Effort
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button className="w-full bg-white text-black text-xs font-semibold py-3.5 rounded-xl hover:bg-gray-100 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.15)] flex justify-center items-center gap-2">
                        View Full Blueprint <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
