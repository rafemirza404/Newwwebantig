import Navigation from "@/components/Navigation";
import NewHero from "@/components/NewHero";
import LaunchVideo from "@/components/LaunchVideo";
import HowItWorks from "@/components/HowItWorks";
import WhyDifferent from "@/components/WhyDifferent";
import VideoDemo from "@/components/VideoDemo";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/FinalCTA";
import AssessmentForm from "@/components/AssessmentForm";
import Footer from "@/components/Footer";

// Toggle this to show/hide the VideoDemo section (set to true when VSL is ready)
const SHOW_VIDEO_DEMO = false;

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        {/* Section 1: Hero Section */}
        <section id="hero">
          <NewHero />
        </section>

        {/* Section 2: Launch Video */}
        <section id="launch-video">
          <LaunchVideo />
        </section>

        {/* Section 3: Three Tiers - PRESERVED */}
        <section id="how-we-work">
          <HowItWorks />
        </section>

        {/* Section 3: Why We're Different */}
        <section id="why-different">
          <WhyDifferent />
        </section>

        {/* Section 4: Video/Demo Section with Gradient - CONDITIONAL */}
        {SHOW_VIDEO_DEMO && (
          <section id="video-demo">
            <VideoDemo />
          </section>
        )}

        {/* Section 5: FAQ - PRESERVED */}
        <section id="faq">
          <FAQ />
        </section>

        {/* Section 6: Final CTA */}
        <section id="final-cta">
          <FinalCTA />
        </section>

        {/* Section 7: Assessment Form */}
        <section id="contact-form-section">
          <AssessmentForm />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
