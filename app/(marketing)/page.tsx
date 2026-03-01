export const dynamic = "force-dynamic";

import Navigation from "~/components/marketing/Navigation";
import NewHero from "~/components/marketing/NewHero";
import LaunchVideo from "@/components/LaunchVideo";
import HowItWorks from "@/components/HowItWorks";
import WhyDifferent from "@/components/WhyDifferent";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/FinalCTA";
import AssessmentForm from "@/components/AssessmentForm";
import Footer from "@/components/Footer";

// Toggle to true when VSL video is ready
const SHOW_VIDEO_DEMO = false;

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <section id="hero">
          <NewHero />
        </section>

        <section id="launch-video">
          <LaunchVideo />
        </section>

        <section id="how-we-work">
          <HowItWorks />
        </section>

        <section id="why-different">
          <WhyDifferent />
        </section>

        {SHOW_VIDEO_DEMO && (
          <section id="video-demo">
            {/* VideoDemo — enable when VSL ready */}
          </section>
        )}

        <section id="faq">
          <FAQ />
        </section>

        <section id="final-cta">
          <FinalCTA />
        </section>

        <section id="contact-form-section">
          <AssessmentForm />
        </section>
      </main>
      <Footer />
    </div>
  );
}
