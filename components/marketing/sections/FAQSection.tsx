"use client";

import { useState } from "react";
import Link from "next/link";
import { useScrollReveal } from "~/hooks/useScrollReveal";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "What kind of businesses is this for?",
    a: "AgentBlue works for any business with 5+ employees that uses manual processes. We analyze 8 core functions: Sales, Marketing, Customer Success, Operations, Finance, HR, IT, and Product — so whether you're a SaaS startup, e-commerce brand, agency, or service business, the audit will find optimization opportunities.",
  },
  {
    q: "How does the AI audit work?",
    a: "You answer a series of targeted questions about your operations — it takes under 10 minutes. Then 7 specialized AI agents analyze your answers simultaneously: they profile your business, detect automation gaps, map solutions, calculate ROI, generate before/after visualizations, build a prioritized roadmap, and compile everything into a comprehensive report.",
  },
  {
    q: "What do I get in the report?",
    a: "Your report includes: an AI Maturity Score across 8 functions, a detailed gap analysis with severity ratings and cost estimates, specific automation solutions with tool recommendations, ROI projections for each solution, before/after workflow diagrams, and a prioritized implementation roadmap organized by quick wins, medium-term, and strategic initiatives.",
  },
  {
    q: "How long does the audit take?",
    a: "The conversation takes under 10 minutes. The AI analysis happens in seconds. You get your full report immediately after completing the audit questions.",
  },
  {
    q: "Is this for agencies or direct businesses?",
    a: "Both! Business owners can audit their own operations directly. Agencies and consultants get a dedicated portal to manage multiple client audits, generate branded reports, and track implementation progress across their entire client base.",
  },
  {
    q: "What's the pricing?",
    a: "We offer a free tier with one audit, Pro plans for individuals starting at $29/month, and Agency plans starting at $99/month. Enterprise pricing is available for larger organizations. All paid plans come with a 7-day free trial.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const ref = useScrollReveal();

  return (
    <section className="m-section">
      <div className="m-glow-left" style={{ top: "30%" }} />

      <div ref={ref} className="m-container relative z-10">
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
          <div className="lg:col-span-2 m-reveal">
            <div className="lg:sticky lg:top-24">
              <span className="m-pill mb-6 inline-flex">FAQ</span>
              <h2
                className="mb-4 text-[32px] md:text-[42px] leading-[1.15] font-normal tracking-[-0.03em] text-left text-transparent bg-clip-text"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, white 0%, white 40%, rgba(255,255,255,0.5) 100%)",
                }}
              >
                Frequently Asked
                <br />
                Questions
              </h2>
              <p className="m-body-sm mb-8">
                Have more questions? Book a demo and we&apos;ll answer them
                personally.
              </p>
              <Link
                href="/contact"
                className="no-underline inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white text-black text-[13px] font-semibold hover:bg-white/90 transition-all"
              >
                Book a Demo
              </Link>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-2">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`m-reveal m-reveal-delay-${Math.min(i + 1, 4)}`}
              >
                <div
                  className={`border border-white/[0.05] rounded-xl overflow-hidden transition-colors ${openIndex === i ? "bg-white/[0.02]" : ""}`}
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left"
                  >
                    <span className="text-sm font-medium text-white/80 pr-4">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-white/20 flex-shrink-0 transition-transform duration-200 ${openIndex === i ? "rotate-180" : ""}`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${openIndex === i ? "max-h-[500px]" : "max-h-0"}`}
                  >
                    <p className="px-6 pb-5 text-sm text-white/40 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
