import RevealWrapper from "@/src/components/landing/RevealWrapper";

export default function StorySection() {
  return (
    <section className="px-[52px] py-[60px] max-md:px-6" style={{ background: "var(--bg-warm)" }}>
      <div className="max-w-[700px] mx-auto">
        <RevealWrapper>
          <div className="text-[12px] font-bold uppercase tracking-[0.12em] mb-4" style={{ color: "var(--teal)" }}>
            The backstory
          </div>
          <div className="text-[16.5px] leading-[1.85] space-y-[22px]" style={{ color: "var(--muted)" }}>
            <p>
              KinSittr was founded in 2026 by a small team childcare professionals who kept running into the same wall:{" "}
              <strong style={{ color: "var(--brand-text)", fontWeight: 600 }}>existing platforms treated childcare like a gig economy</strong>.
              Post a job, get flooded with applicants, sort through unverified profiles, hope for the best.
            </p>
            <p>
              We believed families deserved better — a{" "}
              <strong style={{ color: "var(--brand-text)", fontWeight: 600 }}>curated, verified network of caregivers</strong>{" "}
              who are genuinely passionate about working with children. And nannies deserved a platform that{" "}
              <strong style={{ color: "var(--brand-text)", fontWeight: 600 }}>treats them as professionals</strong>, not just labourers.
            </p>
            <p>
              So we built KinSittr. A place where every connection starts with trust, and every booking ends with confidence.
            </p>
          </div>
        </RevealWrapper>
      </div>
    </section>
  );
}
