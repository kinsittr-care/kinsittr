type AvatarTone = "green" | "cream" | "rose";

const palette: Record<AvatarTone, { bg: string; fg: string }> = {
  green: { bg: "#2d5a3d", fg: "#f6efd9" },
  cream: { bg: "#e9dfc6", fg: "#1f4029" },
  rose:  { bg: "#d8b2a5", fg: "#5a2317" },
};

export default function NannyAvatar({
  initials,
  size = 44,
  tone = "green",
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
        fontFamily: "DM Serif Display, var(--font-dm-serif), serif",
        fontSize: size * 0.36,
        letterSpacing: ".01em",
        boxShadow: "inset 0 1px 2px rgba(0,0,0,.08), 0 2px 8px rgba(45,90,61,.18)",
      }}
    >
      {initials}
    </div>
  );
}
