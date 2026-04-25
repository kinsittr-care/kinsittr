import { ArrowRightIcon, SparkleIcon } from "@/src/components/icons";
import Link from "next/link";
import RevealWrapper from "./RevealWrapper";

export default function CtaSection() {
  return (
    <div className="relative text-center px-[52px] py-[120px] overflow-hidden max-md:px-7 max-md:py-[80px]">
      {/* Radial gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 60%, rgba(58,90,90,.07), transparent 65%)" }}
      />

      {/* Floating sparkles */}
      <SparkleIcon className="float-a absolute" style={{ top: 60, left: "10%", opacity: 0.5 }} color="var(--gold)" />
      <SparkleIcon className="float-c absolute" style={{ top: 80, right: "12%", opacity: 0.4 }} width={18} height={18} color="var(--teal)" />
      <SparkleIcon className="float-b absolute" style={{ bottom: 80, left: "8%", opacity: 0.35 }} width={14} height={14} color="var(--coral)" />

      <RevealWrapper>
        <div className="text-[12px] font-bold uppercase tracking-[0.12em] mb-3 flex justify-center" style={{ color: "var(--teal)" }}>
          Get started
        </div>
      </RevealWrapper>

      <RevealWrapper delay={0.1}>
        <h2 className="font-display leading-[1.12] tracking-[-0.02em] mb-[18px] relative" style={{ fontSize: "clamp(36px, 5vw, 58px)" }}>
          Your <em style={{ color: "var(--teal)" }}>journey</em> starts here.
        </h2>
      </RevealWrapper>

      <RevealWrapper delay={0.2}>
        <p className="text-[16.5px] leading-[1.75] max-w-[440px] mx-auto mb-10 relative" style={{ color: "var(--muted)" }}>
          Whether you&apos;re a family looking for trusted care or a nanny ready to make a difference — KinSittr is where you belong.
        </p>
      </RevealWrapper>

      <RevealWrapper delay={0.3}>
        <div className="flex gap-[14px] justify-center flex-wrap relative">
          <Link href="/contact" className="btn-cta" style={{ fontSize: 15, padding: "14px 28px" }}>
            Find a nanny
            <ArrowRightIcon color="#fff" />
          </Link>
          <Link href="/contact" className="btn-outline" style={{ fontSize: 15, padding: "13px 26px" }}>
            Join as a nanny
          </Link>
        </div>
      </RevealWrapper>
    </div>
  );
}
