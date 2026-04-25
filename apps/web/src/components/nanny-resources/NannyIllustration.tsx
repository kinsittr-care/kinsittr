export default function NannyIllustration() {
  return (
    <svg width="300" height="320" viewBox="0 0 300 320" fill="none" aria-hidden="true">
      {/* sparkles */}
      <path d="M240 50 l3 9 3-9-9 3 9 3z" fill="#c8a44a" opacity=".8" />
      <path d="M60 80 l2 6 2-6-6 2 6 2z" fill="#d9826a" opacity=".7" />
      <path d="M260 180 l2 5 2-5-5 2 5 2z" fill="#fff" opacity=".5" />
      <path d="M45 200 l2 6 2-6-6 2 6 2z" fill="#c8a44a" opacity=".5" />

      {/* coral heart */}
      <path d="M210 90 c0-6-8-6-8 0 0-6-8-6-8 0 0 5 8 10 8 13 0-3 8-8 8-13z" fill="#d9826a" opacity=".8" />

      {/* nanny body */}
      {/* head */}
      <circle cx="150" cy="80" r="34" fill="#f5c9a0" />
      {/* hair */}
      <path d="M118 72 Q120 44 150 46 Q180 44 182 72 Q175 58 150 60 Q125 58 118 72z" fill="#3d2c1e" />
      {/* teal collar / top */}
      <rect x="108" y="112" width="84" height="90" rx="14" fill="#eaf2f2" />
      <path d="M130 112 L150 130 L170 112" fill="#3a5a5a" />
      {/* arms */}
      <rect x="78" y="116" width="30" height="68" rx="14" fill="#eaf2f2" />
      <rect x="192" y="116" width="30" height="68" rx="14" fill="#eaf2f2" />
      {/* legs */}
      <rect x="122" y="200" width="28" height="72" rx="12" fill="#3a5a5a" />
      <rect x="152" y="200" width="28" height="72" rx="12" fill="#3a5a5a" />
      {/* shoes */}
      <ellipse cx="136" cy="274" rx="18" ry="8" fill="#243838" />
      <ellipse cx="166" cy="274" rx="18" ry="8" fill="#243838" />

      {/* gold award badge in right hand */}
      <circle cx="218" cy="168" r="22" fill="#c8a44a" />
      <circle cx="218" cy="168" r="16" fill="#f5e088" />
      <path d="M210 168 l5 5 10-10" stroke="#c8a44a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M209 190 l4 14" stroke="#c8a44a" strokeWidth="3" strokeLinecap="round" />
      <path d="M227 190 l-4 14" stroke="#c8a44a" strokeWidth="3" strokeLinecap="round" />
      <rect x="207" y="202" width="22" height="6" rx="3" fill="#c8a44a" />
    </svg>
  );
}
