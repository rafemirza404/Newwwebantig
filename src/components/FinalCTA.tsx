"use client";

import { ArrowRight } from "lucide-react";
import { CalendarBooking } from "./CalendarBooking";

const FinalCTA = () => {
  return (
    <section className="bg-black py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Headline */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Ready to See How This Works for Your Business?
          </h2>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-[#9CA3AF] mb-10 leading-relaxed max-w-3xl mx-auto">
            Book a 30-minute strategy call. We'll diagnose your biggest operational bottleneck and show you exactly how to fix it.
          </p>

          {/* Blue CTA Button */}
          <CalendarBooking
            buttonText={
              <>
                Schedule Your Free Call <ArrowRight className="ml-2 h-5 w-5 inline" />
              </>
            }
            buttonClassName="bg-[#4F7CFF] hover:bg-[#4F7CFF] text-white text-lg font-semibold px-8 py-7 rounded-full transition-all duration-300 hover:scale-105 shadow-[0_0_30px_rgba(79,124,255,0.4)] hover:shadow-[0_0_40px_rgba(79,124,255,0.6)]"
          />

          {/* Small text below */}
          <p className="text-sm text-[#9CA3AF] mt-3">
            No sales pitch. Just strategic insights.
          </p>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
