import ShieldIllustration from "./ShieldIllustration";

export default function SafetyHero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "var(--teal-dk)", paddingTop: 120, paddingBottom: 80 }}
    >
      {/* bg circles */}
      <svg className="absolute top-0 right-0 pointer-events-none" width="380" height="380" viewBox="0 0 380 380" fill="none" aria-hidden="true">
        <circle cx="300" cy="80" r="200" fill="rgba(194,216,216,.08)" />
      </svg>
      <svg className="absolute bottom-0 left-0 pointer-events-none" width="280" height="280" viewBox="0 0 280 280" fill="none" aria-hidden="true">
        <circle cx="60" cy="220" r="160" fill="rgba(194,216,216,.06)" />
      </svg>

      <div className="relative mx-auto px-[52px] max-w-[1080px] grid grid-cols-2 gap-[60px] items-center max-md:grid-cols-1 max-md:px-6">
        <div>
          <div className="inline-flex items-center gap-[8px] mb-[18px]" style={{ color: "var(--teal-mid)" }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 1.5 L15.5 4.5 L15.5 9 Q15.5 14 9 16.5 Q2.5 14 2.5 9 L2.5 4.5 Z" stroke="var(--teal-mid)" strokeWidth="1.5" fill="none" />
              <path d="M6 9 l2 2 4-4" stroke="var(--teal-mid)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[13px] font-bold uppercase tracking-[0.1em]">Trust &amp; Safety</span>
          </div>
          <h1
            className="font-display leading-[1.1] tracking-[-0.02em] text-white mb-5"
            style={{ fontSize: "clamp(32px,4.5vw,52px)" }}
          >
            Your family&apos;s safety is our{" "}
            <em style={{ color: "var(--teal-mid)" }}>foundation.</em>
          </h1>
          <p className="text-[17px] leading-[1.75] max-w-[520px]" style={{ color: "rgba(255,255,255,.72)" }}>
            We take the worry out of childcare. Every nanny on KinSittr passes a rigorous multi-step process before they&apos;re ever visible to families.
          </p>
        </div>
        <div className="flex justify-center max-md:hidden">
          <ShieldIllustration />
        </div>
      </div>
    </section>
  );
}
