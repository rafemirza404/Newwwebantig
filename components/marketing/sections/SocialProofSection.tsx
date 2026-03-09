"use client";

import { useScrollReveal } from "~/hooks/useScrollReveal";

const stats = [
  { value: "8", label: "Functions Analyzed" },
  { value: "<10 min", label: "Audit Time" },
  { value: "$42K", label: "Avg. Savings Found" },
  { value: "7", label: "AI Agents Working" },
];

export default function SocialProofSection() {
  const ref = useScrollReveal();

  return (
    <section className="relative mt-24 mb-12">
      {/* Top border glow */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div ref={ref} className="w-full relative z-10 pt-8 pb-12">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 px-4 max-w-6xl mx-auto">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`m-reveal m-reveal-delay-${i + 1} relative group overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 border border-white/[0.08] group-hover:border-white/[0.15] rounded-2xl transition-colors duration-500" />

              <div className="relative flex flex-col items-center justify-center p-8 bg-[#050505] rounded-2xl h-full">
                {/* Top highlight on hover */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="text-[36px] md:text-[44px] font-light text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-3 tracking-tight">
                  {s.value}
                </div>
                <div className="text-[11px] md:text-[12px] uppercase tracking-[0.15em] font-medium text-white/40 text-center max-w-[140px] leading-relaxed">
                  {s.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
