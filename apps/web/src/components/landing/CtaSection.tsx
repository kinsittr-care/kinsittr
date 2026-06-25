import { ArrowRightIcon, SparkleIcon } from "@/src/components/icons";
import Link from "next/link";
import RevealWrapper from "./RevealWrapper";

export default function CtaSection() {
  return (
    <div className="relative text-center px-[52px] py-[120px] overflow-hidden max-md:px-7 max-md:py-[80px]">
      {/* Radial gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_60%,rgba(58,90,90,.07),transparent_65%)]" />

      {/* Floating sparkles */}
      <SparkleIcon className="float-a absolute left-[10%] top-[60px] opacity-50" color="var(--gold)" />
      <SparkleIcon className="float-c absolute right-[12%] top-20 opacity-40" width={18} height={18} color="var(--teal)" />
      <SparkleIcon className="float-b absolute bottom-20 left-[8%] opacity-35" width={14} height={14} color="var(--coral)" />

      <RevealWrapper>
        <div className="mb-3 flex justify-center text-[12px] font-bold uppercase tracking-[0.12em] text-teal">
          Get started
        </div>
      </RevealWrapper>

      <RevealWrapper delay={0.1}>
        <h2 className="font-display relative mb-[18px] text-[clamp(36px,5vw,58px)] leading-[1.12] tracking-[-0.02em]">
          Your <em className="text-teal">journey</em> starts here.
        </h2>
      </RevealWrapper>

      <RevealWrapper delay={0.3}>
        <div className="flex gap-[14px] justify-center flex-wrap relative">
          <Link href="/waitlist?role=parent" className="btn-cta px-7 py-[14px] text-[15px]">
            Find a nanny
            <ArrowRightIcon color="#fff" />
          </Link>
          <Link href="/waitlist?role=nanny" className="btn-outline px-[26px] py-[13px] text-[15px]">
            Join as a nanny
          </Link>
        </div>
      </RevealWrapper>
    </div>
  );
}
