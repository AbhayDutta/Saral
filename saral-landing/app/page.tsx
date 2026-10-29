import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { HowItWorks } from "./components/HowItWorks";
import { BentoGrid } from "./components/BentoGrid";
import { InteractiveDemo } from "./components/InteractiveDemo";
import { Comparison } from "./components/Comparison";
import { PrivacyTrust } from "./components/PrivacyTrust";
import { PricingTiers } from "./components/PricingTiers";
import { Faq } from "./components/Faq";
import { CtaSection } from "./components/CtaSection";
import { Footer } from "./components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white font-sf selection:bg-emerald-500/30 selection:text-emerald-200">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <BentoGrid />
        <InteractiveDemo />
        <Comparison />
        <PrivacyTrust />
        <PricingTiers />
        <Faq />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
