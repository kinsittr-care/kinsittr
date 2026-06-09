type AvatarTone = "clay" | "muted" | "plum";

const palette: Record<AvatarTone, { bg: string; fg: string }> = {
  clay:  { bg: "var(--admin-clay)",      fg: "#fff" },
  muted: { bg: "var(--admin-ink-faint)", fg: "#fff" },
  plum:  { bg: "var(--admin-plum)",      fg: "#fff" },
};

export default function AdminAvatar({
  initials,
  size = 44,
  tone = "clay",
}: {
  initials: string;
  size?: number;
  tone?: AvatarTone;
}) {
  const { bg, fg } = palette[tone];
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0 font-display tracking-[.01em]"
      style={{ width: size, height: size, background: bg, color: fg, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  );
}
