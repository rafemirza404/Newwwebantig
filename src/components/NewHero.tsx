"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CalendarBooking } from "@/components/CalendarBooking";

const NewHero = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-[#EEF4FF] py-24 md:py-36">
      <div className="container mx-auto px-4 max-w-5xl flex flex-col items-center text-center">

        {/* Announcement Pill */}
        <div className="bg-white border border-gray-200 rounded-full px-4 py-1.5 text-sm text-gray-600 inline-flex items-center gap-2 shadow-sm mb-8 animate-fade-in">
          Automate smarter. Not harder.
          <ArrowRight className="h-3.5 w-3.5" />
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-tight animate-slide-up mb-6">
          Automation Strategy That Fixes Revenue Leaks, For Operations-Heavy Businesses
        </h1>

        {/* Subheading */}
        <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-2xl mx-auto animate-slide-up-subtle animate-delay-100 mb-10">
          Audit your operations. Identify the leaks. Automate the fix. First call in 30 mins. Revenue flowing in 90 days.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-4 animate-slide-up-subtle animate-delay-200">
          <Button
            onClick={() => navigate('/watch-demo')}
            className="bg-[#4F7CFF] hover:bg-[#4F7CFF] text-white text-lg font-semibold px-8 py-7 rounded-full transition-all duration-300 hover:scale-105 shadow-[0_0_30px_rgba(79,124,255,0.4)] hover:shadow-[0_0_40px_rgba(79,124,255,0.6)]"
          >
            Talk to Sophia <ArrowRight className="ml-2 h-5 w-5 inline" />
          </Button>

          <CalendarBooking
            trigger={
              <button className="flex items-center gap-2 text-gray-700 font-semibold text-lg hover:text-black transition-colors duration-200 cursor-pointer">
                Book a call <ArrowRight className="h-5 w-5" />
              </button>
            }
          />
        </div>

        {/* Disclaimer */}
        <p className="text-sm text-gray-500 animate-slide-up-subtle animate-delay-300">
          See how our voice agent handles real conversations.
        </p>

      </div>
    </section>
  );
};

export default NewHero;
