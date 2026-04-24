import { Navbar, Footer } from "@/src/components/landing";
import { AboutHero, ValuesSection, TeamSection } from "@/src/components/about";
import PageCtaBand from "@/src/components/shared/PageCtaBand";

export const metadata = { title: "About — KinSittr" };

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main>
        <AboutHero />
        {/* <StorySection /> */}
        <ValuesSection />
        <TeamSection />
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
