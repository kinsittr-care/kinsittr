import { N } from "./tokens";

export default function NannyStarRating({ value, size = 15 }: { value: number; size?: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          style={{
            color: i <= value ? N.gold : N.inkFaint,
            fontSize: size,
            lineHeight: 1,
          }}
        >
          ★
        </span>
      ))}
    </span>
  );
}
