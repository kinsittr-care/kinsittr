import type { ReactNode } from "react";
import { N } from "./tokens";

export type PillTone = "approved" | "paid" | "pending" | "completed" | "declined" | "neutral";

const tones: Record<PillTone, { bg: string; fg: string; bd: string }> = {
  approved:  { bg: N.greenLt,  fg: N.green, bd: N.greenMid },
  paid:      { bg: N.greenLt,  fg: N.green, bd: N.greenMid },
  pending:   { bg: N.amberLt,  fg: N.amber, bd: `color-mix(in srgb, var(--nanny-amber) 40%, transparent)` },
  completed: { bg: N.cardSoft, fg: N.inkMute, bd: N.borderSoft },
  declined:  { bg: N.roseLt,   fg: N.rose,  bd: `color-mix(in srgb, var(--nanny-rose) 35%, transparent)` },
  neutral:   { bg: N.cardSoft, fg: N.inkMute, bd: N.border },
};

export default function NannyPill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: PillTone;
}) {
  const t = tones[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 11px",
        borderRadius: 999,
        fontSize: 12.5,
        fontWeight: 600,
        letterSpacing: ".01em",
        background: t.bg,
        color: t.fg,
        border: `1px solid ${t.bd}`,
      }}
    >
      {children}
    </span>
  );
}
