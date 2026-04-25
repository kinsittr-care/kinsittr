import { AudienceCheckIcon } from "@/src/components/icons";
import type {
  AudienceCardContent,
  AudienceCardProps,
} from "@/src/types/components/landing";
import Link from "next/link";

const familiesData: AudienceCardContent = {
  tag: "For families",
  heading: (<>Find your perfect<br />match, stress-free.</>),
  body: "Search, filter, and connect with nannies who genuinely care. Every caregiver on KinSittr is background-checked and interview-screened.",
  perks: [
    "Filter by specialties, city & rate",
    "Message once your booking is approved",
    "Manage bookings, payments & history",
  ],
  cta: "Browse nannies →",
};

const nanniesData: AudienceCardContent = {
  tag: "For nannies",
  heading: (<>Share your gift.<br />Build your career.</>),
  body: "Join a platform that values your expertise. Create your profile, set your availability, and connect with families who are the right fit for you.",
  perks: [
    "Build a verified, standout profile",
    "Accept or decline bookings on your terms",
    "Get paid securely, every time",
  ],
  cta: "Join as a nanny →",
};

export default function AudienceCard({ variant }: AudienceCardProps) {
  const isFamilies = variant === "families";
  const data = isFamilies ? familiesData : nanniesData;

  return (
    <div
      className="relative rounded-[24px] px-10 py-11 overflow-hidden"
      style={
        isFamilies
          ? { background: "var(--teal)" }
          : { background: "var(--gold-lt)", border: "1.5px solid #e8d88c" }
      }
    >
      {/* Decorative blob */}
      <svg
        className="absolute top-0 right-0 pointer-events-none"
        style={{ opacity: isFamilies ? 0.15 : 0.08 }}
        width="200" height="200" viewBox="0 0 200 200"
      >
        <ellipse cx="160" cy="40" rx="120" ry="120" fill={isFamilies ? "white" : "var(--gold)"} />
      </svg>

      {/* Tag */}
      <div
        className="inline-block text-[11px] font-bold tracking-widest uppercase rounded-[30px] px-3 py-1 mb-5"
        style={
          isFamilies
            ? { background: "rgba(255,255,255,.18)", color: "rgba(255,255,255,.9)" }
            : { background: "rgba(200,164,74,.2)", color: "#8a6e20" }
        }
      >
        {data.tag}
      </div>

      {/* Heading */}
      <h3
        className="font-display text-[30px] leading-[1.15] mb-[14px]"
        style={{ color: isFamilies ? "#fff" : "var(--brand-text)" }}
      >
        {data.heading}
      </h3>

      {/* Body */}
      <p
        className="text-[15px] leading-[1.75] mb-7"
        style={{ color: isFamilies ? "rgba(255,255,255,.78)" : "var(--muted)" }}
      >
        {data.body}
      </p>

      {/* Perks */}
      <div className="flex flex-col gap-2 mb-7">
        {data.perks.map((perk) => (
          <div key={perk} className="flex items-center gap-[9px] text-[14px]">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
              style={{ background: isFamilies ? "rgba(255,255,255,.2)" : "rgba(200,164,74,.25)" }}
            >
              <AudienceCheckIcon color={isFamilies ? "white" : "var(--gold)"} />
            </div>
            <span style={{ color: isFamilies ? "rgba(255,255,255,.88)" : "var(--brand-text)" }}>
              {perk}
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Link href="/contact" className={isFamilies ? "btn-white" : "btn-gold"}>
        {data.cta}
      </Link>

      {/* Decorative illustration */}
      {isFamilies ? (
        <svg className="absolute bottom-7 right-8" style={{ opacity: 0.5 }} width="90" height="90" viewBox="0 0 90 90" fill="none">
          <circle cx="45" cy="32" r="22" fill="white" opacity=".3" />
          <circle cx="35" cy="28" r="9" fill="white" opacity=".4" />
          <circle cx="55" cy="26" r="11" fill="white" opacity=".4" />
          <path d="M26 58 Q35 45 45 55 Q55 45 64 58" stroke="white" strokeWidth="6" strokeLinecap="round" fill="none" opacity=".4" />
        </svg>
      ) : (
        <svg className="absolute bottom-7 right-8" style={{ opacity: 0.35 }} width="88" height="88" viewBox="0 0 88 88" fill="none">
          <circle cx="44" cy="44" r="40" stroke="var(--gold)" strokeWidth="2" strokeDasharray="6 4" />
          <circle cx="44" cy="30" r="14" fill="var(--gold)" opacity=".5" />
          <path d="M20 68 Q44 52 68 68" stroke="var(--gold)" strokeWidth="6" strokeLinecap="round" fill="none" />
        </svg>
      )}
    </div>
  );
}
