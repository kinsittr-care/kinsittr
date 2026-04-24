import { Navbar, Footer } from "@/src/components/landing";
import { VerificationHero, RequirementsSection, TimelineSection } from "@/src/components/verification";
import PageCtaBand from "@/src/components/shared/PageCtaBand";

export const metadata = { title: "Nanny Verification — KinSittr" };

export default function VerificationPage() {
  return (
    <>
      <Navbar />
      <main>
        <VerificationHero />
        <RequirementsSection />
        <TimelineSection />
        <PageCtaBand
          heading="Ready to get started?"
          body="Join KinSittr and connect with families looking for someone just like you."
          primaryCta="Apply now →"
          primaryHref="#apply"
          variant="medium"
        />
      </main>
      <Footer />
    </>
  );
}
