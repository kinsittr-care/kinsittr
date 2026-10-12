import Image from "next/image";

export default function HeroIllustration() {
  return (
    <div className="float-b relative w-full max-w-[580px]">
      <div className="absolute left-[16%] right-[12%] top-[28%] bottom-[18%] rounded-full bg-[var(--teal-lt)] opacity-60 blur-3xl" />
      <div className="absolute left-[24%] right-[20%] bottom-[8%] h-10 rounded-full bg-[rgba(58,90,90,.16)] blur-2xl" />
      <div className="relative overflow-hidden">
        <Image
          src="/hero.webp"
          alt="A warm childcare moment with a caregiver and children"
          width={1370}
          height={1148}
          priority
          sizes="(max-width: 768px) 0px, 48vw"
          className="h-auto w-full object-cover mix-blend-multiply"
          style={{
            WebkitMaskImage:
              "radial-gradient(ellipse 78% 72% at 50% 52%, #000 62%, rgba(0,0,0,.7) 78%, transparent 100%)",
            maskImage:
              "radial-gradient(ellipse 78% 72% at 50% 52%, #000 62%, rgba(0,0,0,.7) 78%, transparent 100%)",
          }}
        />
      </div>
    </div>
  );
}
