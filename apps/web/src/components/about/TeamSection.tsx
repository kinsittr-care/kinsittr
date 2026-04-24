import TeamCard from "./TeamCard";
import RevealWrapper from "@/src/components/landing/RevealWrapper";

const team = [
  {
    initials: "MA",
    avatarBg: "var(--teal)",
    name: "Maya Adeyemi",
    role: "Co-founder & CEO",
    bio: "Former early childhood educator and mother of two. Maya built KinSittr because she couldn't find what she needed as a parent.",
  },
  {
    initials: "JC",
    avatarBg: "#5a3a6a",
    name: "James Chen",
    role: "Co-founder & CTO",
    bio: "Software engineer and dad. James leads product and engineering, focused on keeping the experience simple and the platform reliable.",
  },
  {
    initials: "SP",
    avatarBg: "var(--coral)",
    name: "Simone Pelletier",
    role: "Head of Trust & Safety",
    bio: "15 years in childcare and social services. Simone oversees every verification, every report, and every nanny approval on the platform.",
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
            Built by parents, childcare professionals, and people who believe trust is the foundation of everything.
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
