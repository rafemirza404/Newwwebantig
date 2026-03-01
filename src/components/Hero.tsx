import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

const Hero = () => {
  return (
    <section className="pt-32 pb-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent backdrop-blur-sm border border-accent/20">
            <Zap className="w-4 h-4 text-white" />
            <span className="text-sm text-white font-medium">
              ⚡ Strategy-First Automation
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
            Turn Operational Chaos Into{" "}
            <span className="text-muted-foreground">Competitive Advantage</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            AI automation built for scale—not theory. Strategy, blueprints, and
            execution that actually work.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              size="lg" 
              variant="default" 
              className="text-lg px-8"
              onClick={() => {
                const contactSection = document.getElementById('contact-form-section');
                if (contactSection) {
                  contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
            >
              Start Your Automation Journey
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 border-accent text-accent hover:bg-accent/10"
              onClick={() => {
                const caseStudiesSection = document.getElementById('case-studies');
                if (caseStudiesSection) {
                  caseStudiesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
            >
              View Success Stories
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="text-lg px-8 text-foreground hover:text-accent hover:bg-accent/5 transition-colors"
              onClick={() => window.location.href = '/watch-demo'}
            >
              Watch Demo →
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-muted-foreground pt-8">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent" />
              <span className="text-sm font-medium">⚡ 50+ Successful Implementations</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">💰</span>
              <span className="text-sm font-medium">90% Cost Reduction Average</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;