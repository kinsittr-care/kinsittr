import {
  IdentityConfirmedIcon,
  MonitoringIcon,
  TrustSignalShieldIcon,
} from "@/src/components/icons";
import RevealWrapper from "@/src/components/landing/RevealWrapper";

const cards = [
  {
    iconBg: "var(--teal-lt)",
    icon: <TrustSignalShieldIcon />,
    title: "Only verified nannies",
    description: "No unverified profiles ever appear in search results. What you see is always approved.",
  },
  {
    iconBg: "var(--gold-lt)",
    icon: <IdentityConfirmedIcon />,
    title: "Identity confirmed",
    description: "Government ID is verified at the interview stage. You always know exactly who you're booking.",
  },
  {
    iconBg: "var(--coral-lt)",
    icon: <MonitoringIcon />,
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
              className="inline-flex items-center gap-[7px] text-[12px] font-bold uppercase tracking-widest rounded-[30px] px-[13px] py-[5px] mb-[18px] border"
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
            <RevealWrapper key={c.title} delay={i * 0.1}>
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
