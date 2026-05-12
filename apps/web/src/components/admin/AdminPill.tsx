import type { CSSProperties, ReactNode } from "react";
import { A } from "./tokens";

export type PillTone = "neutral" | "clay" | "green" | "amber" | "red" | "completed";

const tones: Record<PillTone, { bg: string; fg: string; bd: string }> = {
  neutral:   { bg: A.bgSoft,      fg: A.inkMid,  bd: A.border },
  clay:      { bg: A.claySoft,    fg: A.clay,    bd: "color-mix(in srgb, var(--admin-clay) 40%, transparent)" },
  green:     { bg: A.greenLight,  fg: A.green,   bd: "color-mix(in srgb, var(--admin-green) 55%, transparent)" },
  amber:     { bg: A.amberLight,  fg: A.amber,   bd: "color-mix(in srgb, var(--admin-amber) 55%, transparent)" },
  red:       { bg: A.redLight,    fg: A.red,     bd: "color-mix(in srgb, var(--admin-red) 55%, transparent)" },
  completed: { bg: "transparent", fg: A.inkSoft, bd: A.border },
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
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 11px",
        borderRadius: 999,
        fontSize: 12.5,
        fontWeight: 600,
        letterSpacing: ".01em",
        background: t.bg,
        color: t.fg,
        border: `1px solid ${t.bd}`,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
