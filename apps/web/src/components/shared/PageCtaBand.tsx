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
      className="relative text-center px-[52px] py-[72px] overflow-hidden max-md:px-7 max-md:py-14"
      style={{ background: isDark ? "var(--teal-dk)" : "var(--teal)" }}
    >
      {/* subtle radial overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% -20%, rgba(194,216,216,.07), transparent 65%)" }}
      />

      <h2
        className="font-display text-white mb-3 relative"
        style={{ fontSize: "clamp(28px, 4vw, 44px)" }}
      >
        {heading}
      </h2>
      <p
        className="text-[16px] leading-[1.7] max-w-[380px] mx-auto mb-7 relative"
        style={{ color: isDark ? "rgba(255,255,255,.7)" : "rgba(255,255,255,.78)" }}
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
