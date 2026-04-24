import AudienceCard from "./AudienceCard";
import RevealWrapper from "./RevealWrapper";

export default function AudienceSection() {
  return (
    <section
      id="audience"
      className="px-[52px] py-[100px] max-md:px-7 max-md:py-[70px]"
    >
      <div className="max-w-[1080px] mx-auto">
        <div className="text-center mb-[52px]">
          <RevealWrapper>
            <div
              className="text-[12px] font-bold uppercase tracking-[0.12em] mb-3"
              style={{ color: "var(--teal)" }}
            >
              Who it&apos;s for
            </div>
          </RevealWrapper>
          <RevealWrapper delay={0.1}>
            <h2
              className="font-display leading-[1.12] tracking-[-0.02em]"
              style={{ fontSize: "clamp(32px, 4vw, 50px)" }}
            >
              Made for{" "}
              <em style={{ color: "var(--teal)" }}>both sides</em> of the
              relationship
            </h2>
          </RevealWrapper>
        </div>

        <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
          <RevealWrapper>
            <AudienceCard variant="families" />
          </RevealWrapper>
          <RevealWrapper delay={0.1}>
            <AudienceCard variant="nannies" />
          </RevealWrapper>
        </div>
      </div>
    </section>
  );
}
