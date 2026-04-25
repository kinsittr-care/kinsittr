import {
  CommunitySupportIcon,
  ContractDocumentIcon,
  FlexibleClockIcon,
  PaymentsIcon,
  ScheduleTermsIcon,
  StandoutProfileIcon,
} from "@/src/components/icons";
import RevealWrapper from "@/src/components/landing/RevealWrapper";
import BenefitCard from "./BenefitCard";

const benefits = [
  {
    iconBg: "var(--teal-lt)",
    icon: <PaymentsIcon />,
    title: "Secure payments",
    description: "Get paid directly through the platform after every booking. No chasing invoices or handling cash.",
  },
  {
    iconBg: "var(--gold-lt)",
    icon: <StandoutProfileIcon />,
    title: "Stand-out profile",
    description: "Your verified badge signals quality to families. Stand out from unverified listings on other platforms.",
  },
  {
    iconBg: "var(--coral-lt)",
    icon: <ScheduleTermsIcon />,
    title: "You set the terms",
    description: "Set your own hourly rate, availability, and specialties. Accept or decline booking requests on your schedule.",
  },
  {
    iconBg: "#f0f4ee",
    icon: <FlexibleClockIcon />,
    title: "Flexible scheduling",
    description: "Update your availability in real time. Take a break when you need it — no minimum commitment required.",
  },
  {
    iconBg: "var(--teal-lt)",
    icon: <ContractDocumentIcon />,
    title: "Built-in contracts",
    description: "Every booking comes with a clear agreement. No ambiguity — just straightforward terms for both parties.",
  },
  {
    iconBg: "var(--gold-lt)",
    icon: <CommunitySupportIcon />,
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
            <RevealWrapper key={b.title} delay={i * 0.1}>
              <BenefitCard {...b} />
            </RevealWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
