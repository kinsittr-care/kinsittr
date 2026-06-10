import type { ReactNode } from "react";

export type PillTone = "approved" | "paid" | "pending" | "completed" | "declined" | "neutral";

const tones: Record<PillTone, { bg: string; fg: string; bd: string }> = {
  approved:  { bg: "var(--nanny-green-lt)",  fg: "var(--nanny-green)",    bd: "var(--nanny-green-mid)" },
  paid:      { bg: "var(--nanny-green-lt)",  fg: "var(--nanny-green)",    bd: "var(--nanny-green-mid)" },
  pending:   { bg: "var(--nanny-amber-lt)",  fg: "var(--nanny-amber)",    bd: "color-mix(in srgb, var(--nanny-amber) 40%, transparent)" },
  completed: { bg: "var(--nanny-card-soft)", fg: "var(--nanny-ink-mute)", bd: "var(--nanny-border-soft)" },
  declined:  { bg: "var(--nanny-rose-lt)",   fg: "var(--nanny-rose)",     bd: "color-mix(in srgb, var(--nanny-rose) 35%, transparent)" },
  neutral:   { bg: "var(--nanny-card-soft)", fg: "var(--nanny-ink-mute)", bd: "var(--nanny-border)" },
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
      className="inline-flex items-center gap-[5px] px-[11px] py-1 rounded-full text-[12.5px] font-semibold tracking-[.01em] border"
      style={{ background: t.bg, color: t.fg, borderColor: t.bd }}
    >
      {children}
    </span>
  );
}
