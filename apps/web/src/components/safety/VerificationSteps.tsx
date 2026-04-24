import RevealWrapper from "@/src/components/landing/RevealWrapper";

const steps = [
  {
    num: "1",
    title: "Background check",
    description: "We run a comprehensive criminal background check on every applicant, including national and regional databases. Any red flags result in an automatic decline — no exceptions.",
  },
  {
    num: "2",
    title: "Reference verification",
    description: "We contact all provided references directly — previous families, employers, or childcare supervisors. We ask structured questions about reliability, conduct, and care quality.",
  },
  {
    num: "3",
    title: "Live interview with our team",
    description: "Every nanny completes a 30-minute video interview with a member of our KinSittr team. We assess communication, childcare experience, and values alignment before approving their profile.",
  },
];

export default function VerificationSteps() {
  return (
    <section style={{ background: "var(--bg)", padding: "90px 0" }}>
      <div className="mx-auto px-[52px] max-w-[1080px] max-md:px-6">
        <RevealWrapper>
          <div
            className="inline-flex items-center gap-[7px] text-[12px] font-bold uppercase tracking-widest rounded-[30px] px-[13px] py-[5px] mb-[18px] border"
            style={{ color: "var(--teal)", background: "var(--teal-lt)", borderColor: "var(--teal-mid)" }}
          >
            Our process
          </div>
          <h2 className="font-display leading-[1.1] tracking-[-0.02em] mb-4" style={{ fontSize: "clamp(28px,3.5vw,42px)" }}>
            Three layers of <em style={{ color: "var(--teal)" }}>verification</em>
          </h2>
          <p className="text-[16px] leading-[1.75] mb-10 max-w-[540px]" style={{ color: "var(--muted)" }}>
            No shortcuts. Every nanny goes through all three steps — in order — before joining the platform.
          </p>
        </RevealWrapper>

        <div className="flex flex-col" style={{ gap: 2 }}>
          {steps.map((s, i) => (
            <RevealWrapper key={s.num} delay={i * 100}>
              <div
                className="flex gap-6 items-start bg-white p-[28px]"
                style={{
                  borderRadius: i === 0 ? "14px 14px 0 0" : i === steps.length - 1 ? "0 0 14px 14px" : 0,
                  border: "1px solid var(--border)",
                  borderBottom: i === steps.length - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                <div
                  className="w-[44px] h-[44px] rounded-full flex items-center justify-center shrink-0 font-bold text-[16px]"
                  style={{ background: "var(--teal-lt)", color: "var(--teal)" }}
                >
                  {s.num}
                </div>
                <div>
                  <h3 className="font-semibold text-[17px] mb-2" style={{ color: "var(--brand-text)" }}>
                    {s.title}
                  </h3>
                  <p className="text-[14.5px] leading-[1.75]" style={{ color: "var(--muted)" }}>
                    {s.description}
                  </p>
                </div>
              </div>
            </RevealWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
