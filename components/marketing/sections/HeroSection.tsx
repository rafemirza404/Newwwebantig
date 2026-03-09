"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Sparkles,
  RotateCw,
  ChevronRight,
  Zap,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { heroContent } from "~/data/heroContent";

/* ─── Animated Counter Hook ─── */
function useCounter(end: number, duration = 1800, delay = 0) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      let start = 0;
      const step = end / (duration / 16);
      const interval = setInterval(() => {
        start += step;
        if (start >= end) {
          setCount(end);
          clearInterval(interval);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [end, duration, delay]);
  return count;
}

/* ─── Toast notifications that cycle ─── */
const TOASTS = [
  {
    icon: Zap,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    text: "New gap detected in Marketing",
    sub: "Email follow-up automation",
  },
  {
    icon: TrendingUp,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    text: "ROI estimate updated",
    sub: "CRM automation → +$12,400/yr",
  },
  {
    icon: AlertCircle,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    text: "Sales scan complete",
    sub: "4 automation opportunities found",
  },
];

export default function HeroSection() {
  const gapCount = useCounter(14, 1600, 800);
  const savingsCount = useCounter(38, 1800, 1000);
  const scoreCount = useCounter(82, 2000, 1200);

  const [toastIndex, setToastIndex] = useState(0);
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    // First toast appears after 2.5s
    const firstTimer = setTimeout(() => setToastVisible(true), 2500);
    // Cycle toasts every 4s
    const cycleInterval = setInterval(() => {
      setToastVisible(false);
      setTimeout(() => {
        setToastIndex((prev) => (prev + 1) % TOASTS.length);
        setToastVisible(true);
      }, 500);
    }, 4000);
    return () => {
      clearTimeout(firstTimer);
      clearInterval(cycleInterval);
    };
  }, []);

  const currentToast = TOASTS[toastIndex];
  const ToastIcon = currentToast.icon;

  return (
    <section className="relative min-h-[85vh] flex items-center pt-24 pb-12 overflow-hidden text-white">
      <div className="container mx-auto max-w-7xl px-4 md:px-6 relative z-10 w-full pl-8 lg:pl-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-4 items-center">
          {/* ── Left Column (UNTOUCHED) ── */}
          <div className="flex flex-col space-y-4 max-w-xl py-6">
            <h1
              className="text-[36px] md:text-[46px] lg:text-[54px] font-light tracking-[-0.03em] leading-[1.07] mb-1"
              style={{
                animation:
                  "m-hero-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s both",
              }}
            >
              <span className="block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white/70 to-white/80">
                  Find{" "}
                </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/90">
                  Automation{" "}
                </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white/90 to-white/70">
                  Gaps
                </span>
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/20">
                Costing You Thousands
              </span>
            </h1>

            <p
              className="text-[16px] md:text-[18px] font-medium text-white/70 leading-snug"
              style={{
                animation:
                  "m-hero-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.22s both",
              }}
            >
              {heroContent.subtitle}
            </p>

            <p
              className="text-[14px] md:text-[15px] text-white/55 font-normal max-w-md leading-relaxed"
              style={{
                animation:
                  "m-hero-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.32s both",
              }}
            >
              {heroContent.paragraph}
            </p>

            <ul
              className="space-y-2.5 pt-1"
              style={{
                animation:
                  "m-hero-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.42s both",
              }}
            >
              {heroContent.checklist.map((item, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2.5 text-white/50"
                >
                  <CheckCircle2
                    strokeWidth={1.5}
                    className="w-[16px] h-[16px] text-[#10B981] flex-shrink-0"
                  />
                  <span className="text-[13px] md:text-[14px] font-normal">
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            <div
              className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-3"
              style={{
                animation:
                  "m-hero-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.52s both",
              }}
            >
              <Link
                href="/signup"
                className="w-full sm:w-auto bg-white hover:bg-white/90 text-black px-6 py-2.5 rounded-full font-semibold text-[13px] text-center transition-all duration-200"
              >
                Start Free Audit
              </Link>
              <Link
                href="/demo"
                className="w-full sm:w-auto bg-transparent hover:bg-white/[0.04] border border-white/20 text-white px-6 py-2.5 rounded-full font-semibold text-[13px] text-center transition-all duration-200"
              >
                Book a Demo
              </Link>
            </div>

            <p
              className="text-[12px] text-white/30 font-normal pt-1"
              style={{
                animation:
                  "m-hero-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.62s both",
              }}
            >
              {heroContent.microcopy}
            </p>
          </div>

          {/* ── Right Column: Animated Dashboard Mockup ── */}
          <div
            className="relative w-full flex items-center justify-center lg:justify-end xl:pl-8 py-6"
            style={{ perspective: "1000px" }}
          >
            {/* Inline keyframes */}
            <style
              dangerouslySetInnerHTML={{
                __html: `
              @keyframes hero-dash-in { 0% { opacity: 0; transform: translateY(12px); } 100% { opacity: 1; transform: translateY(0); } }
              @keyframes hero-scan-line { 0% { top: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
              @keyframes hero-bar-fill { 0% { width: 0%; } 100% { width: var(--bar-w); } }
              @keyframes hero-shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
              @keyframes hero-cursor-float { 0%, 100% { transform: translate(0, 0); } 25% { transform: translate(4px, -6px); } 50% { transform: translate(-2px, 3px); } 75% { transform: translate(6px, 2px); } }
              @keyframes hero-glow-pulse { 0%, 100% { opacity: 0.25; } 50% { opacity: 0.55; } }
              @keyframes hero-toast-in { 0% { opacity: 0; transform: translateX(20px) scale(0.95); } 100% { opacity: 1; transform: translateX(0) scale(1); } }
              @keyframes hero-toast-out { 0% { opacity: 1; transform: translateX(0) scale(1); } 100% { opacity: 0; transform: translateX(20px) scale(0.95); } }
              @keyframes hero-particle-float { 0% { opacity: 0; transform: translateY(0) scale(0); } 20% { opacity: 1; transform: scale(1); } 80% { opacity: 0.6; } 100% { opacity: 0; transform: translateY(-80px) scale(0.3); } }
              @keyframes hero-ring-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `,
              }}
            />

            {/* Ambient glow behind dashboard */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ animation: "hero-glow-pulse 4s ease-in-out infinite" }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[60%] bg-blue-500/10 rounded-full blur-[80px]" />
            </div>

            {/* Floating data particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[
                { left: "15%", bottom: "20%", delay: "0s", dur: "3s" },
                { left: "75%", bottom: "30%", delay: "1s", dur: "3.5s" },
                { left: "45%", bottom: "10%", delay: "2s", dur: "4s" },
                { left: "85%", bottom: "50%", delay: "0.5s", dur: "3.2s" },
                { left: "25%", bottom: "40%", delay: "1.5s", dur: "3.8s" },
                { left: "60%", bottom: "15%", delay: "2.5s", dur: "3.3s" },
              ].map((p, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-blue-400/60"
                  style={{
                    left: p.left,
                    bottom: p.bottom,
                    animation: `hero-particle-float ${p.dur} ease-out ${p.delay} infinite`,
                  }}
                />
              ))}
            </div>

            <div
              className="w-full max-w-[520px] rounded-xl overflow-visible bg-[#0a0a0a] border border-white/[0.08] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] relative"
              style={{ transform: "rotateY(-4deg) rotateX(2deg)" }}
            >
              {/* Browser Chrome */}
              <div className="bg-[#0f0f0f] px-4 py-3 flex items-center justify-between border-b border-white/[0.04] rounded-t-xl">
                <div className="flex items-center gap-1.5 opacity-80">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-black/20" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-black/20" />
                  <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-black/20" />
                </div>
                <div className="flex-1 mx-6">
                  <div className="bg-white/[0.03] border border-white/[0.04] rounded-md px-3 py-1.5 text-white/35 text-[11px] font-mono flex items-center gap-2">
                    <div className="w-3 h-3 bg-gradient-to-br from-[#4F7CFF] to-[#2b5ae2] rounded-sm flex items-center justify-center text-[7px] font-bold text-white flex-shrink-0">
                      A
                    </div>
                    <span className="truncate">app.agentblue.ai/dashboard</span>
                    {/* Loading spinner in URL bar */}
                    <div
                      className="ml-auto w-3 h-3 border border-blue-400/40 border-t-blue-400 rounded-full flex-shrink-0"
                      style={{ animation: "hero-ring-spin 1s linear infinite" }}
                    />
                  </div>
                </div>
                <RotateCw className="w-3.5 h-3.5 text-white/30" />
              </div>

              {/* Dashboard Content */}
              <div className="relative bg-[#050505] overflow-hidden rounded-b-xl">
                {/* Subtle grid */}
                <div
                  className="absolute inset-0 opacity-[0.15]"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                  }}
                />

                {/* Scanning line sweep */}
                <div
                  className="absolute left-0 right-0 h-[1px] z-20 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.6) 50%, transparent 100%)",
                    boxShadow: "0 0 12px 2px rgba(59,130,246,0.3)",
                    animation: "hero-scan-line 3.5s ease-in-out infinite",
                  }}
                />

                <div className="relative z-10 p-5 space-y-3">
                  {/* Top stat row — LIVE COUNTERS */}
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      {
                        label: "Gaps Found",
                        value: gapCount,
                        suffix: "",
                        prefix: "",
                        color: "text-white",
                        delay: "0.3s",
                      },
                      {
                        label: "Est. Savings",
                        value: savingsCount,
                        prefix: "$",
                        suffix: "k/yr",
                        color: "text-emerald-400",
                        delay: "0.5s",
                      },
                      {
                        label: "Audit Score",
                        value: scoreCount,
                        prefix: "",
                        suffix: "/100",
                        color: "text-blue-400",
                        delay: "0.7s",
                      },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3"
                        style={{
                          animation: `hero-dash-in 0.6s ease-out ${stat.delay} both`,
                        }}
                      >
                        <div className="text-[10px] text-white/35 mb-1.5 font-medium tracking-wide">
                          {stat.label}
                        </div>
                        <div
                          className={`text-[18px] font-semibold tracking-tight ${stat.color} tabular-nums`}
                        >
                          {stat.prefix}
                          {stat.value}
                          {stat.suffix && (
                            <span className="text-[13px] text-white/20 font-normal ml-0.5">
                              {stat.suffix}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Main card: High-Impact Automations */}
                  <div
                    className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4"
                    style={{
                      animation: "hero-dash-in 0.6s ease-out 0.9s both",
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-[10px] text-white/40 uppercase tracking-[0.15em] font-semibold">
                        High-Impact Automations
                      </div>
                      <div className="text-[9px] text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                        Live
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      {[
                        {
                          name: "CRM Data Entry",
                          impact: "+$12k/yr",
                          bar: 90,
                          barColor: "from-emerald-600 to-emerald-400",
                          textColor: "text-emerald-400",
                          delay: "1.1s",
                        },
                        {
                          name: "Email Follow-up",
                          impact: "+$9k/yr",
                          bar: 68,
                          barColor: "from-blue-600 to-blue-400",
                          textColor: "text-blue-400",
                          delay: "1.3s",
                        },
                        {
                          name: "Lead Routing",
                          impact: "+$7k/yr",
                          bar: 52,
                          barColor: "from-purple-600 to-purple-400",
                          textColor: "text-purple-400",
                          delay: "1.5s",
                        },
                      ].map((item) => (
                        <div
                          key={item.name}
                          className="flex items-center gap-3"
                          style={{
                            animation: `hero-dash-in 0.5s ease-out ${item.delay} both`,
                          }}
                        >
                          <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-3 h-3 text-white/40" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between text-[11px] mb-1">
                              <span className="text-white/70 font-medium">
                                {item.name}
                              </span>
                              <span
                                className={`${item.textColor} font-semibold`}
                              >
                                {item.impact}
                              </span>
                            </div>
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden relative">
                              <div
                                className={`h-full rounded-full bg-gradient-to-r ${item.barColor} relative overflow-hidden`}
                                style={
                                  {
                                    "--bar-w": `${item.bar}%`,
                                    width: 0,
                                    animation: `hero-bar-fill 1.2s ease-out ${item.delay} forwards`,
                                  } as React.CSSProperties
                                }
                              >
                                <div
                                  className="absolute inset-0 w-[50%] bg-gradient-to-r from-transparent via-white/25 to-transparent"
                                  style={{
                                    animation:
                                      "hero-shimmer 2s ease-in-out infinite 2s",
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom row */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div
                      className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3.5"
                      style={{
                        animation: "hero-dash-in 0.6s ease-out 1.7s both",
                      }}
                    >
                      <div className="text-[10px] text-white/35 uppercase tracking-[0.12em] font-semibold mb-2">
                        Functions Scanned
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {[
                          { name: "Marketing", done: true },
                          { name: "Sales", done: true },
                          { name: "Operations", done: false },
                        ].map((fn) => (
                          <div
                            key={fn.name}
                            className="flex items-center gap-1.5"
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${fn.done ? "bg-emerald-400" : "bg-blue-400 animate-pulse"}`}
                            />
                            <span
                              className={`text-[11px] ${fn.done ? "text-white/55" : "text-blue-300/70"}`}
                            >
                              {fn.name}
                              {!fn.done && (
                                <span className="ml-1 text-[9px] text-blue-400 animate-pulse">
                                  scanning...
                                </span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div
                      className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3.5 flex flex-col justify-between"
                      style={{
                        animation: "hero-dash-in 0.6s ease-out 1.9s both",
                      }}
                    >
                      <div className="text-[10px] text-white/35 uppercase tracking-[0.12em] font-semibold mb-2">
                        Your Blueprint
                      </div>
                      <p className="text-[11px] text-white/50 leading-relaxed mb-3">
                        8 workflows mapped with ROI estimates ready.
                      </p>
                      <button className="w-full bg-white text-black text-[10px] font-semibold py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-1">
                        View Report <ChevronRight className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Simulated Cursor with "Scan Now" label */}
              <div
                className="absolute bottom-16 right-10 z-30 pointer-events-none"
                style={{
                  animation: "hero-cursor-float 5s ease-in-out infinite",
                }}
              >
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
                <div className="bg-blue-500 rounded-full px-2.5 py-0.5 text-[9px] font-bold mt-0.5 text-white whitespace-nowrap shadow-[0_0_12px_rgba(59,130,246,0.5)]">
                  Scan Now
                </div>
              </div>

              {/* ── Live Toast Notification ── */}
              <div
                className={`absolute -top-3 -right-4 z-40 transition-all duration-500 ${toastVisible ? "opacity-100 translate-x-0 scale-100" : "opacity-0 translate-x-4 scale-95 pointer-events-none"}`}
              >
                <div
                  className={`flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl border ${currentToast.bg} backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] max-w-[240px]`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    <ToastIcon
                      className={`w-3.5 h-3.5 ${currentToast.color}`}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] text-white/85 font-medium leading-tight">
                      {currentToast.text}
                    </div>
                    <div className="text-[10px] text-white/40 mt-0.5 leading-tight">
                      {currentToast.sub}
                    </div>
                  </div>
                  <div className="text-[9px] text-white/25 flex-shrink-0 mt-0.5">
                    now
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
