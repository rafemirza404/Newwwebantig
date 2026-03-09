"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, ArrowRight, Zap } from "lucide-react";
import SectionBadge from "~/components/marketing/SectionBadge";

const PLANS = {
  business: [
    {
      name: "Free",
      price: "$0",
      period: "/mo",
      description: "Run your first audit. See what's broken.",
      cta: "Get Started Free",
      href: "/signup",
      highlighted: false,
      features: [
        "1 business audit",
        "AI-generated gap report",
        "8 business function analysis",
        "Basic recommendations",
      ],
    },
    {
      name: "Pro",
      price: "$29",
      period: "/mo",
      description: "Unlimited audits with full ROI analysis and roadmaps.",
      cta: "Start Free Trial",
      href: "/signup",
      highlighted: true,
      badge: "Most Popular",
      features: [
        "Unlimited audits",
        "Full AI report with ROI analysis",
        "Implementation roadmap",
        "Automation diagrams",
        "Priority processing",
        "Export to PDF",
      ],
    },
  ],
  agency: [
    {
      name: "Starter",
      price: "$99",
      period: "/mo",
      description: "For freelancers and boutique agencies.",
      cta: "Start Free Trial",
      href: "/signup",
      highlighted: false,
      features: [
        "Up to 5 active clients",
        "Unlimited audits per client",
        "White-label client portal",
        "Client-facing reports",
        "Team collaboration",
      ],
    },
    {
      name: "Growth",
      price: "$249",
      period: "/mo",
      description: "For agencies scaling their client base.",
      cta: "Start Free Trial",
      href: "/signup",
      highlighted: true,
      badge: "Most Popular",
      features: [
        "Up to 25 active clients",
        "Everything in Starter",
        "Custom branding & domain",
        "Advanced analytics",
        "API access",
        "Priority support",
      ],
    },
    {
      name: "Scale",
      price: "$499",
      period: "/mo",
      description: "For established agencies with high volume.",
      cta: "Contact Sales",
      href: "/contact",
      highlighted: false,
      features: [
        "Unlimited clients",
        "Everything in Growth",
        "Dedicated success manager",
        "Custom integrations",
        "SLA guarantee",
        "Volume discounts",
      ],
    },
  ],
};

const FAQS = [
  {
    q: "Is there a free trial?",
    a: "Yes. All paid plans start with a 14-day free trial. No credit card required until you're ready.",
  },
  {
    q: "Can I switch plans anytime?",
    a: "Absolutely. Upgrade or downgrade at any time. Changes apply from your next billing cycle.",
  },
  {
    q: "What does 'white-label' mean?",
    a: "Your agency logo, colors, and domain appear on all client portals and reports. AgentBlue is invisible.",
  },
  {
    q: "Do you offer annual billing?",
    a: "Yes — annual billing saves 20% across all plans. Reach out or toggle at checkout.",
  },
];

type Tab = "business" | "agency";

export default function PricingPage() {
  const [tab, setTab] = useState<Tab>("business");
  const plans = PLANS[tab];

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Hero */}
      <section className="relative pt-40 pb-24 overflow-hidden border-b border-white/[0.05]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-white/[0.03] rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-[960px] mx-auto px-6 relative z-10 text-center">
          <SectionBadge label="PRICING" className="mb-8 flex justify-center" color="emerald" />
          <h1
            className="text-[44px] md:text-[60px] font-light tracking-[-0.03em] leading-[1.08] mb-6 text-transparent bg-clip-text"
            style={{ backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.7) 0%, white 35%, white 100%)" }}
          >
            Simple, transparent pricing.
          </h1>
          <p className="text-[17px] text-white/45 max-w-xl mx-auto leading-relaxed">
            Start free. Upgrade when you&apos;re ready. No hidden fees, no lock-in, no surprises.
          </p>
        </div>
      </section>

      {/* Tab Toggle */}
      <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-white/[0.05]">
        <div className="max-w-[960px] mx-auto px-6 py-4 flex items-center justify-center">
          <div className="p-1 bg-white/[0.04] border border-white/[0.07] rounded-xl flex items-center gap-1">
            {(["business", "agency"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-6 py-2.5 rounded-lg text-[13px] font-semibold transition-all ${tab === t
                    ? "bg-white text-black shadow-sm"
                    : "text-white/40 hover:text-white/70"
                  }`}
              >
                {t === "business" ? "For Business Owners" : "For Agencies"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Plans */}
      <section className="py-20 border-b border-white/[0.05]">
        <div className="max-w-[960px] mx-auto px-6">

          {/* Section label */}
          <div className="text-center mb-12">
            <p className="text-[13px] text-white/30 uppercase tracking-widest font-semibold">
              {tab === "business" ? "Audit your own business" : "Run audits for your clients"}
            </p>
            <p className="text-[15px] text-white/40 mt-2">
              {tab === "business"
                ? "AI-powered audits to find gaps and grow your business."
                : "White-label portal, client management, and unlimited audits."}
            </p>
          </div>

          <div className={`grid gap-5 ${plans.length === 2 ? "md:grid-cols-2 max-w-2xl mx-auto" : "md:grid-cols-3"}`}>
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border flex flex-col overflow-hidden transition-all ${plan.highlighted
                    ? "border-white/20 bg-white/[0.04] shadow-[0_0_50px_rgba(255,255,255,0.04)]"
                    : "border-white/[0.07] bg-[#050505]"
                  }`}
              >
                {/* Top shimmer line on highlighted */}
                {plan.highlighted && (
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                )}

                {/* Badge */}
                {"badge" in plan && plan.badge && (
                  <div className="absolute top-4 right-4">
                    <span className="px-2.5 py-1 bg-white text-black text-[10px] font-bold uppercase tracking-widest rounded-full">
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Plan header */}
                <div className="p-7 pb-6 border-b border-white/[0.05]">
                  <p className="text-[11px] text-white/30 uppercase tracking-widest font-semibold mb-4">{plan.name}</p>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-[44px] font-semibold text-white leading-none tracking-tight">{plan.price}</span>
                    <span className="text-[14px] text-white/30">{plan.period}</span>
                  </div>
                  <p className="text-[13px] text-white/45 leading-relaxed">{plan.description}</p>
                </div>

                {/* Features */}
                <div className="p-7 flex-1">
                  <ul className="space-y-3.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-[13px] text-white/60">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div className="px-7 pb-7">
                  <Link
                    href={plan.href}
                    className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-[14px] font-semibold transition-all ${plan.highlighted
                        ? "bg-white text-black hover:bg-white/90"
                        : "bg-white/[0.04] border border-white/[0.07] text-white/70 hover:border-white/20 hover:text-white"
                      }`}
                  >
                    {plan.cta}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantee strip */}
      <section className="py-12 border-b border-white/[0.05]">
        <div className="max-w-[960px] mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left divide-y md:divide-y-0 md:divide-x divide-white/[0.05]">
            {[
              { icon: "🔒", label: "14-day free trial", sub: "No credit card required" },
              { icon: "↩", label: "Cancel anytime", sub: "No lock-in contracts" },
              { icon: "📄", label: "You own the data", sub: "Export everything, always" },
            ].map((item, i) => (
              <div key={i} className="flex-1 px-6 py-4">
                <div className="text-[22px] mb-1">{item.icon}</div>
                <div className="text-[14px] font-semibold text-white">{item.label}</div>
                <div className="text-[12px] text-white/35">{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24">
        <div className="max-w-[720px] mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-[28px] md:text-[36px] font-light tracking-tight text-white mb-3">
              Common questions
            </h2>
            <p className="text-[14px] text-white/35">
              Still unsure? <Link href="/contact" className="text-white/60 hover:text-white underline underline-offset-2 transition-colors">Talk to us</Link>
            </p>
          </div>

          <div className="divide-y divide-white/[0.05]">
            {FAQS.map((faq, i) => (
              <div key={i} className="py-6">
                <h3 className="text-[15px] font-semibold text-white mb-2">{faq.q}</h3>
                <p className="text-[14px] text-white/45 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 border-t border-white/[0.05] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-white/[0.02] rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-[960px] mx-auto px-6 relative z-10 text-center">
          <h2 className="text-[32px] md:text-[44px] font-light tracking-[-0.03em] mb-4 text-transparent bg-clip-text"
            style={{ backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.6) 0%, white 40%, white 100%)" }}>
            Start with a free audit.
          </h2>
          <p className="text-[15px] text-white/35 mb-8">
            Takes 10 minutes. Get a personalized ROI scorecard.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-7 py-4 bg-white text-black rounded-xl font-semibold text-[15px] hover:bg-white/90 transition-all"
          >
            <Zap className="w-4 h-4" />
            Get Started Free
          </Link>
        </div>
      </section>

    </div>
  );
}
