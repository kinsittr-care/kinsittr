interface LegalSection {
  heading: string;
  body: string | string[];
}

interface LegalDocProps {
  title: string;
  subtitle?: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export default function LegalDoc({ title, subtitle, lastUpdated, sections }: LegalDocProps) {
  return (
    <section style={{ background: "var(--bg)", paddingTop: 110, paddingBottom: 100 }}>
      <div className="mx-auto px-[52px] max-w-[760px] max-md:px-6 max-md:pt-28">
        {/* Header */}
        <div className="mb-12">
          <p className="text-[12px] font-semibold uppercase tracking-[0.09em] mb-3" style={{ color: "var(--muted)" }}>
            Last updated: {lastUpdated}
          </p>
          <h1 className="font-display leading-tight mb-4" style={{ fontSize: "clamp(30px, 4vw, 46px)", color: "var(--brand-text)" }}>
            {title}
          </h1>
          {subtitle && (
            <p className="text-[16px] leading-[1.75]" style={{ color: "var(--muted)" }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="mb-12 h-px" style={{ background: "var(--border)" }} />

        {/* Sections */}
        <div className="flex flex-col gap-[48px]">
          {sections.map((section, i) => (
            <div key={i}>
              <h2
                className="font-display mb-4"
                style={{ fontSize: "clamp(18px, 2.5vw, 24px)", color: "var(--brand-text)" }}
              >
                {i + 1}. {section.heading}
              </h2>
              {Array.isArray(section.body) ? (
                <ul className="flex flex-col gap-[10px] list-none p-0 m-0">
                  {section.body.map((item, j) => (
                    <li key={j} className="flex gap-[10px] text-[15px] leading-[1.75]" style={{ color: "var(--muted)" }}>
                      <span className="mt-[7px] shrink-0 w-[5px] h-[5px] rounded-full" style={{ background: "var(--teal)" }} />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[15px] leading-[1.85]" style={{ color: "var(--muted)" }}>
                  {section.body}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div
          className="mt-16 rounded-[14px] px-6 py-5"
          style={{ background: "var(--teal-lt)", border: "1px solid var(--teal-mid)" }}
        >
          <p className="text-[14px] leading-[1.7]" style={{ color: "var(--teal-dk)" }}>
            Questions about this document? Reach us at{" "}
            <a href="mailto:kinsittr@gmail.com" style={{ color: "var(--teal)", fontWeight: 600 }}>
              kinsittr@gmail.com
            </a>
            {" "}or through our{" "}
            <a href="/contact" style={{ color: "var(--teal)", fontWeight: 600 }}>
              contact page
            </a>.
          </p>
        </div>
      </div>
    </section>
  );
}
