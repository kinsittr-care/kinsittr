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
    <section style={{ background: "var(--bg-warm)", padding: "90px 0" }}>
      <div className="mx-auto px-[52px] max-w-[640px] max-md:px-6">
        <RevealWrapper>
          <div
            className="inline-flex items-center gap-[7px] text-[12px] font-bold uppercase tracking-widest rounded-[30px] px-[13px] py-[5px] mb-[18px] border"
            style={{ color: "var(--teal)", background: "var(--teal-lt)", borderColor: "var(--teal-mid)" }}
          >
            Timeline
          </div>
          <h2 className="font-display leading-[1.1] tracking-[-0.02em] mb-12" style={{ fontSize: "clamp(28px,3.5vw,42px)" }}>
            From apply to <em style={{ color: "var(--teal)" }}>approved</em>
          </h2>
        </RevealWrapper>

        <div className="relative">
          {/* vertical rail */}
          <div className="absolute left-[14px] top-2 bottom-2 w-[2px]" style={{ background: "var(--border)" }} />

          <div className="flex flex-col gap-8">
            {events.map((e, i) => (
              <RevealWrapper key={e.title} delay={i * 0.1}>
                <div className="flex gap-6 items-start pl-10 relative">
                  {/* dot */}
                  <div
                    className="absolute left-0 top-1 w-[16px] h-[16px] rounded-full border-[3px] shrink-0"
                    style={{
                      background: e.gold ? "var(--gold)" : "var(--teal)",
                      borderColor: "var(--bg-warm)",
                    }}
                  />
                  <div>
                    <p
                      className="text-[12px] font-semibold uppercase tracking-[0.07em] mb-[4px]"
                      style={{ color: "var(--faint)" }}
                    >
                      {e.time}
                    </p>
                    <p className="font-semibold text-[15px] mb-[4px]" style={{ color: e.gold ? "var(--gold)" : "var(--brand-text)" }}>
                      {e.title}
                    </p>
                    <p className="text-[14px] leading-[1.65]" style={{ color: "var(--muted)" }}>
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
