import {
  ArrowRightIcon,
  VerificationShieldCheckIcon,
} from "@/src/components/icons";
import BadgeIllustration from "./BadgeIllustration";
import Link from "next/link";

export default function VerificationHero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "var(--gold-lt)", borderBottom: "1px solid #e0cc88", paddingTop: 120, paddingBottom: 72 }}
    >
      <div className="relative mx-auto px-[52px] max-w-[1080px] grid grid-cols-2 gap-[60px] items-center max-md:grid-cols-1 max-md:px-6">
        <div>
          <div
            className="inline-flex items-center gap-[8px] text-[12px] font-bold uppercase tracking-widest rounded-[30px] px-[13px] py-[5px] mb-[18px] border"
            style={{ color: "#7a6018", background: "rgba(200,164,74,.18)", borderColor: "#e0cc88" }}
          >
            <VerificationShieldCheckIcon />
            For nannies
          </div>
          <h1
            className="font-display leading-[1.1] tracking-[-0.02em] mb-5"
            style={{ fontSize: "clamp(32px,4.5vw,52px)", color: "var(--brand-text)" }}
          >
            Get verified.{" "}
            <em style={{ color: "var(--teal)" }}>Get discovered.</em>
          </h1>
          <p className="text-[17px] leading-[1.75] mb-9 max-w-[460px]" style={{ color: "var(--faint)" }}>
            Becoming a KinSittr-verified nanny sets you apart. Families trust verified profiles and verified nannies get booked.
          </p>
          <Link href="/auth/nanny" className="btn-gold">
            Start your application
            <ArrowRightIcon />
          </Link>
        </div>
        <div className="flex justify-center max-md:hidden">
          <BadgeIllustration />
        </div>
      </div>
    </section>
  );
}
