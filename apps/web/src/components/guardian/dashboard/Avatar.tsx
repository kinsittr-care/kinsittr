interface AvatarProps {
  initials: string;
  size?: number;
}

export default function Avatar({ initials, size = 44 }: AvatarProps) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: "var(--teal)", color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, fontWeight: 600, fontSize: size * 0.33,
        letterSpacing: "0.04em",
        boxShadow: "0 2px 8px rgba(58,90,90,.28)",
      }}
    >
      {initials}
    </div>
  );
}
