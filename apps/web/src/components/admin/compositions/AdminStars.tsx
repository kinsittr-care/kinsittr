import { A } from "../tokens";

export default function AdminStars({ value }: { value: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          style={{
            color:
              i <= value
                ? A.amber
                : "color-mix(in srgb, var(--admin-ink-faint) 55%, transparent)",
            fontSize: 16,
            lineHeight: 1,
          }}
        >
          ★
        </span>
      ))}
    </span>
  );
}
