import { Navbar, Footer } from "@/src/components/landing";
import { AboutHero, StorySection, ValuesSection, TeamSection } from "@/src/components/about";
import PageCtaBand from "@/src/components/shared/PageCtaBand";

export const metadata = { title: "About — KinSittr" };

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main>
        <AboutHero />
        <StorySection />
        <ValuesSection />
        <TeamSection />
        <PageCtaBand
          heading="Want to work with us?"
          body="We're a small team with big hearts. Reach out — we'd love to hear from you."
          primaryCta="Get in touch →"
          primaryHref="/contact"
          variant="dark"
        />
      </main>
      <Footer />
    </>
  );
}
