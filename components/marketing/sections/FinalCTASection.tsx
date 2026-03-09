"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Layout,
  Search,
  BarChart3,
  Activity,
} from "lucide-react";
import { useScrollReveal } from "~/hooks/useScrollReveal";

export default function FinalCTASection() {
  const ref = useScrollReveal();

  return (
    <section className="relative w-full pt-12 pb-24 md:pb-32 overflow-hidden">
      {/* Faded Dashboard Graphic matching reference */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1050px] pointer-events-none select-none opacity-[0.35]">
        <div
          className="w-full h-[500px] p-6 border border-white/[0.04] bg-[#050505] rounded-t-2xl flex flex-col gap-4 mt-8"
          style={{
            maskImage:
              "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)",
          }}
        >
          {/* Top Bar Fake */}
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Layout className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-white/60 text-sm font-medium">
                AgentBlue Dashboard
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 h-8 rounded-lg bg-white/[0.02] border border-white/[0.05]" />
              <div className="w-8 h-8 rounded-full bg-white/[0.05]" />
            </div>
          </div>

          {/* Grid Fake - 4 Cards */}
          <div className="grid grid-cols-4 gap-5 mt-2">
            {[
              {
                label: "Tasks Automated",
                val: "14,020",
                change: "+12.5%",
                color: "text-emerald-500",
                path: "M0,30 C20,10 40,20 60,10 80,15 100,5",
              },
              {
                label: "Hours Saved",
                val: "2,450",
                change: "+8.2%",
                color: "text-blue-500",
                path: "M0,35 C20,35 40,25 60,28 80,15 100,10",
              },
              {
                label: "Operating Margin",
                val: "34.2%",
                change: "+4.1%",
                color: "text-emerald-500",
                path: "M0,25 C30,20 50,30 70,15 90,20 100,5",
              },
              {
                label: "Error Reduction",
                val: "99.8%",
                change: "-2.3%",
                color: "text-purple-500",
                path: "M0,10 C20,15 40,5 60,20 80,10 100,5",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="h-44 rounded-xl border border-white/[0.04] bg-white/[0.015] p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-white/40 text-[11px] font-medium uppercase tracking-wider">
                      {stat.label}
                    </span>
                    <span className="text-white/40 text-[10px]">30 Days</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-white/90 text-2xl font-semibold">
                      {stat.val}
                    </span>
                    <span
                      className={`${stat.color} text-[11px] font-medium mb-1`}
                    >
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className="w-full h-12 mt-auto opacity-40">
                  <svg
                    className="w-full h-full"
                    preserveAspectRatio="none"
                    viewBox="0 0 100 40"
                  >
                    <path
                      d={stat.path}
                      stroke="currentColor"
                      fill="none"
                      className={stat.color}
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        ref={ref}
        className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1200px] relative z-10 flex flex-col items-center text-center mt-40 md:mt-52"
      >
        <h2
          className="m-reveal m-reveal-delay-1 text-[44px] md:text-[56px] lg:text-[64px] leading-[1.1] font-normal tracking-[-0.03em] text-center mb-6 max-w-4xl z-20 text-transparent bg-clip-text"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.6) 0%, white 35%, white 65%, rgba(255,255,255,0.5) 100%)",
          }}
        >
          Ready to optimize your
          <br />
          AI Operations?
        </h2>

        <p className="text-[16px] md:text-[18px] text-[#A1A1AA] mt-2 mb-12 m-reveal m-reveal-delay-2 max-w-2xl font-normal leading-relaxed z-20">
          Identify your gaps, benchmark against competitors, and start
          implementing immediate workflow optimizations today.
        </p>

        <div className="flex justify-center w-full mb-14 m-reveal m-reveal-delay-3 z-20 block">
          <ul className="flex flex-col gap-4 text-[#A1A1AA] text-[15px] font-normal tracking-wide text-left inline-block">
            <li className="flex items-center gap-3">
              <CheckCircle2
                className="w-[18px] h-[18px] text-[#888888] shrink-0"
                strokeWidth={1.5}
              />
              <span>
                See your current AI maturity score across all departments
              </span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2
                className="w-[18px] h-[18px] text-[#888888] shrink-0"
                strokeWidth={1.5}
              />
              <span>
                Get 3 specific recommendations to improve your workflows
              </span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2
                className="w-[18px] h-[18px] text-[#888888] shrink-0"
                strokeWidth={1.5}
              />
              <span>
                Learn which competitors are outranking your margins and why
              </span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 m-reveal m-reveal-delay-4 w-full sm:w-auto z-20">
          <Link
            href="/signup"
            className="w-full sm:w-auto min-w-[160px] px-6 py-3.5 bg-white hover:bg-[#f2f2f2] text-black text-[15px] font-semibold rounded-[12px] flex items-center justify-center transition-colors duration-200"
          >
            Start Free Trial
          </Link>
          <Link
            href="/contact"
            className="w-full sm:w-auto min-w-[160px] px-6 py-3.5 bg-transparent border border-white/20 hover:bg-white/[0.05] text-white text-[15px] font-medium rounded-[12px] transition-colors duration-200 flex items-center justify-center"
          >
            Book a Demo
          </Link>
        </div>

        {/* Crisp little chat widget mock matching the reference bottom right */}
        <div className="absolute bottom-6 right-6 m-reveal m-reveal-delay-5 hidden md:block">
          <div className="w-10 h-10 bg-white rounded flex items-center justify-center shadow-lg cursor-pointer">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-[22px] h-[22px] text-black translate-y-[1px]"
            >
              <path
                d="M4 10C4 10 4 18 12 18C20 18 20 10 20 10"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
