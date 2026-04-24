import RevealWrapper from "@/src/components/landing/RevealWrapper";
import BenefitCard from "./BenefitCard";

const benefits = [
  {
    iconBg: "var(--teal-lt)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="11" width="16" height="10" rx="2.5" stroke="var(--teal)" strokeWidth="1.8" />
        <path d="M7 11V7a4 4 0 0 1 8 0v4" stroke="var(--teal)" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    title: "Secure payments",
    description: "Get paid directly through the platform after every booking. No chasing invoices or handling cash.",
  },
  {
    iconBg: "var(--gold-lt)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 2l2.5 6H20l-5 4 2 6.5L11 15l-6 3.5 2-6.5L2 8h6.5L11 2z" stroke="var(--gold)" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
      </svg>
    ),
    title: "Stand-out profile",
    description: "Your verified badge signals quality to families. Stand out from unverified listings on other platforms.",
  },
  {
    iconBg: "var(--coral-lt)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="4" width="16" height="15" rx="2.5" stroke="var(--coral)" strokeWidth="1.8" />
        <path d="M7 2v4M15 2v4M3 9h16" stroke="var(--coral)" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    title: "You set the terms",
    description: "Set your own hourly rate, availability, and specialties. Accept or decline booking requests on your schedule.",
  },
  {
    iconBg: "#f0f4ee",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="8" stroke="var(--sage)" strokeWidth="1.8" />
        <path d="M11 7v4.5l3 2" stroke="var(--sage)" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    title: "Flexible scheduling",
    description: "Update your availability in real time. Take a break when you need it — no minimum commitment required.",
  },
  {
    iconBg: "var(--teal-lt)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="4" y="2" width="14" height="18" rx="2.5" stroke="var(--teal)" strokeWidth="1.8" />
        <path d="M8 8h6M8 12h6M8 16h4" stroke="var(--teal)" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    title: "Built-in contracts",
    description: "Every booking comes with a clear agreement. No ambiguity — just straightforward terms for both parties.",
  },
  {
    iconBg: "var(--gold-lt)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="8" r="4" stroke="var(--gold)" strokeWidth="1.8" />
        <path d="M3 19c0-4 3.6-7 8-7s8 3 8 7" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    title: "Community support",
    description: "Access a growing community of professional nannies across Canada, plus support from our team whenever you need it.",
  },
];

export default function BenefitsSection() {
  return (
    <section style={{ background: "var(--bg)", padding: "90px 0" }}>
      <div className="mx-auto px-[52px] max-w-[1080px] max-md:px-6">
        <RevealWrapper>
          <div
            className="inline-flex items-center gap-[7px] text-[12px] font-bold uppercase tracking-widest rounded-[30px] px-[13px] py-[5px] mb-[18px] border"
            style={{ color: "var(--teal)", background: "var(--teal-lt)", borderColor: "var(--teal-mid)" }}
          >
            Why KinSittr
          </div>
          <h2 className="font-display leading-[1.1] tracking-[-0.02em] mb-4" style={{ fontSize: "clamp(28px,3.5vw,42px)" }}>
            Built to support <em style={{ color: "var(--teal)" }}>your career</em>
          </h2>
          <p className="text-[16px] leading-[1.75] mb-10 max-w-[540px]" style={{ color: "var(--muted)" }}>
            We&apos;re not just another job board. KinSittr is a professional platform that treats nannies with the respect they deserve.
          </p>
        </RevealWrapper>

        <div className="grid grid-cols-3 gap-5 max-md:grid-cols-1">
          {benefits.map((b, i) => (
            <RevealWrapper key={b.title} delay={i * 2}>
              <BenefitCard {...b} />
            </RevealWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
