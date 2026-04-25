import { ArrowRightIcon } from "@/src/components/icons";
import NannyIllustration from "./NannyIllustration";
import Link from "next/link";

export default function NannyHero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "var(--teal-dk)", paddingTop: 130, paddingBottom: 90 }}
    >
      {/* bg circles */}
      <svg className="absolute top-0 right-0 pointer-events-none" width="420" height="420" viewBox="0 0 420 420" fill="none" aria-hidden="true">
        <circle cx="320" cy="100" r="220" fill="rgba(194,216,216,.07)" />
      </svg>
      <svg className="absolute bottom-0 left-0 pointer-events-none" width="320" height="320" viewBox="0 0 320 320" fill="none" aria-hidden="true">
        <circle cx="80" cy="260" r="180" fill="rgba(200,164,74,.05)" />
      </svg>

      <div className="relative mx-auto px-[52px] max-w-[1080px] grid grid-cols-2 gap-[64px] items-center max-md:grid-cols-1 max-md:px-6">
        <div>
          <div
            className="inline-flex items-center gap-[7px] text-[12px] font-bold uppercase tracking-widest rounded-[30px] px-[13px] py-[5px] mb-[18px] border"
            style={{ color: "var(--teal-mid)", background: "rgba(194,216,216,.15)", borderColor: "rgba(194,216,216,.3)" }}
          >
            For nannies &amp; caregivers
          </div>
          <h1
            className="font-display leading-[1.1] tracking-[-0.02em] text-white mb-5"
            style={{ fontSize: "clamp(34px,4.5vw,52px)" }}
          >
            Your caregiving career,{" "}
            <em style={{ color: "var(--teal-mid)" }}>elevated.</em>
          </h1>
          <p className="text-[17px] leading-[1.75] mb-9 max-w-[480px]" style={{ color: "rgba(255,255,255,.72)" }}>
            KinSittr is more than a booking platform. It&apos;s a professional home for nannies who take their work seriously — and deserve to be treated that way.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="/verification" className="btn-cta">
              Get verified
              <ArrowRightIcon color="#fff" />
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-[10px] px-6 py-3 text-[15px] font-semibold transition-colors"
              style={{ background: "rgba(255,255,255,.12)", color: "#fff", border: "1.5px solid rgba(255,255,255,.25)" }}
            >
              Talk to our team
            </Link>
          </div>
        </div>
        <div className="flex justify-center max-md:hidden">
          <NannyIllustration />
        </div>
      </div>
    </section>
  );
}
