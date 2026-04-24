import { Navbar, Footer } from "@/src/components/landing";
import { SafetyHero, VerificationSteps, TrustSignals, FaqSection } from "@/src/components/safety";
import PageCtaBand from "@/src/components/shared/PageCtaBand";

export const metadata = { title: "Safety — KinSittr" };

export default function SafetyPage() {
  return (
    <>
      <Navbar />
      <main>
        <SafetyHero />
        <VerificationSteps />
        <TrustSignals />
        <FaqSection />
        <PageCtaBand
          heading="Like what you see?"
          body="Join our waitlist and we'll let you know when we launch."
          primaryCta="Get in touch →"
          primaryHref="/contact"
          variant="dark"
        />
      </main>
      <Footer />
    </>
  );
}
