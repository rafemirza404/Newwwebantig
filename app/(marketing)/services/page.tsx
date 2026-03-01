"use client";

import Navigation from "~/components/marketing/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarBooking } from "@/components/CalendarBooking";
import {
  Bot,
  Workflow,
  BarChart3,
  MessageSquare,
  FileText,
  Shield,
  Target,
  CheckCircle,
  Search,
  DollarSign,
  Map,
  Wrench,
  Rocket,
  Clock,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const services = [
  {
    icon: <Search className="w-6 h-6" />,
    title: "Operations Intelligence Audit",
    description:
      "A deep-dive into your workflows to identify exactly where time and money are being lost.",
    features: [
      "8-function business analysis",
      "ROI-quantified gap report",
      "Prioritized automation roadmap",
      "Industry benchmark comparison",
    ],
  },
  {
    icon: <Map className="w-6 h-6" />,
    title: "Automation Strategy & Design",
    description:
      "Custom blueprints for the automations that will have the biggest impact on your business.",
    features: [
      "Process mapping & redesign",
      "Tool selection & architecture",
      "Implementation specifications",
      "Team training plan",
    ],
  },
  {
    icon: <Wrench className="w-6 h-6" />,
    title: "Build & Implementation",
    description:
      "We build the automations for you — or hand off precise specs to your team or freelancers.",
    features: [
      "End-to-end automation build",
      "Testing & QA",
      "Documentation & handoff",
      "30-day post-launch support",
    ],
  },
  {
    icon: <Rocket className="w-6 h-6" />,
    title: "AI Agent Deployment",
    description:
      "Custom AI agents for sales, support, and operations — trained on your specific business.",
    features: [
      "Voice AI for inbound/outbound",
      "Chat AI for lead qualification",
      "Custom knowledge base",
      "CRM integration",
    ],
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="pt-20">
        {/* Hero */}
        <section className="py-20 bg-[#EEF4FF]">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Services Built for Operational Excellence
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              From diagnosis to deployment — every service is designed to
              deliver measurable ROI for Solar and HVAC companies.
            </p>
            <CalendarBooking buttonText="Book a Free Consultation" />
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {services.map((service, i) => (
                <Card key={i} className="p-6">
                  <CardHeader className="p-0 mb-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center text-accent mb-4">
                      {service.icon}
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <p className="text-muted-foreground mb-4">
                      {service.description}
                    </p>
                    <ul className="space-y-2">
                      {service.features.map((f, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="py-20 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">
                How Every Engagement Works
              </h2>
              <p className="text-xl text-muted-foreground">
                Diagnose → Design → Deploy. In that order. Always.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  icon: <Target className="w-8 h-8" />,
                  step: "1",
                  title: "Diagnose",
                  desc: "Audit your 8 core business functions. Identify gaps. Quantify cost.",
                },
                {
                  icon: <Map className="w-8 h-8" />,
                  step: "2",
                  title: "Design",
                  desc: "Blueprint the automation strategy. Select tools. Prioritize by ROI.",
                },
                {
                  icon: <Rocket className="w-8 h-8" />,
                  step: "3",
                  title: "Deploy",
                  desc: "Build, test, and launch. Or hand off the blueprint to your team.",
                },
              ].map((phase) => (
                <div key={phase.step} className="text-center">
                  <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center text-white mx-auto mb-4">
                    {phase.icon}
                  </div>
                  <div className="text-sm text-accent font-semibold mb-1">
                    Step {phase.step}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{phase.title}</h3>
                  <p className="text-muted-foreground">{phase.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-accent text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">
              Start With a Free Audit
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Sign up to run your own AI business audit — or book a call to
              have us walk through it with you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button className="bg-white text-accent hover:bg-white/90 rounded-full px-8 py-6 text-lg">
                  Start Free Audit <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <CalendarBooking
                buttonText="Book a Call"
                buttonClassName="inline-flex items-center justify-center rounded-full border-2 border-white text-white hover:bg-white/10 px-8 py-3 text-lg font-medium"
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
