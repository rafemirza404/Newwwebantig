"use client";

import Navigation from "~/components/marketing/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Scale, FileText, BarChart3, Linkedin } from "lucide-react";
import Image from "next/image";
import { CalendarBooking } from "@/components/CalendarBooking";
import type { Metadata } from "next";

const beliefs = [
  {
    icon: <Target className="w-8 h-8" />,
    title: "Diagnosis Before Prescription",
    description:
      "You wouldn't want surgery without a diagnosis. Why automate without understanding what's actually broken? Every client starts with our Operations Intelligence Audit—no exceptions.",
  },
  {
    icon: <Scale className="w-8 h-8" />,
    title: "Zero Vendor Bias",
    description:
      "We don't earn commissions from software vendors. We're not certified resellers. We recommend what's genuinely best for your business, even if it means using tools you already own.",
  },
  {
    icon: <FileText className="w-8 h-8" />,
    title: "You Own Everything",
    description:
      "The blueprints, roadmaps, and documentation we create are yours forever. Implement with your team, hire freelancers, or let us build it. Total flexibility. Zero lock-in.",
  },
  {
    icon: <BarChart3 className="w-8 h-8" />,
    title: "ROI-Accountable, Always",
    description:
      "Every automation is tied to measurable outcomes: time saved, costs reduced, revenue enabled. No vanity metrics. Just quantified business impact.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="pt-20">
        {/* Hero */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
                Strategic Operations Consultants for Solar &amp; HVAC
              </h1>
              <p className="text-xl text-muted-foreground mb-6 max-w-3xl mx-auto leading-relaxed">
                We&apos;re strategic operations consultants for solar and HVAC
                companies. We diagnose first, design second, and only implement
                if you want us to.
              </p>
              <p className="text-lg font-medium text-foreground">
                Strategy first. Always.
              </p>
            </div>
          </div>
        </section>

        {/* Why We Exist */}
        <section className="py-20 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold mb-4 text-center">
                Why AgentBlue Exists
              </h2>
              <p className="text-xl text-muted-foreground mb-8 text-center">
                Born from frustration with an industry that sells tools first
                and asks questions later
              </p>
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                <p>
                  We&apos;ve seen it too many times: businesses buy automation
                  platforms after watching a flashy demo, then struggle for
                  months trying to make them work. They hire freelancers who
                  build whatever&apos;s easiest, not what actually matters.
                </p>
                <p>
                  AgentBlue was founded on a different principle: strategy
                  before tools. Every engagement starts with diagnosis—understanding
                  your actual workflows, quantifying real costs, and prioritizing
                  opportunities based on ROI.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Philosophy */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-4">What We Believe</h2>
                <p className="text-xl text-muted-foreground">
                  The principles that guide every client engagement
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                {beliefs.map((belief, i) => (
                  <Card key={i} className="border-0 bg-background/50">
                    <CardContent className="p-8">
                      <div className="w-16 h-16 bg-accent rounded-xl flex items-center justify-center mb-6 text-white">
                        {belief.icon}
                      </div>
                      <h3 className="text-2xl font-bold mb-4">
                        {belief.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {belief.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Founder */}
        <section className="py-20 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-4">The Founder</h2>
              </div>
              <div className="flex justify-center">
                <Card className="border-0 bg-background max-w-md w-full">
                  <CardContent className="p-8 text-center">
                    <Image
                      src="/rafe.png"
                      alt="Rafe Mirza"
                      width={192}
                      height={192}
                      className="rounded-full mx-auto mb-6 object-cover"
                    />
                    <h3 className="text-2xl font-bold mb-2">Rafe Mirza</h3>
                    <p className="text-accent font-medium mb-4">Founder</p>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      Consultant and technical strategist specializing in
                      automation, integrations, and AI solutions.
                    </p>
                    <a
                      href="https://www.linkedin.com/in/rafe-mirza-3a952b2b5/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[#0077B5] hover:opacity-80 transition-opacity"
                    >
                      <Linkedin className="w-5 h-5" />
                      Connect on LinkedIn
                    </a>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-accent text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-6">
                Ready to Transform Your Operations?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Let&apos;s start with an honest conversation about your
                business challenges.
              </p>
              <CalendarBooking
                buttonText="Schedule Free Consultation"
                buttonClassName="bg-white text-primary hover:bg-white/90 inline-flex items-center justify-center rounded-md text-sm font-medium h-11 px-8"
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
