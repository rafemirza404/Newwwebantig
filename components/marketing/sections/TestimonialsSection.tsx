"use client";

import { useScrollReveal } from "~/hooks/useScrollReveal";
import Image from "next/image";

const testimonials = [
  {
    quote: (
      <>
        We found{" "}
        <span className="text-[#a855f7] font-medium">
          $68K in annual savings
        </span>{" "}
        we had no idea existed. The audit took 8 minutes and the report was more
        detailed than anything a consultant delivered in weeks.
      </>
    ),
    name: "Sarah Chen",
    title: "COO, GreenTech Solutions",
    avatar: "https://i.pravatar.cc/100?img=1",
    logo: (
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
        GREENTECH
      </span>
    ),
  },
  {
    quote: (
      <>
        As an agency, we now offer AI operations audits as a new service line.
        The branded reports look like we spent days creating them.{" "}
        <span className="text-[#a855f7] font-medium">Game changer</span> for
        client retention.
      </>
    ),
    name: "Marcus Johnson",
    title: "Founder, Apex Digital Agency",
    avatar: "https://i.pravatar.cc/100?img=11",
    logo: (
      <div className="flex items-center gap-1.5 opacity-40">
        <div className="grid grid-cols-2 gap-[1px]">
          <div className="w-[3px] h-[3px] bg-white rounded-sm" />
          <div className="w-[3px] h-[3px] bg-white rounded-sm" />
          <div className="w-[3px] h-[3px] bg-white rounded-sm" />
          <div className="w-[3px] h-[3px] bg-white rounded-sm" />
        </div>
        <span className="text-[12px] font-bold text-white tracking-wide">
          Apex
        </span>
      </div>
    ),
  },
  {
    quote: (
      <>
        The gap analysis was eye-opening. We were spending{" "}
        <span className="text-[#a855f7] font-medium">15 hours a week</span> on
        customer onboarding that could be fully automated. The ROI was
        immediate.
      </>
    ),
    name: "Priya Patel",
    title: "Operations Manager, CloudScale Inc",
    avatar: "https://i.pravatar.cc/100?img=5",
    logo: (
      <div className="grid grid-cols-2 gap-0.5 opacity-30">
        <div className="w-2.5 h-3 bg-white" />
        <div className="w-2.5 h-3 bg-white" />
        <div className="w-2.5 h-3 bg-white" />
        <div className="w-2.5 h-3 bg-white" />
      </div>
    ),
  },
];

export default function TestimonialsSection() {
  const ref = useScrollReveal();

  return (
    <section className="m-section relative overflow-hidden py-24">
      <div
        ref={ref}
        className="m-container relative z-10 w-full max-w-[1080px] mx-auto"
      >
        <div className="text-center mb-16 flex flex-col items-center">
          {/* Testimonials Pill */}
          <div className="m-reveal mb-8 px-4 py-1.5 rounded-full border border-[#a855f7]/30 bg-[#a855f7]/[0.03] shadow-[0_0_15px_rgba(168,85,247,0.1)]">
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#a855f7]">
              TESTIMONIALS
            </span>
          </div>

          {/* Main Title - Matches Reference Exactly */}
          <h2
            className="m-reveal m-reveal-delay-1 text-[32px] md:text-[42px] leading-[1.15] font-normal tracking-[-0.03em] text-center mb-5 max-w-2xl mx-auto text-transparent bg-clip-text"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.6) 0%, white 35%, white 65%, rgba(255,255,255,0.5) 100%)",
            }}
          >
            Trusted by founders at fast-growing
            <br />
            companies
          </h2>

          {/* Subtitle */}
          <p className="m-reveal m-reveal-delay-2 text-[15px] text-white/40 max-w-xl mx-auto font-light">
            Companies switch to AgentBlue because we focus on results, not just
            data.
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="grid md:grid-cols-3 gap-5 lg:gap-6">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className={`m-reveal m-reveal-delay-${i + 1
                } flex flex-col justify-between rounded-xl p-6 lg:p-7 bg-[#0a0a0a] border border-white/[0.04] shadow-lg`}
            >
              <p className="text-[14px] text-white/70 leading-[1.65] font-light mb-8">
                {t.quote}
              </p>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-white/5 border border-white/10">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-white/95">
                      {t.name}
                    </h4>
                    <p className="text-[11px] text-white/40 mt-0.5">
                      {t.title}
                    </p>
                  </div>
                </div>

                {/* dynamic simple logos from reference */}
                <div className="flex-shrink-0 ml-2">{t.logo}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
