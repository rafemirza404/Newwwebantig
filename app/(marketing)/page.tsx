import HeroSection from "~/components/marketing/sections/HeroSection";
import SocialProofSection from "~/components/marketing/sections/SocialProofSection";
import HowItWorksSection from "~/components/marketing/sections/HowItWorksSection";
import FeatureGridSection from "~/components/marketing/sections/FeatureGridSection";
import AudienceSection from "~/components/marketing/sections/AudienceSection";
import TestimonialsSection from "~/components/marketing/sections/TestimonialsSection";
import FAQSection from "~/components/marketing/sections/FAQSection";
import FinalCTASection from "~/components/marketing/sections/FinalCTASection";

export const metadata = {
  title: "AgentBlue — AI Operations Audit Platform",
  description:
    "Find automation gaps costing you thousands. The AI audit platform that diagnoses gaps across 8 business functions — with solutions, ROI, and a roadmap in under 10 minutes.",
};

export default function MarketingPage() {
  return (
    <>
      <HeroSection />
      <SocialProofSection />
      <HowItWorksSection />
      <FeatureGridSection />
      <AudienceSection />
      <TestimonialsSection />
      <FAQSection />
      <FinalCTASection />
    </>
  );
}
