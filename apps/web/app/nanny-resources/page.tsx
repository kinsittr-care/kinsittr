import { Navbar, Footer } from "@/src/components/landing";
import { NannyHero, BenefitsSection, PaySection, ResourcesList } from "@/src/components/nanny-resources";
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
        <ResourcesList />
        <PageCtaBand
          heading="Ready to get started?"
          body="Apply to become a verified KinSittr nanny and start connecting with families today."
          primaryCta="Start verification →"
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
