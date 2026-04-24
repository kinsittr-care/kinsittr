"use client";

import { useEffect, useState } from "react";
import type { NavLink } from "@/src/types/landing";
import Logo from "./Logo";

const navLinks: NavLink[] = [
  { label: "Safety",      href: "/safety" },
  { label: "For nannies", href: "/nanny-resources" },
  { label: "About",       href: "/about" },
  { label: "Contact",     href: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[100] h-[66px] flex items-center justify-between px-[52px] transition-all duration-300 max-md:px-6"
      style={
        scrolled
          ? { background: "rgba(245,240,232,.94)", backdropFilter: "blur(14px)", boxShadow: "0 1px 20px rgba(40,30,20,.07)" }
          : undefined
      }
    >
      <Logo />

      <div className="flex gap-7 max-md:hidden">
        {navLinks.map(({ label, href }) => (
          <a key={label} href={href} className="link-muted">{label}</a>
        ))}
      </div>

      <div className="flex gap-[10px] items-center">
        <a href="/nanny-resources" className="btn-nav-ghost">I&apos;m a nanny</a>
        <a href="/nanny-app"       className="btn-nav">Find a nanny</a>
      </div>
    </nav>
  );
}
