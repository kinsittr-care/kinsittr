import { Footer, Navbar } from "@/src/components/landing";
import { WaitlistForm } from "@/src/components/waitlist";

export const metadata = { title: "Join the waitlist — KinSittr" };

interface WaitlistPageProps {
  searchParams: Promise<{ role?: string }>;
}

export default async function WaitlistPage({ searchParams }: WaitlistPageProps) {
  const params = await searchParams;
  const initialRole = params.role === "nanny" ? "nanny" : "parent";

  return (
    <>
      <Navbar />
      <main>
        <section className="relative overflow-hidden bg-brand-bg px-6 pb-20 pt-[120px] sm:px-[52px] sm:pb-24 sm:pt-[140px]">
          <div className="pointer-events-none absolute right-[-140px] top-[-120px] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_40%,rgba(58,90,90,.12),transparent_70%)]" />
          <div className="pointer-events-none absolute bottom-[-90px] left-[-80px] h-[280px] w-[280px] rounded-full bg-[radial-gradient(circle,rgba(200,164,74,.13),transparent_70%)]" />

          <div className="relative mx-auto grid max-w-[1080px] grid-cols-[0.9fr_1.1fr] items-start gap-12 max-lg:grid-cols-1">
            <div className="pt-4">
              <p className="mb-5 inline-flex rounded-full border border-teal-mid bg-teal-lt px-4 py-2 text-[12px] font-bold uppercase tracking-[0.13em] text-teal">
                Early access
              </p>
              <h1 className="font-display text-[clamp(42px,6vw,70px)] leading-[1.04] tracking-[-0.03em] text-brand-text">
                Join KinSittr before we open publicly.
              </h1>
              <p className="mt-6 max-w-[520px] text-[17px] leading-8 text-brand-faint">
                We are inviting families and caregivers in small batches while we finish onboarding, payments, messaging,
                and safety workflows. Add your details and we will email you when your access is ready.
              </p>

              <div className="mt-9 grid max-w-[520px] gap-4 sm:grid-cols-3">
                <InfoCard title="1" body="Tell us whether you are joining as a family or caregiver." />
                <InfoCard title="2" body="We review demand by city and launch readiness." />
                <InfoCard title="3" body="You get an invite when your group opens." />
              </div>
            </div>

            <WaitlistForm initialRole={initialRole} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[18px] border border-(--border) bg-white/70 p-4 shadow-[0_4px_20px_rgba(40,30,20,.05)]">
      <p className="font-display text-[24px] text-teal">{title}</p>
      <p className="mt-2 text-[13px] leading-6 text-brand-faint">{body}</p>
    </div>
  );
}
