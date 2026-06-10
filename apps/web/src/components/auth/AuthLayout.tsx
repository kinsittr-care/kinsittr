import Link from "next/link";
import Logo from "@/src/components/landing/Logo";

interface AuthLayoutProps {
  role: "parent" | "nanny";
  children: React.ReactNode;
}

export default function AuthLayout({ role, children }: AuthLayoutProps) {
  const isParent = role === "parent";
  const switchHref = isParent ? "/auth/nanny" : "/auth/parent";
  const switchLabel = isParent ? "I'm a nanny" : "I'm a parent";

  return (
    <div className="flex min-h-screen flex-col bg-brand-bg">
      <header className="flex items-center justify-between px-6 py-5 max-w-[460px] w-full mx-auto">
        <Logo />
        <Link
          href={switchHref}
          className="btn-outline px-4 py-2 text-[13px]"
        >
          {switchLabel}
        </Link>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-[460px]">
          <div className="mb-8 text-center">
            <span
              className="mb-4 inline-block rounded-full bg-teal-lt px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-teal"
            >
              {isParent ? "For families" : "For childcare specialists"}
            </span>
            <h1 className="font-display text-[30px] leading-tight">
              {isParent ? "Find trusted childcare" : "Start earning with KinSittr"}
            </h1>
          </div>

          <div
            className="rounded-[22px] border border-(--border) bg-white p-[36px_32px] shadow-[0_4px_24px_rgba(40,30,20,.07)]"
          >
            {children}
          </div>

          <p className="mt-6 text-center text-[13px] text-brand-faint">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-teal">Terms</Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-teal">Privacy Policy</Link>.
          </p>
        </div>
      </main>
    </div>
  );
}
