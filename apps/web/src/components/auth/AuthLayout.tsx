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
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg)" }}
    >
      <header className="flex items-center justify-between px-6 py-5 max-w-[460px] w-full mx-auto">
        <Logo />
        <Link
          href={switchHref}
          className="btn-outline"
          style={{ fontSize: 13, padding: "8px 16px" }}
        >
          {switchLabel}
        </Link>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-[460px]">
          <div className="mb-8 text-center">
            <span
              className="inline-block text-[12px] font-semibold uppercase tracking-[0.08em] px-3 py-1 rounded-full mb-4"
              style={{ background: "var(--teal-lt)", color: "var(--teal)" }}
            >
              {isParent ? "For families" : "For caregivers"}
            </span>
            <h1 className="font-display text-[30px] leading-tight">
              {isParent ? "Find trusted childcare" : "Start earning with KinSittr"}
            </h1>
          </div>

          <div
            className="bg-white rounded-[22px] p-[36px_32px]"
            style={{ border: "1px solid var(--border)", boxShadow: "0 4px 24px rgba(40,30,20,.07)" }}
          >
            {children}
          </div>

          <p className="text-center text-[13px] mt-6" style={{ color: "var(--muted)" }}>
            By continuing, you agree to our{" "}
            <Link href="/terms" style={{ color: "var(--teal)" }}>Terms</Link>
            {" "}and{" "}
            <Link href="/privacy" style={{ color: "var(--teal)" }}>Privacy Policy</Link>.
          </p>
        </div>
      </main>
    </div>
  );
}
