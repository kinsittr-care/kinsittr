export default function EnvelopeIllustration() {
  return (
    <svg width="200" height="140" viewBox="0 0 200 140" fill="none">
      <rect x="10" y="30" width="180" height="100" rx="10" fill="#eaf2f2" />
      <rect x="10" y="30" width="180" height="100" rx="10" stroke="var(--teal-mid)" strokeWidth="2" />
      <path d="M10 40 L100 90 L190 40" stroke="var(--teal-mid)" strokeWidth="2" fill="none" />
      {/* letter */}
      <rect x="60" y="8" width="80" height="64" rx="6" fill="#fff" stroke="var(--border)" strokeWidth="1.5" />
      <rect x="72" y="20" width="56" height="5" rx="2.5" fill="var(--teal-mid)" />
      <rect x="72" y="30" width="44" height="4" rx="2"   fill="#e2d9c8" />
      <rect x="72" y="38" width="50" height="4" rx="2"   fill="#e2d9c8" />
      {/* sparkles */}
      <path d="M168 18 l2 6 2-6-6 2 6 2z"         fill="#c8a44a" opacity=".7" />
      <path d="M22 20 l1.5 4.5 1.5-4.5-4.5 1.5 4.5 1.5z" fill="#d9826a" opacity=".6" />
    </svg>
  );
}
