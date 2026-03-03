import Link from "next/link";
import { Check, Zap } from "lucide-react";

const DIRECT_PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    description: "Get started with your first audit",
    features: [
      "1 business audit",
      "AI-generated gap report",
      "8 business function analysis",
      "Basic recommendations",
    ],
    cta: "Get Started",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/mo",
    description: "Ongoing insights for growing businesses",
    features: [
      "Unlimited audits",
      "Full AI report with ROI analysis",
      "Implementation roadmap",
      "Automation diagrams",
      "Priority processing",
      "Export to PDF",
    ],
    cta: "Start Free Trial",
    href: "/signup",
    highlighted: true,
  },
];

const AGENCY_PLANS = [
  {
    name: "Starter",
    price: "$99",
    period: "/mo",
    description: "For freelancers and boutique agencies",
    features: [
      "Up to 5 active clients",
      "Unlimited audits per client",
      "White-label client portal",
      "Client-facing reports",
      "Team collaboration",
    ],
    cta: "Start Free Trial",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "$249",
    period: "/mo",
    description: "For scaling agencies",
    features: [
      "Up to 25 active clients",
      "Everything in Starter",
      "Custom branding & domain",
      "Advanced analytics",
      "API access",
      "Priority support",
    ],
    cta: "Start Free Trial",
    href: "/signup",
    highlighted: true,
  },
  {
    name: "Scale",
    price: "$499",
    period: "/mo",
    description: "For established agencies",
    features: [
      "Unlimited clients",
      "Everything in Growth",
      "Dedicated success manager",
      "Custom integrations",
      "SLA guarantee",
      "Volume discounts",
    ],
    cta: "Contact Sales",
    href: "/contact",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border/10 px-6 py-5 flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="text-foreground font-black text-xl tracking-tight">AgentBlue</Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-muted-foreground text-sm hover:text-foreground transition-colors">Sign in</Link>
          <Link href="/signup" className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-full hover:bg-primary/90 transition-colors">
            <Zap className="w-3.5 h-3.5" />
            Get Started Free
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-foreground text-[48px] font-black tracking-tight leading-none mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Start free, upgrade when you&apos;re ready. No hidden fees.
          </p>
        </div>

        {/* Direct / Business Plans */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-3 py-1.5 bg-secondary rounded-full">For Business Owners</span>
            <h2 className="text-foreground text-2xl font-bold mt-4">Audit your own business</h2>
            <p className="text-muted-foreground text-sm mt-2">AI-powered audits to find gaps and grow your business</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {DIRECT_PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-3xl p-8 border transition-all ${plan.highlighted
                  ? "border-primary/50 bg-primary/5 shadow-[0_0_40px_rgba(var(--primary-rgb),0.08)]"
                  : "border-border/20 bg-card"
                  }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 bg-primary text-primary-foreground rounded-full">Most Popular</span>
                  </div>
                )}
                <div className="mb-6">
                  <p className="text-muted-foreground text-sm font-semibold uppercase tracking-wider mb-2">{plan.name}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-foreground text-4xl font-black">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  </div>
                  <p className="text-muted-foreground text-sm mt-2">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-foreground">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`w-full flex items-center justify-center py-3 rounded-full text-sm font-bold transition-colors ${plan.highlighted
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                    }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Agency Plans */}
        <div>
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-3 py-1.5 bg-secondary rounded-full">For Agencies</span>
            <h2 className="text-foreground text-2xl font-bold mt-4">Run audits for your clients</h2>
            <p className="text-muted-foreground text-sm mt-2">White-label portal, client management, and unlimited audits</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {AGENCY_PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-3xl p-8 border transition-all ${plan.highlighted
                  ? "border-primary/50 bg-primary/5 shadow-[0_0_40px_rgba(var(--primary-rgb),0.08)]"
                  : "border-border/20 bg-card"
                  }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 bg-primary text-primary-foreground rounded-full">Most Popular</span>
                  </div>
                )}
                <div className="mb-6">
                  <p className="text-muted-foreground text-sm font-semibold uppercase tracking-wider mb-2">{plan.name}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-foreground text-4xl font-black">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  </div>
                  <p className="text-muted-foreground text-sm mt-2">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-foreground">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`w-full flex items-center justify-center py-3 rounded-full text-sm font-bold transition-colors ${plan.highlighted
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                    }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ CTA */}
        <div className="text-center mt-20 pt-12 border-t border-border/10">
          <p className="text-muted-foreground text-sm mb-4">Have questions? We&apos;re happy to help.</p>
          <Link href="/contact" className="text-primary text-sm font-semibold hover:underline">
            Talk to us →
          </Link>
        </div>
      </div>
    </div>
  );
}
