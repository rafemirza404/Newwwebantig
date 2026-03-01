"use client";

import Navigation from "~/components/marketing/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowRight } from "lucide-react";
import { CalendarBooking } from "@/components/CalendarBooking";
import Link from "next/link";

export default function WatchDemoPage() {
  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="pt-20">
        {/* Hero */}
        <section className="py-20 bg-[#EEF4FF]">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              See AgentBlue in Action
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Watch how Sophia — our AI voice agent — qualifies solar leads,
              handles objections, and books appointments automatically.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <CalendarBooking buttonText="Book a Live Demo" />
              <Link href="/signup">
                <Button
                  variant="outline"
                  className="rounded-full px-8 py-6 text-lg"
                >
                  Start Free Audit <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Demo Video Placeholder */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="aspect-video bg-gray-900 rounded-2xl flex items-center justify-center mb-12">
                <div className="text-center text-white">
                  <div className="w-20 h-20 bg-[#4F7CFF] rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium">Demo video coming soon</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Book a live demo to see it in action
                  </p>
                </div>
              </div>

              {/* Key Capabilities */}
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    title: "Lead Qualification",
                    desc: "Sophia asks the right questions to qualify solar and HVAC leads in real-time.",
                  },
                  {
                    title: "Objection Handling",
                    desc: "Trained on common objections to keep conversations moving forward.",
                  },
                  {
                    title: "Appointment Booking",
                    desc: "Automatically schedules qualified leads directly into your calendar.",
                  },
                  {
                    title: "CRM Integration",
                    desc: "All call data, notes, and outcomes sync to your CRM automatically.",
                  },
                ].map((item, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <CheckCircle className="w-6 h-6 text-green-500 mb-3" />
                      <h3 className="font-bold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground text-sm">
                        {item.desc}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-accent text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to automate your lead flow?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Start with a free audit to see exactly where AI can save you the
              most time.
            </p>
            <Link href="/signup">
              <Button className="bg-white text-accent hover:bg-white/90 rounded-full px-8 py-6 text-lg">
                Start Free Audit <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
