import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { SpeakTeamSection } from "@/components/speak-team-section";
import { AccessSection } from "@/components/access-section";
import { HowItWorksSection } from "@/components/how-it-works-section";
import { OfferSection } from "@/components/offer-section";
import { PricingSection } from "@/components/pricing-section";
import { FAQSection } from "@/components/faq-section";
import { Footer } from "@/components/footer";
import { FadeUp } from "@/components/animations/FadeUp";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-[120px]">
        <FadeUp>
          <HeroSection />
        </FadeUp>

        <FadeUp delay={0.1}>
          <SpeakTeamSection />
        </FadeUp>

        <FadeUp delay={0.2}>
          <AccessSection />
        </FadeUp>

        <FadeUp delay={0.3}>
          <HowItWorksSection />
        </FadeUp>

        <FadeUp delay={0.4}>
          <OfferSection />
        </FadeUp>

        <FadeUp delay={0.5}>
          <PricingSection />
        </FadeUp>

        <FadeUp delay={0.6}>
          <FAQSection />
        </FadeUp>
      </main>

      <Footer />
    </div>
  );
}