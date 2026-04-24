import { Navbar, Footer } from "@/src/components/landing";
import { NannyHero, BenefitsSection, PaySection } from "@/src/components/nanny-resources";
import PageCtaBand from "@/src/components/shared/PageCtaBand";

export const metadata = { title: "Nanny Resources — KinSittr" };

export default function NannyResourcesPage() {
  return (
    <>
      <Navbar />
      <main>
        <NannyHero />
        <BenefitsSection />
        <PaySection />
        {/* <ResourcesList /> */}
        <PageCtaBand
          heading="Like what you see?"
          body="Join our waitlist and we'll let you know when we launch."
          primaryCta="Get in touch →"
          primaryHref="/verification"
          secondaryCta="Talk to our team"
          secondaryHref="/contact"
          variant="dark"
        />
      </main>
      <Footer />
    </>
  );
}
