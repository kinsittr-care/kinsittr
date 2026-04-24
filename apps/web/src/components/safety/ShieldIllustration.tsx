export default function ShieldIllustration() {
  return (
    <svg width="300" height="300" viewBox="0 0 300 300" fill="none" aria-hidden="true">
      {/* corner sparkles */}
      <path d="M252 38 l3 9 3-9-9 3 9 3z" fill="#c8a44a" opacity=".8" />
      <path d="M48 50 l2 6 2-6-6 2 6 2z" fill="#d9826a" opacity=".7" />
      <path d="M265 215 l2 6 2-6-6 2 6 2z" fill="#7a9e7e" opacity=".7" />
      <path d="M40 225 l2.5 7.5 2.5-7.5-7.5 2.5 7.5 2.5z" fill="#c8a44a" opacity=".6" />

      {/* shield */}
      <path d="M150 30 L240 68 L240 148 Q240 210 150 250 Q60 210 60 148 L60 68 Z" fill="#2a4444" />
      <path d="M150 46 L224 78 L224 148 Q224 200 150 234 Q76 200 76 148 L76 78 Z" fill="#3a5a5a" />

      {/* bold checkmark */}
      <path d="M108 148 l28 28 56-56" stroke="#fff" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* family silhouettes below */}
      <circle cx="110" cy="275" r="14" fill="var(--teal-lt)" opacity=".8" />
      <circle cx="150" cy="268" r="18" fill="var(--teal-mid)" opacity=".7" />
      <circle cx="190" cy="275" r="14" fill="var(--teal-lt)" opacity=".8" />
    </svg>
  );
}
