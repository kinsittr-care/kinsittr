import RevealWrapper from "@/src/components/landing/RevealWrapper";
import ResourceItem from "./ResourceItem";

const resources = [
  {
    tag: "Guide",
    tagStyle: { color: "var(--teal)", background: "var(--teal-lt)" },
    title: "How to write a standout nanny profile",
    description: "Tips on showcasing your experience, specialties, and personality to attract the right families.",
  },
  {
    tag: "Template",
    tagStyle: { color: "#7a6018", background: "var(--gold-lt)" },
    title: "Setting your hourly rate",
    description: "A guide to understanding market rates by city, experience level, and specialty in Canada.",
  },
  {
    tag: "Article",
    tagStyle: { color: "var(--coral)", background: "var(--coral-lt)" },
    title: "First-day checklist with a new family",
    description: "What to ask, what to share, and how to build a strong relationship from day one.",
  },
  {
    tag: "Guide",
    tagStyle: { color: "var(--teal)", background: "var(--teal-lt)" },
    title: "Understanding your rights as a caregiver in Canada",
    description: "An overview of employment standards, pay requirements, and protections for nannies across provinces.",
  },
  {
    tag: "Checklist",
    tagStyle: { color: "var(--sage)", background: "#f0f4ee" },
    title: "Emergency preparedness for nannies",
    description: "What information to collect from families, and how to handle common childcare emergencies calmly.",
  },
];

export default function ResourcesList() {
  return (
    <section style={{ background: "var(--bg)", padding: "90px 0" }}>
      <div className="mx-auto px-[52px] max-w-[1080px] max-md:px-6">
        <RevealWrapper>
          <div
            className="inline-flex items-center gap-[7px] text-[12px] font-bold uppercase tracking-widest rounded-[30px] px-[13px] py-[5px] mb-[18px] border"
            style={{ color: "var(--teal)", background: "var(--teal-lt)", borderColor: "var(--teal-mid)" }}
          >
            Resources
          </div>
          <h2 className="font-display leading-[1.1] tracking-[-0.02em] mb-4" style={{ fontSize: "clamp(28px,3.5vw,42px)" }}>
            Guides to help you <em style={{ color: "var(--teal)" }}>thrive</em>
          </h2>
          <p className="text-[16px] leading-[1.75] mb-10 max-w-[540px]" style={{ color: "var(--muted)" }}>
            Practical resources from our team and childcare professionals — free for all KinSittr nannies.
          </p>
        </RevealWrapper>

        <RevealWrapper delay={0.1}>
          <div className="rounded-[18px] overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            {resources.map((r, i) => (
              <div key={r.title} style={i === resources.length - 1 ? { borderBottom: "none" } : {}}>
                <ResourceItem {...r} />
              </div>
            ))}
          </div>
        </RevealWrapper>
      </div>
    </section>
  );
}
