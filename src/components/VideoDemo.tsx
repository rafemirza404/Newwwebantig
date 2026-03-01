import { BarChart3, Settings, DollarSign } from "lucide-react";
import { CalendarBooking } from "./CalendarBooking";

const VideoDemo = () => {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-[#8B5CF6] via-[#6366F1] to-[#4F7CFF]">
      {/* Subtle Dot Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}
      />

      {/* Content Container */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Pre-Headline */}
          <p className="text-white text-xs md:text-sm uppercase tracking-[2px] text-center font-semibold mb-4">
            WATCH THE BREAKDOWN
          </p>

          {/* Main Headline */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center mb-6 leading-tight max-w-5xl mx-auto animate-fade-in">
            See Exactly Where $200K-$500K Leak from Your Operations (And How to Capture It)
          </h2>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-white/90 text-center mb-16 max-w-3xl mx-auto leading-relaxed">
            A 4-minute walkthrough of the Revenue Recovery System and how businesses just like yours are capturing hidden revenue they didn't know existed.
          </p>

          {/* Video Placeholder */}
          <div className="max-w-5xl mx-auto mb-20">
            {/* Replace with video embed code (YouTube, Vimeo, or custom player) */}
            <div
              className="relative rounded-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.3)] h-[400px] md:h-[500px] lg:h-[600px]"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-8">
                  <p className="text-white text-2xl md:text-3xl font-bold mb-2">Demo Video Coming Soon</p>
                  <p className="text-white/90 text-base md:text-lg">Replace with actual video embed</p>
                </div>
              </div>
            </div>
          </div>

          {/* "What You'll Learn" Title */}
          <h3 className="text-2xl md:text-3xl font-semibold text-white text-center mb-12">
            What You'll Learn
          </h3>

          {/* 3-Column Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 max-w-6xl mx-auto mb-16">
            {/* Column 1 - The Diagnosis */}
            <div
              className="bg-white/[0.08] backdrop-blur-sm rounded-xl p-8 md:p-10 text-center transition-all duration-300 hover:bg-white/[0.12] hover:transform hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.2)]"
            >
              <BarChart3 className="w-12 h-12 text-white mx-auto mb-6" strokeWidth={1.5} />
              <h4 className="text-xl font-bold text-white mb-3">
                The Diagnosis
              </h4>
              <p className="text-base text-white/90 leading-relaxed">
                How we identify where your revenue is leaking and quantify it down to the dollar
              </p>
            </div>

            {/* Column 2 - The Systems */}
            <div
              className="bg-white/[0.08] backdrop-blur-sm rounded-xl p-8 md:p-10 text-center transition-all duration-300 hover:bg-white/[0.12] hover:transform hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.2)]"
            >
              <Settings className="w-12 h-12 text-white mx-auto mb-6" strokeWidth={1.5} />
              <h4 className="text-xl font-bold text-white mb-3">
                The Systems
              </h4>
              <p className="text-base text-white/90 leading-relaxed">
                The 4-part infrastructure that captures leads, converts faster, and retains customers
              </p>
            </div>

            {/* Column 3 - The Recovery */}
            <div
              className="bg-white/[0.08] backdrop-blur-sm rounded-xl p-8 md:p-10 text-center transition-all duration-300 hover:bg-white/[0.12] hover:transform hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.2)]"
            >
              <DollarSign className="w-12 h-12 text-white mx-auto mb-6" strokeWidth={1.5} />
              <h4 className="text-xl font-bold text-white mb-3">
                The Recovery
              </h4>
              <p className="text-base text-white/90 leading-relaxed">
                Real numbers from real scenarios showing $150K-$500K annual recovery potential
              </p>
            </div>
          </div>

          {/* Gold CTA Button */}
          <div className="text-center">
            <CalendarBooking
              buttonText="Schedule Your Free Call"
              buttonClassName="bg-[#F59E0B] hover:bg-[#F59E0B] text-white text-lg font-semibold px-10 py-7 rounded-full transition-all duration-300 hover:scale-105 shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:shadow-[0_0_40px_rgba(245,158,11,0.6)] mx-auto"
            />

            <p className="text-white/80 text-sm mt-3">
              See your specific numbers
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoDemo;
