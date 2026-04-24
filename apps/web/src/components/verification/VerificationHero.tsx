import BadgeIllustration from "./BadgeIllustration";

export default function VerificationHero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "var(--gold-lt)", borderBottom: "1px solid #e0cc88", paddingTop: 120, paddingBottom: 72 }}
    >
      <div className="relative mx-auto px-[52px] max-w-[1080px] grid grid-cols-2 gap-[60px] items-center max-md:grid-cols-1 max-md:px-6">
        <div>
          <div
            className="inline-flex items-center gap-[8px] text-[12px] font-bold uppercase tracking-[0.1em] rounded-[30px] px-[13px] py-[5px] mb-[18px] border"
            style={{ color: "#7a6018", background: "rgba(200,164,74,.18)", borderColor: "#e0cc88" }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1 L12 3.5 L12 7 Q12 11 7 13 Q2 11 2 7 L2 3.5 Z" stroke="#7a6018" strokeWidth="1.3" fill="none" />
              <path d="M4.5 7 l2 2 3-3" stroke="#7a6018" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            For nannies
          </div>
          <h1
            className="font-display leading-[1.1] tracking-[-0.02em] mb-5"
            style={{ fontSize: "clamp(32px,4.5vw,52px)", color: "var(--brand-text)" }}
          >
            Get verified.{" "}
            <em style={{ color: "var(--teal)" }}>Get discovered.</em>
          </h1>
          <p className="text-[17px] leading-[1.75] mb-9 max-w-[460px]" style={{ color: "var(--muted)" }}>
            Becoming a KinSittr-verified nanny sets you apart. Families trust verified profiles — and verified nannies get booked.
          </p>
          <a href="#apply" className="btn-gold">
            Start your application
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M2 7.5h11M8 3l4.5 4.5L8 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
        <div className="flex justify-center max-md:hidden">
          <BadgeIllustration />
        </div>
      </div>
    </section>
  );
}
