"use client";

import { useEffect, useState } from "react";
import type { NavLink } from "@/src/types/components/landing";
import Logo from "./Logo";
import Link from "next/link";

const navLinks: NavLink[] = [
  // { label: "Safety",      href: "/safety" },
  // { label: "For nannies", href: "/nanny-resources" },
  { label: "About",       href: "/about" },
  { label: "Contact",     href: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-100 h-[66px] flex items-center justify-between px-[52px] transition-all duration-300 max-md:px-6"
        style={
          scrolled || menuOpen
            ? { background: "rgba(245,240,232,.94)", backdropFilter: "blur(14px)", boxShadow: "0 1px 20px rgba(40,30,20,.07)" }
            : undefined
        }
      >
        <Logo />

        <div className="flex gap-7 max-md:hidden">
          {navLinks.map(({ label, href }) => (
            <Link key={label} href={href} className="link-muted">{label}</Link>
          ))}
        </div>

        <div className="flex gap-[10px] items-center max-md:hidden">
          <Link href="/auth/nanny" className="btn-nav-ghost">I&apos;m a nanny</Link>
          <Link href="/auth/parent" className="btn-nav">Find a nanny</Link>
        </div>

        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="hidden max-md:inline-flex w-11 h-11 items-center justify-center rounded-[12px] border transition-colors"
          style={{
            borderColor: menuOpen ? "var(--teal)" : "var(--border)",
            background: menuOpen ? "var(--teal-lt)" : "rgba(255,255,255,.72)",
            color: "var(--teal)",
          }}
        >
          <span className="relative block h-4 w-5">
            <span
              className="absolute left-0 top-0 block h-[2px] w-5 rounded-full transition-all duration-200"
              style={{
                background: "currentColor",
                transform: menuOpen ? "translateY(7px) rotate(45deg)" : "none",
              }}
            />
            <span
              className="absolute left-0 top-[7px] block h-[2px] w-5 rounded-full transition-all duration-200"
              style={{
                background: "currentColor",
                opacity: menuOpen ? 0 : 1,
              }}
            />
            <span
              className="absolute left-0 top-[14px] block h-[2px] w-5 rounded-full transition-all duration-200"
              style={{
                background: "currentColor",
                transform: menuOpen ? "translateY(-7px) rotate(-45deg)" : "none",
              }}
            />
          </span>
        </button>
      </nav>

      {menuOpen ? (
        <div
          className="fixed inset-0 z-90 hidden max-md:block"
          style={{ background: "rgba(28,26,23,.26)" }}
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="absolute top-[78px] left-6 right-6 rounded-[24px] border p-6"
            style={{
              background: "rgba(250,246,239,.98)",
              borderColor: "var(--border)",
              boxShadow: "0 18px 48px rgba(40,30,20,.16)",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-col gap-2">
              {navLinks.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="rounded-[14px] px-4 py-3 text-[15px] font-medium transition-colors"
                  style={{ color: "var(--brand-text)", background: "rgba(255,255,255,.72)" }}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
            </div>

            <div className="mt-5 flex flex-col gap-3">
              <Link
                href="/auth/nanny"
                className="btn-nav-ghost text-center"
                onClick={() => setMenuOpen(false)}
              >
                I&apos;m a nanny
              </Link>
              <Link
                href="/auth/parent"
                className="btn-nav text-center"
                onClick={() => setMenuOpen(false)}
              >
                Find a nanny
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
