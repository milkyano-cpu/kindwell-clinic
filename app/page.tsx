import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { SpeakTeamSection } from "@/components/speak-team-section";
import { AccessSection } from "@/components/access-section";
import { HowItWorksSection } from "@/components/how-it-works-section";
import { OfferSection } from "@/components/offer-section";
import { PricingSection } from "@/components/pricing-section";
import { FAQSection } from "@/components/faq-section";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
       <main className="pt-[120px]">
        <HeroSection />
        <SpeakTeamSection />

        <AccessSection />
        <HowItWorksSection />
        <OfferSection />

        <PricingSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
