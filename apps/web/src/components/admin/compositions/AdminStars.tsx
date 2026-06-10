export default function AdminStars({ value }: { value: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="text-[16px] leading-none"
          style={{ color: i <= value ? "var(--admin-amber)" : "color-mix(in srgb, var(--admin-ink-faint) 55%, transparent)" }}
        >
          ★
        </span>
      ))}
    </span>
  );
}
