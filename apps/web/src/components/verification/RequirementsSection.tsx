import RevealWrapper from "@/src/components/landing/RevealWrapper";
import ChecklistItem from "./ChecklistItem";

const requirements = [
  {
    title: "Government-issued photo ID",
    description: "Passport, driver's licence, or provincial ID card. Used for identity verification during the live interview.",
  },
  {
    title: "Two references",
    description: "Previous employers, families you've worked with, or a childcare supervisor. Personal references are not accepted.",
  },
  {
    title: "Childcare experience (min. 1 year)",
    description: "This can include formal employment, babysitting, au pair work, or equivalent verified experience.",
  },
  {
    title: "30 minutes for a video call",
    description: "Our team will schedule a live interview with you at a time that works for your schedule.",
  },
];

export default function RequirementsSection() {
  return (
    <section style={{ background: "var(--bg)", padding: "90px 0" }}>
      <div className="mx-auto px-[52px] max-w-[1080px] max-md:px-6">
        <RevealWrapper>
          <div
            className="inline-flex items-center gap-[7px] text-[12px] font-bold uppercase tracking-widest rounded-[30px] px-[13px] py-[5px] mb-[18px] border"
            style={{ color: "var(--teal)", background: "var(--teal-lt)", borderColor: "var(--teal-mid)" }}
          >
            Requirements
          </div>
          <h2 className="font-display leading-[1.1] tracking-[-0.02em] mb-4" style={{ fontSize: "clamp(28px,3.5vw,42px)" }}>
            What you&apos;ll need to <em style={{ color: "var(--teal)" }}>apply</em>
          </h2>
          <p className="text-[16px] leading-[1.75] mb-10 max-w-[540px]" style={{ color: "var(--faint)" }}>
            Gather these before starting — it makes the process smooth and fast.
          </p>
        </RevealWrapper>

        <div className="flex flex-col gap-3">
          {requirements.map((r, i) => (
            <RevealWrapper key={r.title} delay={i * 0.1}>
              <ChecklistItem {...r} />
            </RevealWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
