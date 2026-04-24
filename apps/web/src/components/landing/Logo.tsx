import type { LogoProps } from "@/src/types/landing";

export default function Logo({ dark = false }: LogoProps) {
  return (
    <a href="#" className="flex items-center gap-[9px] no-underline">
      <div
        className="w-8 h-8 rounded-[9px] flex items-center justify-center flex-shrink-0"
        style={{ background: "var(--teal)" }}
      >
        <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
          <path
            d="M8 1C5 1 2 4.5 2 7.5c0 5 6 9.5 6 9.5s6-4.5 6-9.5C14 4.5 11 1 8 1z"
            fill="white"
            opacity=".9"
          />
          <circle cx="8" cy="7.5" r="2.2" fill="#3a5a5a" />
        </svg>
      </div>
      <span
        className="font-display text-[21px]"
        style={{ color: dark ? "#fff" : "var(--brand-text)" }}
      >
        Kin<span style={{ color: dark ? "var(--teal-mid)" : "var(--teal)" }}>Sittr</span>
      </span>
    </a>
  );
}
