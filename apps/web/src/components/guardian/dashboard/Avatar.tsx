interface AvatarProps {
  initials: string;
  src?: string;
  size?: number;
}

export default function Avatar({ initials, src, size = 44 }: AvatarProps) {
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
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={`${initials} avatar`}
          style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
        />
      ) : (
        initials
      )}
    </div>
  );
}
