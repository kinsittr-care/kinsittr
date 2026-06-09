import type { CSSProperties, ReactNode } from "react";

export type PillTone = "neutral" | "clay" | "green" | "amber" | "red" | "completed";

const tones: Record<PillTone, { bg: string; fg: string; bd: string }> = {
  neutral:   { bg: "var(--admin-bg-soft)",    fg: "var(--admin-ink-mid)",  bd: "var(--admin-border)" },
  clay:      { bg: "var(--admin-clay-soft)",  fg: "var(--admin-clay)",     bd: "color-mix(in srgb, var(--admin-clay) 40%, transparent)" },
  green:     { bg: "var(--admin-green-light)", fg: "var(--admin-green)",   bd: "color-mix(in srgb, var(--admin-green) 55%, transparent)" },
  amber:     { bg: "var(--admin-amber-light)", fg: "var(--admin-amber)",   bd: "color-mix(in srgb, var(--admin-amber) 55%, transparent)" },
  red:       { bg: "var(--admin-red-light)",  fg: "var(--admin-red)",      bd: "color-mix(in srgb, var(--admin-red) 55%, transparent)" },
  completed: { bg: "transparent",             fg: "var(--admin-ink-soft)", bd: "var(--admin-border)" },
};

export default function AdminPill({
  children,
  tone = "neutral",
  style,
}: {
  children: ReactNode;
  tone?: PillTone;
  style?: CSSProperties;
}) {
  const t = tones[tone];
  return (
    <span
      className="inline-flex items-center gap-[6px] px-[11px] py-[5px] rounded-full text-[12.5px] font-semibold tracking-[.01em] border"
      style={{ background: t.bg, color: t.fg, borderColor: t.bd, ...style }}
    >
      {children}
    </span>
  );
}
