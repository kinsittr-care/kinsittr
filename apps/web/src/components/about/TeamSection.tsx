import TeamCard from "./TeamCard";
import RevealWrapper from "@/src/components/landing/RevealWrapper";

const team = [
  {
    initials: "OG",
    avatarBg: "var(--teal)",
    name: "Oluwatinuke Griffin",
    role: "Co-founder & CEO",
    bio: "Tinuke spent over six years working in childcare across Canada as a nanny, in early childhood settings, and supporting families directly.",
  },
  {
    initials: "EC",
    avatarBg: "#5a3a6a",
    name: "Emmanuella Chukwu",
    role: "Co-founder & CTO",
    bio: "Emmanuella is a software engineer who leads product and engineering at KinSittr. She believes that finding trustworthy childcare should feel simple and safe.",
  },
];

export default function TeamSection() {
  return (
    <section className="px-[52px] pt-[60px] pb-[100px] max-md:px-6 max-md:py-[70px]" style={{ background: "var(--bg-warm)" }}>
      <div className="max-w-[1000px] mx-auto">
        <RevealWrapper>
          <div className="text-[12px] font-bold uppercase tracking-[0.12em] mb-3" style={{ color: "var(--teal)" }}>
            The team
          </div>
        </RevealWrapper>
        <RevealWrapper delay={0.1}>
          <h2 className="font-display leading-[1.12] tracking-[-0.02em] mb-3" style={{ fontSize: "clamp(32px,4vw,50px)" }}>
            People who <em style={{ color: "var(--teal)" }}>get it.</em>
          </h2>
        </RevealWrapper>
        <RevealWrapper delay={0.2}>
          <p className="text-[16.5px] leading-[1.75] max-w-[460px] mb-12" style={{ color: "var(--muted)" }}>
            Built by childcare professionals, and people who believe trust is the foundation of everything.
          </p>
        </RevealWrapper>

        <div className="grid grid-cols-3 gap-5 max-md:grid-cols-1">
          {team.map((member, i) => (
            <RevealWrapper key={member.name} delay={i * 0.1}>
              <TeamCard {...member} />
            </RevealWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
