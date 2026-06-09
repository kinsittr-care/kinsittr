export default function NannyStarRating({ value, size = 15 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="leading-none"
          style={{ color: i <= value ? "var(--nanny-gold)" : "var(--nanny-ink-faint)", fontSize: size }}
        >
          ★
        </span>
      ))}
    </span>
  );
}
