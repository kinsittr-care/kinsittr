import type { CSSProperties } from "react";
import type { PublicNannyCard } from "@/src/types/api/api";
import type { Nanny } from "../types";

export const CITIES = ["All cities", "Toronto, ON", "Vancouver, BC", "Calgary, AB", "Ottawa, ON", "Montreal, QC"];
export const SPECIALTIES = ["Infant care", "Special needs", "Montessori", "CPR certified", "Bilingual"];
export const SORT_OPTIONS = ["Top rated", "Price: low to high", "Price: high to low", "Most reviewed"];
export const PAGE_SIZE = 12;

export const labelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  color: "var(--muted)",
  display: "block",
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

export const selectStyle: CSSProperties = {
  width: "100%",
  border: "1.5px solid var(--border)",
  borderRadius: 9,
  padding: "11px 14px",
  fontSize: 14,
  background: "var(--bg-warm)",
  color: "var(--brand-text)",
  cursor: "pointer",
  outline: "none",
  appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  paddingRight: 32,
};

export function parseLocationFilter(value: string) {
  if (value === "All cities") {
    return { city: undefined, province: undefined };
  }

  const [city, province] = value.split(",").map((part) => part.trim());
  return { city, province };
}

export function mapSortOption(value: string): "rating_desc" | "rate_asc" | "rate_desc" {
  if (value === "Price: low to high") return "rate_asc";
  if (value === "Price: high to low") return "rate_desc";
  return "rating_desc";
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function mapPublicNannyToCard(nanny: PublicNannyCard): Nanny {
  return {
    id: nanny.id,
    name: nanny.display_name,
    initials: getInitials(nanny.display_name),
    city: `${nanny.city}, ${nanny.province}`,
    rate: nanny.rate_per_hour,
    rating: nanny.rating_avg,
    reviews: nanny.rating_count,
    bio: nanny.bio,
    tags: nanny.specialties,
  };
}
