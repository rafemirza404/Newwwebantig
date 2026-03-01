"use client";

const WhyDifferent = () => {
  return (
    <section className="bg-white py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Headline */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center text-black mb-8">
            Most Automation Projects Fail. Here's Why We're Different:
          </h2>

          {/* Body Paragraph */}
          <p className="text-lg md:text-xl text-gray-600 text-center leading-relaxed mb-12 max-w-3xl mx-auto">
            The problem isn't tools—it's strategy. Businesses rush to automate before understanding their operations. We diagnose first, design second, build third. Every engagement starts with a comprehensive audit because you can't fix what you don't understand.
          </p>

          {/* Differentiators List */}
          <div className="space-y-8 max-w-3xl mx-auto">
            <div className="flex items-start gap-4">
              <span className="text-[#10B981] text-2xl flex-shrink-0 mt-1">✓</span>
              <div>
                <p className="text-lg md:text-xl text-black">
                  <strong className="font-semibold">Strategy before tools</strong> - We audit your operations before recommending solutions
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="text-[#10B981] text-2xl flex-shrink-0 mt-1">✓</span>
              <div>
                <p className="text-lg md:text-xl text-black">
                  <strong className="font-semibold">Platform-agnostic</strong> - No vendor bias, no commissions—just what works best for you
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="text-[#10B981] text-2xl flex-shrink-0 mt-1">✓</span>
              <div>
                <p className="text-lg md:text-xl text-black">
                  <strong className="font-semibold">You own everything</strong> - Blueprints, specs, roadmaps—all yours to implement
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyDifferent;
