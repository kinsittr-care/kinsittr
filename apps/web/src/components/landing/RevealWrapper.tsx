"use client";

import { useRef, useEffect, useState } from "react";
import type { RevealWrapperProps } from "@/src/types/components/landing";

export default function RevealWrapper({
  children,
  delay = 0,
  className = "",
}: RevealWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame: number | null = null;
    const revealSoon = () => {
      frame = window.requestAnimationFrame(() => setVisible(true));
    };
    const rect = el.getBoundingClientRect();
    const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
    if (isInViewport) {
      revealSoon();
      return () => {
        if (frame !== null) window.cancelAnimationFrame(frame);
      };
    }
    if (!("IntersectionObserver" in window)) {
      revealSoon();
      return () => {
        if (frame !== null) window.cancelAnimationFrame(frame);
      };
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(24px)",
        transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}
