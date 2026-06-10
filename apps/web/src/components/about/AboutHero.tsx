import HouseIllustration from "./HouseIllustration";
import RevealWrapper from "@/src/components/landing/RevealWrapper";

export default function AboutHero() {
  return (
    <div className="relative px-[52px] pt-[130px] pb-[90px] overflow-hidden max-md:px-6 max-md:pt-[110px] max-md:pb-[70px]">
      {/* bg blobs */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" fill="none">
        <circle cx="1050" cy="100" r="320" fill="#eaf2f2" opacity=".5" />
        <circle cx="100"  cy="550" r="200" fill="#fdf6e3" opacity=".4" />
      </svg>

      <div className="relative max-w-[1000px] mx-auto grid grid-cols-2 gap-[72px] items-center max-md:grid-cols-1 max-md:gap-10">
        <div className="relative z-2">
          <RevealWrapper>
            <div
              className="inline-flex items-center gap-[7px] text-[12px] font-bold uppercase tracking-widest rounded-[30px] px-[13px] py-[5px] mb-[18px] border"
              style={{ color: "var(--teal)", background: "var(--teal-lt)", borderColor: "var(--teal-mid)" }}
            >
              Our story
            </div>
          </RevealWrapper>
          <RevealWrapper delay={0.1}>
            <h1 className="font-display leading-[1.1] tracking-[-0.02em] mb-5" style={{ fontSize: "clamp(36px,5vw,58px)" }}>
              We built what we{" "}
              <em style={{ color: "var(--teal)" }}>needed ourselves.</em>
            </h1>
          </RevealWrapper>
          <RevealWrapper delay={0.2}>
            <p className="text-[17px] leading-[1.75] max-w-[460px]" style={{ color: "var(--faint)" }}>
              KinSittr started from a simple frustration: finding trustworthy childcare was harder than it should be. So we built a platform that gets it right — for families and nannies alike.
            </p>
          </RevealWrapper>
        </div>

        <RevealWrapper delay={0.15} className="flex justify-center relative z-2 max-md:hidden">
          <HouseIllustration />
        </RevealWrapper>
      </div>
    </div>
  );
}
