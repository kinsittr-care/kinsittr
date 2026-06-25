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
      className={`relative overflow-hidden rounded-[24px] px-10 py-11 ${isFamilies ? "bg-[var(--teal)]" : "border-[1.5px] border-[#e8d88c] bg-[var(--gold-lt)]"}`}
    >
      {/* Decorative blob */}
      <svg
        className={`pointer-events-none absolute right-0 top-0 ${isFamilies ? "opacity-15" : "opacity-[.08]"}`}
        width="200" height="200" viewBox="0 0 200 200"
      >
        <ellipse cx="160" cy="40" rx="120" ry="120" fill={isFamilies ? "white" : "var(--gold)"} />
      </svg>

      {/* Tag */}
      <div
        className={`mb-5 inline-block rounded-[30px] px-3 py-1 text-[11px] font-bold uppercase tracking-widest ${isFamilies ? "bg-white/20 text-white/90" : "bg-[rgba(200,164,74,.2)] text-[#8a6e20]"}`}
      >
        {data.tag}
      </div>

      {/* Heading */}
      <h3
        className={`font-display mb-[14px] text-[30px] leading-[1.15] ${isFamilies ? "text-white" : "text-[var(--brand-text)]"}`}
      >
        {data.heading}
      </h3>

      {/* Body */}
      <p
        className={`mb-7 text-[15px] leading-[1.75] ${isFamilies ? "text-white/80" : "text-[var(--faint)]"}`}
      >
        {data.body}
      </p>

      {/* Perks */}
      <div className="flex flex-col gap-2 mb-7">
        {data.perks.map((perk) => (
          <div key={perk} className="flex items-center gap-[9px] text-[14px]">
            <div
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${isFamilies ? "bg-white/20" : "bg-[rgba(200,164,74,.25)]"}`}
            >
              <AudienceCheckIcon color={isFamilies ? "white" : "var(--gold)"} />
            </div>
            <span className={isFamilies ? "text-white/90" : "text-[var(--brand-text)]"}>
              {perk}
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Link href={isFamilies ? "/waitlist?role=parent" : "/waitlist?role=nanny"} className={isFamilies ? "btn-white" : "btn-gold"}>
        {data.cta}
      </Link>

      {/* Decorative illustration */}
      {isFamilies ? (
        <svg className="absolute bottom-7 right-8 opacity-50" width="90" height="90" viewBox="0 0 90 90" fill="none">
          <circle cx="45" cy="32" r="22" fill="white" opacity=".3" />
          <circle cx="35" cy="28" r="9" fill="white" opacity=".4" />
          <circle cx="55" cy="26" r="11" fill="white" opacity=".4" />
          <path d="M26 58 Q35 45 45 55 Q55 45 64 58" stroke="white" strokeWidth="6" strokeLinecap="round" fill="none" opacity=".4" />
        </svg>
      ) : (
        <svg className="absolute bottom-7 right-8 opacity-35" width="88" height="88" viewBox="0 0 88 88" fill="none">
          <circle cx="44" cy="44" r="40" stroke="var(--gold)" strokeWidth="2" strokeDasharray="6 4" />
          <circle cx="44" cy="30" r="14" fill="var(--gold)" opacity=".5" />
          <path d="M20 68 Q44 52 68 68" stroke="var(--gold)" strokeWidth="6" strokeLinecap="round" fill="none" />
        </svg>
      )}
    </div>
  );
}
