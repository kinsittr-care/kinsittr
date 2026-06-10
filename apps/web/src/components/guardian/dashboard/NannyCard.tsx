"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import type { Nanny } from "./types";
import Avatar from "./Avatar";
import Tag from "./Tag";
import { formatLocationPart } from "@/src/utils/format";

function StarRating({ rating, reviews }: { rating: number; reviews: number }) {
  if (reviews === 0) {
    return null;
  }

  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="flex items-center gap-1">
      <span className="text-gold text-[13px] tracking-[-1px]">
        {"★".repeat(full)}{half ? "½" : ""}
      </span>
      <span className="text-[13px] font-semibold">{rating.toFixed(1)}</span>
      <span className="text-[12px] text-brand-faint">({reviews})</span>
    </span>
  );
}

interface NannyCardProps {
  nanny: Nanny;
  onBook: (nanny: Nanny) => void;
  delay?: number;
}

export default function NannyCard({ nanny, onBook, delay = 0 }: NannyCardProps) {
  const [hovered, setHovered] = useState(false);
  const tags = nanny.tags ?? [];

  return (
    <div
      onClick={() => onBook(nanny)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "rounded-2xl px-6 py-[22px] cursor-pointer transition-all duration-200 border",
        hovered
          ? "bg-white border-teal-mid shadow-[0_4px_24px_rgba(40,30,20,.10)]"
          : "bg-[#fdfaf5] border-brand-border shadow-[0_2px_12px_rgba(40,30,20,.07)]",
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex gap-[18px] items-start">
        <div className="relative">
          <Avatar initials={nanny.initials} src={nanny.avatarUrl} size={54} />
          {nanny.available && (
            <div className="absolute bottom-px right-px w-[13px] h-[13px] rounded-full bg-[#4caf7d] border-2 border-white" />
          )}
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <div>
              <h3 className="font-semibold text-[17px] mb-[3px]">{nanny.name}</h3>
              <div className="flex items-center gap-1 text-brand-faint text-[13px] mb-[6px]">
                <svg width="10" height="13" viewBox="0 0 10 13" fill="#c0392b" aria-hidden="true">
                  <path d="M5 0C2.24 0 0 2.24 0 5c0 3.75 5 8 5 8s5-4.25 5-8c0-2.76-2.24-5-5-5zm0 6.5A1.5 1.5 0 1 1 5 3.5a1.5 1.5 0 0 1 0 3z" />
                </svg>
                {formatLocationPart(nanny.city)}
              </div>
              <StarRating rating={nanny.rating} reviews={nanny.reviews} />
            </div>
            <div className="text-right shrink-0">
              <div className="text-[28px] font-bold text-teal leading-none">${nanny.rate}</div>
              <div className="text-[12px] text-brand-faint mt-[2px]">/hour</div>
            </div>
          </div>

          <p className="text-[13.5px] text-[#5c5446] leading-[1.7] mt-[10px] mb-[14px]">
            {nanny.bio}
          </p>

          <div className="flex gap-[7px] flex-wrap items-center">
            {tags.map((t, i) => (
              <Tag key={t} label={t} variant={i === tags.length - 1 ? "accent" : "default"} />
            ))}
            {typeof nanny.years === "number" && nanny.years > 0 && (
              <span className="ml-auto text-[12px] text-brand-faint">
                {nanny.years} yrs exp.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
