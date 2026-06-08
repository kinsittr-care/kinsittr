import type { NannyProfile, UpdateNannyProfilePayload } from "@/src/types/api/api";
import { formatLocationPart } from "@/src/utils/format";

export const BIO_LIMIT = 450;
export const SPECIALTIES_TOTAL_LIMIT = 25;
export const SPECIALTY_MAX_COUNT = 10;
export const TESTING_PROVINCE = "Other / testing";

export const PROVINCE_OPTIONS = [
  "Alberta",
  "British Columbia",
  "Manitoba",
  "New Brunswick",
  "Newfoundland and Labrador",
  "Northwest Territories",
  "Nova Scotia",
  "Nunavut",
  "Ontario",
  "Prince Edward Island",
  "Quebec",
  "Saskatchewan",
  "Yukon",
  TESTING_PROVINCE,
];

export const CITIES_BY_PROVINCE: Record<string, string[]> = {
  Alberta: ["Calgary", "Edmonton", "Red Deer", "Lethbridge", "St. Albert"],
  "British Columbia": ["Vancouver", "Victoria", "Surrey", "Burnaby", "Kelowna"],
  Manitoba: ["Winnipeg", "Brandon", "Steinbach", "Thompson", "Portage la Prairie"],
  "New Brunswick": ["Fredericton", "Moncton", "Saint John", "Miramichi", "Dieppe"],
  "Newfoundland and Labrador": ["St. John's", "Mount Pearl", "Corner Brook", "Gander", "Grand Falls-Windsor"],
  "Northwest Territories": ["Yellowknife", "Hay River", "Inuvik", "Fort Smith"],
  "Nova Scotia": ["Halifax", "Sydney", "Dartmouth", "Truro", "New Glasgow"],
  Nunavut: ["Iqaluit", "Rankin Inlet", "Arviat", "Cambridge Bay"],
  Ontario: ["Toronto", "Ottawa", "Mississauga", "Brampton", "Hamilton", "London", "Markham", "Vaughan", "Kitchener"],
  "Prince Edward Island": ["Charlottetown", "Summerside", "Stratford", "Cornwall"],
  Quebec: ["Montreal", "Quebec City", "Laval", "Gatineau", "Longueuil", "Sherbrooke"],
  Saskatchewan: ["Saskatoon", "Regina", "Prince Albert", "Moose Jaw", "Swift Current"],
  Yukon: ["Whitehorse", "Dawson City", "Watson Lake", "Haines Junction"],
};

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
    phone: profile.phone,
    bio: profile.bio,
    specialties: profile.specialties ?? [],
    rate_per_hour: profile.rate_per_hour,
    city: formatLocationPart(profile.city),
    province: formatLocationPart(profile.province),
  };
}
