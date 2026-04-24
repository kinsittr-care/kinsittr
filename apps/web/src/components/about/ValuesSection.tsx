import ValueCard from "./ValueCard";
import RevealWrapper from "@/src/components/landing/RevealWrapper";

const values = [
  {
    iconBg: "var(--teal-lt)",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 2l8 4v7c0 5-4 9-8 11C8 22 4 18 4 13V6l8-4z" stroke="var(--teal)" strokeWidth="2" fill="var(--teal-lt)" />
        <path d="M9 12l2 2 4-4" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Trust first",
    description: "We never take shortcuts on verification. Every nanny is fully checked before appearing on the platform — no exceptions.",
  },
  {
    iconBg: "var(--gold-lt)",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 21C12 21 4 16 4 9a8 8 0 0 1 16 0c0 7-8 12-8 12z" stroke="var(--gold)" strokeWidth="2" fill="var(--gold-lt)" />
        <circle cx="12" cy="9" r="3" fill="var(--gold)" />
      </svg>
    ),
    title: "Genuinely local",
    description: "We focus on Canadian communities. Our team knows the cities we serve and the families in them.",
  },
  {
    iconBg: "var(--coral-lt)",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="8" r="3" stroke="var(--coral)" strokeWidth="2" />
        <circle cx="15" cy="8" r="3" stroke="var(--coral)" strokeWidth="2" />
        <path d="M3 20c0-4 2.7-7 6-7h6c3.3 0 6 3 6 7" stroke="var(--coral)" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    title: "Both sides matter",
    description: "Families need peace of mind. Nannies need respect and opportunity. We're building for both — equally.",
  },
  {
    iconBg: "#f0f4ee",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" stroke="var(--sage)" strokeWidth="2" />
        <path d="M12 8v4l3 3" stroke="var(--sage)" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    title: "Simple by design",
    description: "Childcare is already complicated enough. KinSittr removes friction — from search to payment — so you can focus on what matters.",
  },
];

export default function ValuesSection() {
  return (
    <section className="px-[52px] py-[100px] max-md:px-6 max-md:py-[70px]">
      <div className="max-w-[1000px] mx-auto">
        <RevealWrapper>
          <div className="text-[12px] font-bold uppercase tracking-[0.12em] mb-3" style={{ color: "var(--teal)" }}>
            What we stand for
          </div>
        </RevealWrapper>
        <RevealWrapper delay={0.1}>
          <h2 className="font-display leading-[1.12] tracking-[-0.02em] mb-12" style={{ fontSize: "clamp(32px,4vw,50px)" }}>
            Our <em style={{ color: "var(--teal)" }}>values</em>
          </h2>
        </RevealWrapper>

        <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
          {values.map((v, i) => (
            <RevealWrapper key={v.title} delay={i * 0.1}>
              <ValueCard {...v} />
            </RevealWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
