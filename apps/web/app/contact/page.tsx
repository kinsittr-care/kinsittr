import { Navbar, Footer } from "@/src/components/landing";
import { ContactInfo, ContactForm } from "@/src/components/contact";

export const metadata = { title: "Contact — KinSittr" };

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main>
        <section style={{ background: "var(--bg)", paddingTop: 130, paddingBottom: 80 }}>
          <div className="mx-auto px-[52px] max-w-[1080px] grid grid-cols-[1fr_1.2fr] gap-[72px] items-start max-md:grid-cols-1 max-md:px-6 max-md:pt-28 max-md:pb-14">
            <ContactInfo />
            <ContactForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
