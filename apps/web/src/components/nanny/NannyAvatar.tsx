type AvatarTone = "green" | "cream" | "rose";

const palette: Record<AvatarTone, { bg: string; fg: string }> = {
  green: { bg: "#2d5a3d", fg: "#f6efd9" },
  cream: { bg: "#e9dfc6", fg: "#1f4029" },
  rose:  { bg: "#d8b2a5", fg: "#5a2317" },
};

const sharedCls = "rounded-full shrink-0 shadow-[inset_0_1px_2px_rgba(0,0,0,.08),0_2px_8px_rgba(45,90,61,.18)]";

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

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={initials}
        className={`${sharedCls} object-cover`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`${sharedCls} flex items-center justify-center font-display tracking-[.01em]`}
      style={{ width: size, height: size, background: bg, color: fg, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  );
}
