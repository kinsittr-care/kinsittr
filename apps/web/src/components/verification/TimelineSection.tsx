import RevealWrapper from "@/src/components/landing/RevealWrapper";

const events = [
  {
    time: "Day 1",
    title: "Submit your application",
    description: "Fill in your profile, upload your ID, and provide your two references. Takes about 15 minutes.",
    gold: false,
  },
  {
    time: "Days 1–3",
    title: "Background check",
    description: "We run your background check automatically. You'll be notified once it's complete.",
    gold: false,
  },
  {
    time: "Days 2–4",
    title: "Reference calls",
    description: "Our team contacts your references directly. We'll let you know if we can't reach someone so you can follow up.",
    gold: false,
  },
  {
    time: "Days 4–7",
    title: "Live video interview",
    description: "A 30-minute call with a KinSittr team member. Friendly, structured, and focused on your care approach.",
    gold: false,
  },
  {
    time: "Day 5–7",
    title: "Profile goes live ✓",
    description: "Once approved, your profile is published and families can start booking you!",
    gold: true,
  },
];

export default function TimelineSection() {
  return (
    <section className="bg-brand-warm py-[90px]">
      <div className="mx-auto px-[52px] max-w-[640px] max-md:px-6">
        <RevealWrapper>
          <div
            className="mb-[18px] inline-flex items-center gap-[7px] rounded-[30px] border border-teal-mid bg-teal-lt px-[13px] py-[5px] text-[12px] font-bold uppercase tracking-widest text-teal"
          >
            Timeline
          </div>
          <h2 className="font-display mb-12 text-[clamp(28px,3.5vw,42px)] leading-[1.1] tracking-[-0.02em]">
            From apply to <em className="text-teal">approved</em>
          </h2>
        </RevealWrapper>

        <div className="relative">
          {/* vertical rail */}
          <div className="absolute bottom-2 left-[14px] top-2 w-[2px] bg-(--border)" />

          <div className="flex flex-col gap-8">
            {events.map((e, i) => (
              <RevealWrapper key={e.title} delay={i * 0.1}>
                <div className="relative flex items-start gap-6 pl-10">
                  {/* dot */}
                  <div className={`absolute left-0 top-1 h-4 w-4 shrink-0 rounded-full border-[3px] border-brand-warm ${e.gold ? "bg-gold" : "bg-teal"}`} />
                  <div>
                    <p className="mb-[4px] text-[12px] font-semibold uppercase tracking-[0.07em] text-brand-faint">
                      {e.time}
                    </p>
                    <p className={`mb-[4px] text-[15px] font-semibold ${e.gold ? "text-gold" : "text-brand-text"}`}>
                      {e.title}
                    </p>
                    <p className="text-[14px] leading-[1.65] text-brand-faint">
                      {e.description}
                    </p>
                  </div>
                </div>
              </RevealWrapper>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
