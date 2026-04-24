import HeroIllustration from "./HeroIllustration";
import RevealWrapper from "./RevealWrapper";

export default function HeroSection() {
  return (
    <div className="relative min-h-screen grid grid-cols-2 items-center gap-10 pt-[110px] px-[52px] pb-[80px] overflow-hidden max-md:grid-cols-1 max-md:px-7 max-md:pt-[100px] max-md:pb-[60px]">
      {/* Background blobs */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          width: 560, height: 560,
          background: "radial-gradient(circle at 40%,rgba(58,90,90,.1),transparent 70%)",
          top: -120, right: -80,
        }}
      />
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          width: 320, height: 320,
          background: "radial-gradient(circle,rgba(200,164,74,.1),transparent 70%)",
          bottom: 20, left: -60,
        }}
      />

      {/* Left: text */}
      <div className="relative z-2">
        <RevealWrapper>
          <div
            className="inline-flex items-center gap-[7px] text-[13px] font-semibold rounded-[30px] px-[13px] py-[5px] mb-6 border"
            style={{ color: "var(--teal)", background: "var(--teal-lt)", borderColor: "var(--teal-mid)" }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1l1.6 4.8H14l-4.4 3.2 1.7 5.1L7 11.3l-4.3 2.8 1.7-5.1L0 5.8h5.4z" fill="var(--teal)" />
            </svg>
            Childcare, reimagined
          </div>
        </RevealWrapper>

        <RevealWrapper delay={0.1}>
          <h1 className="font-display mb-[22px] leading-[1.08] tracking-[-0.02em]" style={{ fontSize: "clamp(42px, 5vw, 66px)" }}>
            Care that feels like <em style={{ color: "var(--teal)" }}>family.</em>
          </h1>
        </RevealWrapper>

        <RevealWrapper delay={0.2}>
          <p className="text-[17px] leading-[1.75] mb-9 max-w-[440px]" style={{ color: "var(--muted)" }}>
            KinSittr connects families and nannies in a space built on trust, warmth, and simplicity.
            Find someone who truly clicks with your children — or bring your caregiving gift to families who need you.
          </p>
        </RevealWrapper>

        <RevealWrapper delay={0.3}>
          <div className="flex gap-3 flex-wrap">
            <a href="#" className="btn-cta">
              I need a nanny
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M2 7.5h11M8 3l4.5 4.5L8 12" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a href="#" className="btn-outline">I&apos;m a nanny →</a>
          </div>
        </RevealWrapper>

        <RevealWrapper delay={0.4}>
          <div className="mt-7 text-[13px] flex items-center gap-[18px]" style={{ color: "var(--faint)" }}>
            {[
              {
                label: "All nannies verified",
                icon: (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1a6 6 0 1 0 0 12A6 6 0 0 0 7 1z" stroke="var(--faint)" strokeWidth="1.4" />
                    <path d="M5 7l1.5 1.5L9 5" stroke="var(--faint)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
              },
              {
                label: "Free to browse",
                icon: (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="1" y="4" width="12" height="9" rx="2" stroke="var(--faint)" strokeWidth="1.4" />
                    <path d="M9 4V3a2 2 0 0 0-4 0v1" stroke="var(--faint)" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                ),
              },
              {
                label: "No subscription",
                icon: (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7h10" stroke="var(--faint)" strokeWidth="1.4" strokeLinecap="round" />
                    <path d="M7 2v10" stroke="var(--faint)" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                ),
              },
            ].map(({ icon, label }) => (
              <span key={label} className="flex items-center gap-[5px]">
                {icon}
                {label}
              </span>
            ))}
          </div>
        </RevealWrapper>
      </div>

      {/* Right: illustration */}
      <div className="relative z-2 flex items-center justify-center max-md:hidden">
        <HeroIllustration />
      </div>
    </div>
  );
}
