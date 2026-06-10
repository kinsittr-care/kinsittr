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
    <section className="bg-brand-bg py-[90px]">
      <div className="mx-auto px-[52px] max-w-[1080px] max-md:px-6">
        <RevealWrapper>
          <div
            className="mb-[18px] inline-flex items-center gap-[7px] rounded-[30px] border border-teal-mid bg-teal-lt px-[13px] py-[5px] text-[12px] font-bold uppercase tracking-widest text-teal"
          >
            Our process
          </div>
          <h2 className="font-display mb-4 text-[clamp(28px,3.5vw,42px)] leading-[1.1] tracking-[-0.02em]">
            Three layers of <em className="text-teal">verification</em>
          </h2>
          <p className="mb-10 max-w-[540px] text-[16px] leading-[1.75] text-brand-faint">
            No shortcuts. Every nanny goes through all three steps — in order — before joining the platform.
          </p>
        </RevealWrapper>

        <div className="flex flex-col gap-0.5">
          {steps.map((s, i) => (
            <RevealWrapper key={s.num} delay={i * 0.1}>
              <div
                className={`flex items-start gap-6 border border-(--border) bg-white p-[28px] ${i === 0 ? "rounded-t-[14px]" : ""} ${i === steps.length - 1 ? "rounded-b-[14px]" : "border-b-0"}`}
              >
                <div className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-teal-lt text-[16px] font-bold text-teal">
                  {s.num}
                </div>
                <div>
                  <h3 className="mb-2 text-[17px] font-semibold text-brand-text">
                    {s.title}
                  </h3>
                  <p className="text-[14.5px] leading-[1.75] text-brand-faint">
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
