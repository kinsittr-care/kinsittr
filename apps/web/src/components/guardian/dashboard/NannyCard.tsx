"use client";

import { useState } from "react";
import type { Nanny } from "./types";
import Avatar from "./Avatar";
import Tag from "./Tag";
import { formatLocationPart } from "@/src/utils/format";

function StarRating({ rating, reviews }: { rating: number; reviews: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="flex items-center gap-1">
      <span style={{ color: "var(--gold)", fontSize: 13, letterSpacing: "-1px" }}>
        {"★".repeat(full)}{half ? "½" : ""}
      </span>
      <span style={{ fontSize: 13, fontWeight: 600 }}>{rating}</span>
      <span style={{ fontSize: 12, color: "var(--faint)" }}>({reviews})</span>
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
      style={{
        background: hovered ? "#fff" : "#fdfaf5",
        border: `1px solid ${hovered ? "var(--teal-mid)" : "var(--border)"}`,
        borderRadius: 16, padding: "22px 24px", cursor: "pointer",
        boxShadow: hovered
          ? "0 4px 24px rgba(40,30,20,.10)"
          : "0 2px 12px rgba(40,30,20,.07)",
        transition: "all .2s",
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="flex gap-[18px] items-start">
        <div style={{ position: "relative" }}>
          <Avatar initials={nanny.initials} src={nanny.avatarUrl} size={54} />
          {nanny.available && (
            <div
              style={{
                position: "absolute", bottom: 1, right: 1,
                width: 13, height: 13, borderRadius: "50%",
                background: "#4caf7d", border: "2px solid #fff",
              }}
            />
          )}
        </div>

        <div style={{ flex: 1 }}>
          <div className="flex justify-between items-start" style={{ marginBottom: 4 }}>
            <div>
              <h3 style={{ fontWeight: 600, fontSize: 17, marginBottom: 3 }}>{nanny.name}</h3>
              <div className="flex items-center gap-1" style={{ color: "var(--faint)", fontSize: 13, marginBottom: 6 }}>
                <svg width="10" height="13" viewBox="0 0 10 13" fill="#c0392b" aria-hidden="true">
                  <path d="M5 0C2.24 0 0 2.24 0 5c0 3.75 5 8 5 8s5-4.25 5-8c0-2.76-2.24-5-5-5zm0 6.5A1.5 1.5 0 1 1 5 3.5a1.5 1.5 0 0 1 0 3z" />
                </svg>
                {formatLocationPart(nanny.city)}
              </div>
              <StarRating rating={nanny.rating} reviews={nanny.reviews} />
            </div>
            <div className="text-right shrink-0">
              <div style={{ fontSize: 28, fontWeight: 700, color: "var(--teal)", lineHeight: 1 }}>${nanny.rate}</div>
              <div style={{ fontSize: 12, color: "var(--faint)", marginTop: 2 }}>/hour</div>
            </div>
          </div>

          <p style={{ fontSize: 13.5, color: "#5c5446", lineHeight: 1.7, margin: "10px 0 14px" }}>
            {nanny.bio}
          </p>

          <div className="flex gap-[7px] flex-wrap items-center">
            {tags.map((t, i) => (
              <Tag key={t} label={t} variant={i === tags.length - 1 ? "accent" : "default"} />
            ))}
            {typeof nanny.years === "number" && nanny.years > 0 && (
              <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--faint)" }}>
                {nanny.years} yrs exp.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
