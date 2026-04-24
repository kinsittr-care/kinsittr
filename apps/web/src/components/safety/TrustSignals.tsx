import RevealWrapper from "@/src/components/landing/RevealWrapper";

const cards = [
  {
    iconBg: "var(--teal-lt)",
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path d="M13 2.5 L21 6 L21 12 Q21 19 13 22.5 Q5 19 5 12 L5 6 Z" stroke="var(--teal)" strokeWidth="1.8" fill="none" />
        <path d="M9 13 l3 3 5-6" stroke="var(--teal)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Only verified nannies",
    description: "No unverified profiles ever appear in search results. What you see is always approved.",
  },
  {
    iconBg: "var(--gold-lt)",
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <circle cx="13" cy="9" r="4.5" stroke="var(--gold)" strokeWidth="1.8" />
        <path d="M4 22c0-4.5 4-8 9-8s9 3.5 9 8" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M17 7 l2 2" stroke="var(--gold)" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="19" cy="7" r="2.5" fill="var(--gold)" opacity=".6" />
      </svg>
    ),
    title: "Identity confirmed",
    description: "Government ID is verified at the interview stage. You always know exactly who you're booking.",
  },
  {
    iconBg: "var(--coral-lt)",
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <circle cx="13" cy="13" r="9" stroke="var(--coral)" strokeWidth="1.8" />
        <path d="M13 9v5l3 2" stroke="var(--coral)" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M6 6 l3 3M20 6 l-3 3" stroke="var(--coral)" strokeWidth="1.4" strokeLinecap="round" opacity=".6" />
      </svg>
    ),
    title: "Ongoing monitoring",
    description: "Our trust team continuously monitors for reports or concerns, and acts swiftly when needed.",
  },
];

export default function TrustSignals() {
  return (
    <section style={{ background: "var(--bg-warm)", padding: "90px 0" }}>
      <div className="mx-auto px-[52px] max-w-[1080px] max-md:px-6">
        <RevealWrapper>
          <div className="text-center mb-12">
            <div
              className="inline-flex items-center gap-[7px] text-[12px] font-bold uppercase tracking-[0.1em] rounded-[30px] px-[13px] py-[5px] mb-[18px] border"
              style={{ color: "var(--teal)", background: "var(--teal-lt)", borderColor: "var(--teal-mid)" }}
            >
              What this means for you
            </div>
            <h2 className="font-display leading-[1.1] tracking-[-0.02em]" style={{ fontSize: "clamp(28px,3.5vw,42px)" }}>
              Peace of mind, <em style={{ color: "var(--teal)" }}>built in.</em>
            </h2>
          </div>
        </RevealWrapper>

        <div className="grid grid-cols-3 gap-5 max-md:grid-cols-1">
          {cards.map((c, i) => (
            <RevealWrapper key={c.title} delay={i * 80}>
              <div
                className="bg-white rounded-[18px] p-[28px] text-center"
                style={{ border: "1px solid var(--border)" }}
              >
                <div
                  className="w-[60px] h-[60px] rounded-[16px] flex items-center justify-center mx-auto mb-5"
                  style={{ background: c.iconBg }}
                >
                  {c.icon}
                </div>
                <h3 className="font-semibold text-[16px] mb-3" style={{ color: "var(--brand-text)" }}>
                  {c.title}
                </h3>
                <p className="text-[14px] leading-[1.7]" style={{ color: "var(--muted)" }}>
                  {c.description}
                </p>
              </div>
            </RevealWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
