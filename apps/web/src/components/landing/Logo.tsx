import { BrandMarkIcon } from "@/src/components/icons";
import type { LogoProps } from "@/src/types/components/landing";
import Link from "next/link";

export default function Logo({ dark = false }: LogoProps) {
  return (
    <Link href="/" className="flex items-center gap-[9px] no-underline">
      <div
        className="w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0"
        style={{ background: "var(--teal)" }}
      >
        <BrandMarkIcon />
      </div>
      <span
        className="font-display text-[21px]"
        style={{ color: dark ? "#fff" : "var(--brand-text)" }}
      >
        Kin<span style={{ color: dark ? "var(--teal-mid)" : "var(--teal)" }}>Sittr</span>
      </span>
    </Link>
  );
}
