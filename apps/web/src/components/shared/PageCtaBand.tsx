export default function PageCtaBand({
  heading,
  body,
  primaryCta,
  primaryHref = "#",
  secondaryCta,
  secondaryHref = "#",
  variant = "dark",
}: {
  heading: string;
  body: string;
  primaryCta?: string;
  primaryHref?: string;
  secondaryCta?: string;
  secondaryHref?: string;
  /** dark = teal-dk bg + primary button · medium = teal bg + white button */
  variant?: "dark" | "medium";
}) {
  const isDark = variant === "dark";

  return (
    <div
      className={`relative overflow-hidden px-[52px] py-[72px] text-center max-md:px-7 max-md:py-14 ${isDark ? "bg-[var(--teal-dk)]" : "bg-[var(--teal)]"}`}
    >
      {/* subtle radial overlay */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-20%,rgba(194,216,216,.07),transparent_65%)]"
      />

      <h2 className="font-display relative mb-3 text-[clamp(28px,4vw,44px)] text-white">
        {heading}
      </h2>
      <p
        className={`relative mx-auto mb-7 max-w-[380px] text-[16px] leading-[1.7] ${isDark ? "text-white/70" : "text-white/80"}`}
      >
        {body}
      </p>

      <div className="flex gap-3 justify-center flex-wrap relative">
        {primaryCta && (
          <a href={primaryHref} className={isDark ? "btn-cta" : "btn-cta-white"}>
            {primaryCta}
          </a>
        )}
        {secondaryCta && (
          <a href={secondaryHref} className="btn-ghost-dark">
            {secondaryCta}
          </a>
        )}
      </div>
    </div>
  );
}
