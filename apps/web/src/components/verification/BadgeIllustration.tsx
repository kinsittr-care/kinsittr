export default function BadgeIllustration() {
  return (
    <svg width="280" height="280" viewBox="0 0 280 280" fill="none" aria-hidden="true">
      {/* corner sparkles */}
      <path d="M238 30 l3 9 3-9-9 3 9 3z" fill="#c8a44a" opacity=".9" />
      <path d="M44 44 l2 6 2-6-6 2 6 2z" fill="#3a5a5a" opacity=".7" />
      <path d="M248 200 l2 6 2-6-6 2 6 2z" fill="#d9826a" opacity=".7" />
      <path d="M36 210 l2.5 7.5 2.5-7.5-7.5 2.5 7.5 2.5z" fill="#7a9e7e" opacity=".6" />

      {/* outer cream circles */}
      <circle cx="140" cy="122" r="102" fill="#fdf6e3" />
      <circle cx="140" cy="122" r="88" fill="#f5edd8" />

      {/* starburst */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const x1 = 140 + Math.cos(angle) * 66;
        const y1 = 122 + Math.sin(angle) * 66;
        const x2 = 140 + Math.cos(angle) * 86;
        const y2 = 122 + Math.sin(angle) * 86;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#e8d090" strokeWidth="3" strokeLinecap="round" opacity=".4" />;
      })}

      {/* central teal circle + checkmark */}
      <circle cx="140" cy="122" r="52" fill="#3a5a5a" />
      <path d="M116 122 l16 16 32-32" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* gold ribbon */}
      <rect x="126" y="170" width="14" height="52" rx="4" fill="#c8a44a" />
      <rect x="140" y="170" width="14" height="52" rx="4" fill="#e8d090" />
      {/* pennant tips */}
      <path d="M126 222 L119 238 L133 230z" fill="#c8a44a" />
      <path d="M154 222 L161 238 L147 230z" fill="#e8d090" />
    </svg>
  );
}
