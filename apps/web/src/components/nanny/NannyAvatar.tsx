import type { CSSProperties } from "react";

type AvatarTone = "green" | "cream" | "rose";

const palette: Record<AvatarTone, { bg: string; fg: string }> = {
  green: { bg: "#2d5a3d", fg: "#f6efd9" },
  cream: { bg: "#e9dfc6", fg: "#1f4029" },
  rose:  { bg: "#d8b2a5", fg: "#5a2317" },
};

export default function NannyAvatar({
  initials,
  src,
  size = 44,
  tone = "green",
}: {
  initials: string;
  src?: string;
  size?: number;
  tone?: AvatarTone;
}) {
  const { bg, fg } = palette[tone];
  const sharedStyle: CSSProperties = {
    width: size,
    height: size,
    borderRadius: "50%",
    flexShrink: 0,
    boxShadow: "inset 0 1px 2px rgba(0,0,0,.08), 0 2px 8px rgba(45,90,61,.18)",
  };

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={initials}
        style={{ ...sharedStyle, objectFit: "cover" }}
      />
    );
  }

  return (
    <div
      style={{
        ...sharedStyle,
        background: bg,
        color: fg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "DM Serif Display, var(--font-dm-serif), serif",
        fontSize: size * 0.36,
        letterSpacing: ".01em",
      }}
    >
      {initials}
    </div>
  );
}
