import { X, Check, Target, DollarSign, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const WhyNotDIY = () => {
  const objections = [
    {
      icon: X,
      checkIcon: Check,
      objection: "We tried automation before and it didn't work",
      headline: "You Automated Without Strategy",
      response:
        "Most businesses buy tools first, ask questions later. We flip that. Every automation starts with diagnosis—mapping your actual operations, quantifying real costs, and prioritizing based on ROI. Strategy first. Always.",
    },
    {
      icon: Target,
      objection: "Our business is too unique for templates",
      headline: "Exactly Why We Customize Everything",
      response:
        "You're right—your business is unique. But operational patterns are universal. We audit YOUR processes, design for YOUR workflows, and build for YOUR tools. Zero cookie-cutters. Total customization.",
    },
    {
      icon: DollarSign,
      objection: "We can't afford to invest in automation",
      headline: "Manual Chaos Costs More Than You Think",
      response:
        "Let's do the math: 20 hours/week on manual work at $50/hour = $1,000/week = $52,000/year. Our audit shows you exactly where money is leaking. Most clients achieve ROI in 3-6 months.",
    },
    {
      icon: Shield,
      objection: "What if the automation breaks?",
      headline: "We Design for Resilience",
      response:
        "Every automation includes error handling, fallback procedures, and monitoring. Plus we train your team, provide detailed documentation, and offer post-launch support. You're never left stranded.",
    },
  ];

  return (
    <section className="py-20 px-4 bg-gradient-subtle">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Why This Isn't Another 'Buy Tools & Hope' Approach
          </h2>
          <p className="text-lg text-muted-foreground">
            We know you've tried automation before. Here's why this time is different.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {objections.map((obj, index) => (
            <Card
              key={index}
              className="bg-card border-border shadow-card hover-lift"
            >
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                    <obj.icon className="w-6 h-6 text-destructive" />
                  </div>
                  <span className="text-2xl font-bold text-muted-foreground">
                    →
                  </span>
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-6 h-6 text-accent" />
                  </div>
                </div>

                <p className="text-sm text-muted-foreground italic mb-3">
                  "{obj.objection}"
                </p>

                <h3 className="text-xl font-bold text-foreground mb-3">
                  {obj.headline}
                </h3>

                <p className="text-muted-foreground leading-relaxed">
                  {obj.response}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyNotDIY;
