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
          heading="Like what you see?"
          body="Join our waitlist and we'll let you know when we launch."
          primaryCta="Get in touch →"
          primaryHref="/contact"
          variant="medium"
        />
      </main>
      <Footer />
    </>
  );
}
