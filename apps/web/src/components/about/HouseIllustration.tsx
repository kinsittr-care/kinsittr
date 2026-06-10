export default function HouseIllustration() {
  return (
    <svg width="300" height="300" viewBox="0 0 300 300" fill="none">
      {/* house */}
      <rect x="60" y="150" width="180" height="130" rx="8" fill="#eaf2f2" />
      <rect x="60" y="150" width="180" height="130" rx="8" fill="#3a5a5a" opacity=".08" />
      {/* roof */}
      <polygon points="44,155 150,60 256,155" fill="#3a5a5a" />
      <polygon points="60,155 150,74 240,155" fill="#2a4444" />
      {/* door */}
      <rect x="120" y="220" width="60" height="60" rx="6" fill="#c8a44a" />
      <circle cx="172" cy="252" r="4" fill="#fff" />
      {/* windows */}
      <rect x="74" y="168" width="44" height="40" rx="5" fill="#fff" />
      <line x1="96" y1="168" x2="96" y2="208" stroke="#eaf2f2" strokeWidth="2" />
      <line x1="74" y1="188" x2="118" y2="188" stroke="#eaf2f2" strokeWidth="2" />
      <rect x="182" y="168" width="44" height="40" rx="5" fill="#fff" />
      <line x1="204" y1="168" x2="204" y2="208" stroke="#eaf2f2" strokeWidth="2" />
      <line x1="182" y1="188" x2="226" y2="188" stroke="#eaf2f2" strokeWidth="2" />
      {/* chimney */}
      <rect x="188" y="80" width="22" height="38" rx="4" fill="#1c3838" />
      {/* ground */}
      <rect x="20" y="278" width="260" height="22" rx="11" fill="#7a9e7e" />
      {/* path */}
      <rect x="133" y="266" width="34" height="14" rx="4" fill="#d4c8a8" />
      {/* figures */}
      <circle cx="90" cy="264" r="12" fill="#d4956a" />
      <rect x="82" y="274" width="16" height="20" rx="6" fill="#d9826a" />
      <circle cx="120" cy="260" r="10" fill="#e8b888" />
      <rect x="113" y="268" width="14" height="16" rx="5" fill="#7a9e7e" />
      {/* heart */}
      <path d="M145 44 C145 41 140 37 135 41 C130 45 135 51 145 57 C155 51 160 45 155 41 C150 37 145 41 145 44z" fill="#d9826a" />
      {/* sparkles */}
      <path d="M250 50 l2.5 7.5 2.5-7.5-7.5 2.5 7.5 2.5z" fill="#c8a44a" />
      <path d="M40 100 l2 6 2-6-6 2 6 2z" fill="#c8a44a" opacity=".6" />
    </svg>
  );
}
