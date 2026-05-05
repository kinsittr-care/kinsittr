type TagVariant = "default" | "accent" | "green";

interface TagProps {
  label: string;
  variant?: TagVariant;
}

const STYLES: Record<TagVariant, { bg: string; border: string; color: string }> = {
  default: { bg: "#fff", border: "var(--border)", color: "#555" },
  accent:  { bg: "var(--gold-lt)", border: "#e8d090", color: "#8a6e20" },
  green:   { bg: "var(--teal-lt)", border: "var(--teal-mid)", color: "var(--teal)" },
};

export default function Tag({ label, variant = "default" }: TagProps) {
  const s = STYLES[variant];
  return (
    <span
      style={{
        background: s.bg, border: `1px solid ${s.border}`, color: s.color,
        borderRadius: 20, padding: "3px 11px", fontSize: 12, fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}
