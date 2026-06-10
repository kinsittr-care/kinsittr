import {
  IdentityConfirmedIcon,
  MonitoringIcon,
  TrustSignalShieldIcon,
} from "@/src/components/icons";
import RevealWrapper from "@/src/components/landing/RevealWrapper";

const cards = [
  {
    iconBgClass: "bg-[var(--teal-lt)]",
    icon: <TrustSignalShieldIcon />,
    title: "Only verified nannies",
    description: "No unverified profiles ever appear in search results. What you see is always approved.",
  },
  {
    iconBgClass: "bg-[var(--gold-lt)]",
    icon: <IdentityConfirmedIcon />,
    title: "Identity confirmed",
    description: "Government ID is verified at the interview stage. You always know exactly who you're booking.",
  },
  {
    iconBgClass: "bg-[var(--coral-lt)]",
    icon: <MonitoringIcon />,
    title: "Ongoing monitoring",
    description: "Our trust team continuously monitors for reports or concerns, and acts swiftly when needed.",
  },
];

export default function TrustSignals() {
  return (
    <section className="bg-brand-warm py-[90px]">
      <div className="mx-auto px-[52px] max-w-[1080px] max-md:px-6">
        <RevealWrapper>
          <div className="text-center mb-12">
            <div
              className="mb-[18px] inline-flex items-center gap-[7px] rounded-[30px] border border-teal-mid bg-teal-lt px-[13px] py-[5px] text-[12px] font-bold uppercase tracking-widest text-teal"
            >
              What this means for you
            </div>
            <h2 className="font-display text-[clamp(28px,3.5vw,42px)] leading-[1.1] tracking-[-0.02em]">
              Peace of mind, <em className="text-teal">built in.</em>
            </h2>
          </div>
        </RevealWrapper>

        <div className="grid grid-cols-3 gap-5 max-md:grid-cols-1">
          {cards.map((c, i) => (
            <RevealWrapper key={c.title} delay={i * 0.1}>
              <div className="rounded-[18px] border border-(--border) bg-white p-[28px] text-center">
                <div className={`mx-auto mb-5 flex h-[60px] w-[60px] items-center justify-center rounded-2xl ${c.iconBgClass}`}>
                  {c.icon}
                </div>
                <h3 className="mb-3 text-[16px] font-semibold text-brand-text">
                  {c.title}
                </h3>
                <p className="text-[14px] leading-[1.7] text-brand-faint">
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
