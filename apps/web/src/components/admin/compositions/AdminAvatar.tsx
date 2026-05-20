import { A } from "../tokens";

type AvatarTone = "clay" | "muted" | "plum";

const palette: Record<AvatarTone, { bg: string; fg: string }> = {
  clay:  { bg: A.clay,     fg: "#fff" },
  muted: { bg: A.inkFaint, fg: "#fff" },
  plum:  { bg: A.plum,     fg: "#fff" },
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
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        color: fg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontFamily: "var(--font-dm-serif), serif",
        fontSize: size * 0.36,
        letterSpacing: ".01em",
      }}
    >
      {initials}
    </div>
  );
}
