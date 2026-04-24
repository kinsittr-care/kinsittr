import {
  Navbar,
  HeroSection,
  HowItWorksSection,
  AudienceSection,
  SafetyStrip,
  CtaSection,
  Footer,
} from "@/src/components/landing";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <AudienceSection />
        <SafetyStrip />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
