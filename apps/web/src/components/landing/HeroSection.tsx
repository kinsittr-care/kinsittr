import {
  ArrowRightIcon,
  LockIcon,
  PlusIcon,
  SparkleIcon,
  VerifiedCircleIcon,
} from "@/src/components/icons";
import HeroIllustration from "./HeroIllustration";
import RevealWrapper from "./RevealWrapper";

export default function HeroSection() {
  return (
    <div className="relative min-h-screen grid grid-cols-2 items-center gap-10 pt-[110px] px-[52px] pb-[80px] overflow-hidden max-md:grid-cols-1 max-md:px-7 max-md:pt-[100px] max-md:pb-[60px]">
      {/* Background blobs */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          width: 560, height: 560,
          background: "radial-gradient(circle at 40%,rgba(58,90,90,.1),transparent 70%)",
          top: -120, right: -80,
        }}
      />
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          width: 320, height: 320,
          background: "radial-gradient(circle,rgba(200,164,74,.1),transparent 70%)",
          bottom: 20, left: -60,
        }}
      />

      {/* Left: text */}
      <div className="relative z-2">
        <RevealWrapper>
          <div
            className="inline-flex items-center gap-[7px] text-[13px] font-semibold rounded-[30px] px-[13px] py-[5px] mb-6 border"
            style={{ color: "var(--teal)", background: "var(--teal-lt)", borderColor: "var(--teal-mid)" }}
          >
            <SparkleIcon width={14} height={14} color="var(--teal)" />
            Childcare, reimagined
          </div>
        </RevealWrapper>

        <RevealWrapper delay={0.1}>
          <h1 className="font-display mb-[22px] leading-[1.08] tracking-[-0.02em]" style={{ fontSize: "clamp(42px, 5vw, 66px)" }}>
            Care that feels like <em style={{ color: "var(--teal)" }}>family.</em>
          </h1>
        </RevealWrapper>

        <RevealWrapper delay={0.2}>
          <p className="text-[17px] leading-[1.75] mb-9 max-w-[440px]" style={{ color: "var(--muted)" }}>
            KinSittr connects families and nannies in a space built on trust, warmth, and simplicity.
            Find someone who truly clicks with your children — or bring your caregiving gift to families who need you.
          </p>
        </RevealWrapper>

        <RevealWrapper delay={0.3}>
          <div className="flex gap-3 flex-wrap">
            <a href="" className="btn-cta">
              I need a nanny
              <ArrowRightIcon color="#fff" />
            </a>
            <a href="#" className="btn-outline">I&apos;m a nanny →</a>
          </div>
        </RevealWrapper>

        <RevealWrapper delay={0.4}>
          <div className="mt-7 text-[13px] flex items-center gap-[18px]" style={{ color: "var(--faint)" }}>
            {[
              {
                label: "All nannies verified",
                icon: <VerifiedCircleIcon color="var(--faint)" />,
              },
              {
                label: "Free to browse",
                icon: <LockIcon color="var(--faint)" />,
              },
              {
                label: "No subscription",
                icon: <PlusIcon color="var(--faint)" />,
              },
            ].map(({ icon, label }) => (
              <span key={label} className="flex items-center gap-[5px]">
                {icon}
                {label}
              </span>
            ))}
          </div>
        </RevealWrapper>
      </div>

      {/* Right: illustration */}
      <div className="relative z-2 flex items-center justify-center max-md:hidden">
        <HeroIllustration />
      </div>
    </div>
  );
}
