export default function HeroIllustration() {
  return (
    <div className="float-b relative w-[440px] h-[480px]">
      <svg
        width="440"
        height="480"
        viewBox="0 0 440 480"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background blob */}
        <ellipse cx="220" cy="260" rx="195" ry="195" fill="#eaf2f2" opacity=".7" />
        {/* Ground */}
        <ellipse cx="218" cy="390" rx="150" ry="18" fill="#c2d8d8" opacity=".4" />

        {/* Child 1 (left) */}
        <circle cx="140" cy="270" r="28" fill="#fdf6e3" />
        <circle cx="140" cy="250" r="20" fill="#deb887" />
        <ellipse cx="140" cy="232" rx="20" ry="10" fill="#8B5E3C" />
        <circle cx="133" cy="249" r="3" fill="#3a2a1a" />
        <circle cx="147" cy="249" r="3" fill="#3a2a1a" />
        <path d="M133 257 Q140 263 147 257" stroke="#3a2a1a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <rect x="124" y="278" width="32" height="44" rx="12" fill="#d9826a" />
        <path d="M124 292 Q104 302 108 318" stroke="#d9826a" strokeWidth="10" strokeLinecap="round" />
        <path d="M156 292 Q176 302 172 318" stroke="#d9826a" strokeWidth="10" strokeLinecap="round" />
        <rect x="126" y="318" width="14" height="36" rx="7" fill="#f5d0a0" />
        <rect x="144" y="318" width="14" height="36" rx="7" fill="#f5d0a0" />
        <ellipse cx="133" cy="356" rx="10" ry="6" fill="#3a5a5a" />
        <ellipse cx="151" cy="356" rx="10" ry="6" fill="#3a5a5a" />

        {/* Adult / nanny (center) */}
        <circle cx="218" cy="210" r="34" fill="#fdf6e3" />
        <circle cx="218" cy="188" r="24" fill="#c8956a" />
        <path d="M194 182 Q218 162 242 182 Q242 168 218 162 Q194 168 194 182z" fill="#2a1a0a" />
        <circle cx="210" cy="186" r="3.5" fill="#2a1a0a" />
        <circle cx="226" cy="186" r="3.5" fill="#2a1a0a" />
        <path d="M209 196 Q218 204 227 196" stroke="#2a1a0a" strokeWidth="2" fill="none" strokeLinecap="round" />
        <rect x="196" y="218" width="44" height="56" rx="16" fill="#3a5a5a" />
        <path d="M196 232 Q168 248 152 268" stroke="#3a5a5a" strokeWidth="12" strokeLinecap="round" />
        <path d="M240 232 Q268 248 284 268" stroke="#3a5a5a" strokeWidth="12" strokeLinecap="round" />
        <rect x="199" y="270" width="18" height="44" rx="9" fill="#f0d0a0" />
        <rect x="221" y="270" width="18" height="44" rx="9" fill="#f0d0a0" />
        <ellipse cx="208" cy="316" rx="13" ry="7" fill="#1c1a17" />
        <ellipse cx="230" cy="316" rx="13" ry="7" fill="#1c1a17" />

        {/* Child 2 (right) */}
        <circle cx="296" cy="270" r="28" fill="#fdf6e3" />
        <circle cx="296" cy="250" r="20" fill="#e8a878" />
        <circle cx="280" cy="236" r="10" fill="#3a2a1a" />
        <circle cx="296" cy="232" r="11" fill="#3a2a1a" />
        <circle cx="312" cy="236" r="10" fill="#3a2a1a" />
        <circle cx="289" cy="249" r="3" fill="#2a1a0a" />
        <circle cx="303" cy="249" r="3" fill="#2a1a0a" />
        <path d="M289 258 Q296 265 303 258" stroke="#2a1a0a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <rect x="280" y="278" width="32" height="44" rx="12" fill="#7a9e7e" />
        <path d="M280 292 Q260 302 264 318" stroke="#7a9e7e" strokeWidth="10" strokeLinecap="round" />
        <path d="M312 292 Q332 302 328 318" stroke="#7a9e7e" strokeWidth="10" strokeLinecap="round" />
        <rect x="282" y="318" width="14" height="36" rx="7" fill="#f5d0a0" />
        <rect x="300" y="318" width="14" height="36" rx="7" fill="#f5d0a0" />
        <ellipse cx="289" cy="356" rx="10" ry="6" fill="#7a9e7e" />
        <ellipse cx="307" cy="356" rx="10" ry="6" fill="#7a9e7e" />

        {/* Sun */}
        <circle cx="370" cy="80" r="26" fill="#fdf6e3" stroke="#e8d88c" strokeWidth="2" />
        <circle cx="370" cy="80" r="18" fill="#f5c842" opacity=".6" />
        <line x1="370" y1="44" x2="370" y2="50" stroke="#f5c842" strokeWidth="3" strokeLinecap="round" />
        <line x1="395" y1="55" x2="391" y2="60" stroke="#f5c842" strokeWidth="3" strokeLinecap="round" />
        <line x1="406" y1="80" x2="400" y2="80" stroke="#f5c842" strokeWidth="3" strokeLinecap="round" />
        <line x1="395" y1="105" x2="391" y2="100" stroke="#f5c842" strokeWidth="3" strokeLinecap="round" />
        <line x1="345" y1="55" x2="349" y2="60" stroke="#f5c842" strokeWidth="3" strokeLinecap="round" />
        <line x1="334" y1="80" x2="340" y2="80" stroke="#f5c842" strokeWidth="3" strokeLinecap="round" />
        <line x1="345" y1="105" x2="349" y2="100" stroke="#f5c842" strokeWidth="3" strokeLinecap="round" />

        {/* Sparkles */}
        <path d="M68 120 l4 12 l4-12 l-12 4 l12 4z" fill="#c8a44a" opacity=".7" />
        <path d="M380 200 l3 9 l3-9 l-9 3 l9 3z" fill="#3a5a5a" opacity=".5" />
        <path d="M50 320 l3 8 l3-8 l-8 3 l8 3z" fill="#d9826a" opacity=".5" />

        {/* Heart */}
        <path
          d="M208 150 C208 146 202 140 196 146 C190 152 196 160 208 168 C220 160 226 152 220 146 C214 140 208 146 208 150z"
          fill="#d9826a"
          opacity=".8"
        />

        {/* Cloud */}
        <ellipse cx="74" cy="180" rx="32" ry="20" fill="white" opacity=".8" />
        <ellipse cx="54" cy="186" rx="22" ry="16" fill="white" opacity=".8" />
        <ellipse cx="96" cy="186" rx="22" ry="16" fill="white" opacity=".8" />

        {/* Verified badge */}
        <rect x="288" y="130" width="112" height="30" rx="15" fill="white" stroke="#c2d8d8" strokeWidth="1.5" />
        <circle cx="306" cy="145" r="7" fill="#3a5a5a" />
        <path d="M302 145 l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <text x="318" y="150" fontFamily="DM Sans,sans-serif" fontSize="12" fontWeight="600" fill="#3a5a5a">
          All verified
        </text>
      </svg>
    </div>
  );
}
