import { TinyCheckIcon } from "@/src/components/icons";
import RevealWrapper from "@/src/components/landing/RevealWrapper";

const perks = [
  "Connect Stripe before accepting paid bookings",
  "Payment is collected when the booking is completed",
  "Choose daily or weekly Stripe payouts",
];

function PhoneIllustration() {
  return (
    <svg width="240" height="200" viewBox="0 0 240 200" fill="none" aria-hidden="true">
      {/* sparkles */}
      <path d="M200 20 l2.5 7.5 2.5-7.5-7.5 2.5 7.5 2.5z" fill="#c8a44a" opacity=".8" />
      <path d="M35 30 l2 6 2-6-6 2 6 2z" fill="#fff" opacity=".5" />
      <path d="M210 150 l2 5 2-5-5 2 5 2z" fill="#c8a44a" opacity=".6" />

      {/* floating payment card (left) */}
      <rect x="8" y="68" width="72" height="44" rx="8" fill="rgba(255,255,255,.18)" stroke="rgba(255,255,255,.35)" strokeWidth="1.2" />
      <rect x="16" y="78" width="20" height="14" rx="3" fill="#c8a44a" opacity=".8" />
      <rect x="44" y="82" width="28" height="4" rx="2" fill="rgba(255,255,255,.5)" />
      <rect x="44" y="90" width="20" height="3" rx="1.5" fill="rgba(255,255,255,.3)" />

      {/* phone body */}
      <rect x="88" y="10" width="100" height="178" rx="18" fill="rgba(255,255,255,.14)" stroke="rgba(255,255,255,.3)" strokeWidth="1.5" />
      {/* screen */}
      <rect x="96" y="22" width="84" height="154" rx="12" fill="rgba(255,255,255,.08)" />
      {/* amount block */}
      <rect x="106" y="44" width="64" height="40" rx="8" fill="rgba(255,255,255,.15)" />
      <rect x="114" y="52" width="48" height="7" rx="3.5" fill="rgba(255,255,255,.5)" />
      <rect x="120" y="64" width="36" height="5" rx="2.5" fill="rgba(255,255,255,.3)" />
      {/* gold confirm button */}
      <rect x="106" y="100" width="64" height="30" rx="10" fill="#c8a44a" />
      <path d="M126 115 l5 5 10-10" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="112" y="144" width="52" height="6" rx="3" fill="rgba(255,255,255,.2)" />
      <rect x="116" y="155" width="44" height="5" rx="2.5" fill="rgba(255,255,255,.15)" />
    </svg>
  );
}

export default function PaySection() {
  return (
    <section style={{ background: "var(--bg-warm)", padding: "90px 0" }}>
      <div className="mx-auto px-[52px] max-w-[1080px] max-md:px-6">
        <RevealWrapper>
          <div
            className="rounded-[22px] p-[40px] grid grid-cols-2 gap-[40px] items-center max-md:grid-cols-1"
            style={{ background: "var(--teal)" }}
          >
            <div>
              <h3 className="font-display text-white mb-4" style={{ fontSize: "clamp(22px,2.5vw,28px)" }}>
                How you get paid
              </h3>
              <p className="text-[15px] leading-[1.75] mb-7" style={{ color: "rgba(255,255,255,.78)" }}>
                No awkward cash conversations. Charges are made after the completed care session and tracks your earnings in-app.
              </p>
              <ul className="flex flex-col gap-3">
                {perks.map((p) => (
                  <li key={p} className="flex items-center gap-3 text-[14px]" style={{ color: "rgba(255,255,255,.9)" }}>
                    <span className="w-[20px] h-[20px] rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <TinyCheckIcon color="#fff" />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-center max-md:hidden">
              <PhoneIllustration />
            </div>
          </div>
        </RevealWrapper>
      </div>
    </section>
  );
}
