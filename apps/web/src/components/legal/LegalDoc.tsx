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
    <section className="bg-brand-bg pb-[100px] pt-[110px]">
      <div className="mx-auto px-[52px] max-w-[760px] max-md:px-6 max-md:pt-28">
        {/* Header */}
        <div className="mb-12">
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.09em] text-brand-faint">
            Last updated: {lastUpdated}
          </p>
          <h1 className="font-display mb-4 text-[clamp(30px,4vw,46px)] leading-tight text-brand-text">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[16px] leading-[1.75] text-brand-faint">
              {subtitle}
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="mb-12 h-px bg-(--border)" />

        {/* Sections */}
        <div className="flex flex-col gap-[48px]">
          {sections.map((section, i) => (
            <div key={i}>
              <h2
                className="font-display mb-4 text-[clamp(18px,2.5vw,24px)] text-brand-text"
              >
                {i + 1}. {section.heading}
              </h2>
              {Array.isArray(section.body) ? (
                <ul className="flex flex-col gap-[10px] list-none p-0 m-0">
                  {section.body.map((item, j) => (
                    <li key={j} className="flex gap-[10px] text-[15px] leading-[1.75] text-brand-faint">
                      <span className="mt-[7px] h-[5px] w-[5px] shrink-0 rounded-full bg-teal" />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[15px] leading-[1.85] text-brand-faint">
                  {section.body}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div
          className="mt-16 rounded-[14px] border border-teal-mid bg-teal-lt px-6 py-5"
        >
          <p className="text-[14px] leading-[1.7] text-teal-dk">
            Questions about this document? Reach us at{" "}
            <a href="mailto:kinsittr@gmail.com" className="font-semibold text-teal">
              kinsittr@gmail.com
            </a>
            {" "}or through our{" "}
            <a href="/contact" className="font-semibold text-teal">
              contact page
            </a>.
          </p>
        </div>
      </div>
    </section>
  );
}
