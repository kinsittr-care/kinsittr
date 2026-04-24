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
          heading="Ready to find trusted care?"
          body="Every nanny you see on KinSittr has passed all three steps. Browse with confidence."
          primaryCta="Browse nannies →"
          primaryHref="#"
          variant="dark"
        />
      </main>
      <Footer />
    </>
  );
}
