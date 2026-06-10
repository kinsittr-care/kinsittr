import {
  BothSidesIcon,
  LocalPinIcon,
  SimpleClockIcon,
  TrustFirstIcon,
} from "@/src/components/icons";
import ValueCard from "./ValueCard";
import RevealWrapper from "@/src/components/landing/RevealWrapper";

const values = [
  {
    iconBg: "var(--teal-lt)",
    icon: <TrustFirstIcon />,
    title: "Trust first",
    description: "We never take shortcuts on verification. Every nanny is fully checked before appearing on the platform — no exceptions.",
  },
  {
    iconBg: "var(--gold-lt)",
    icon: <LocalPinIcon />,
    title: "Genuinely local",
    description: "We focus on Canadian communities. Our team knows the cities we serve and the families in them.",
  },
  {
    iconBg: "var(--coral-lt)",
    icon: <BothSidesIcon />,
    title: "Both sides matter",
    description: "Families need peace of mind. Nannies need respect and opportunity. We're building for both — equally.",
  },
  {
    iconBg: "#f0f4ee",
    icon: <SimpleClockIcon />,
    title: "Simple by design",
    description: "Childcare is already complicated enough. We remove friction from search to payment so you can focus on what matters.",
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
