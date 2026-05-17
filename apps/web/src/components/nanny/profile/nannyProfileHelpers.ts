import type { NannyProfile, UpdateNannyProfilePayload } from "@/src/types/api/api";

export const BIO_LIMIT = 600;

export function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function profileToPayload(profile: NannyProfile): UpdateNannyProfilePayload {
  return {
    display_name: profile.display_name,
    bio: profile.bio,
    specialties: profile.specialties ?? [],
    rate_per_hour: profile.rate_per_hour,
    city: profile.city,
    province: profile.province,
  };
}
