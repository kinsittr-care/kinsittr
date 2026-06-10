function capitalizeWord(value: string) {
  const [first = "", ...rest] = value;
  return `${first.toUpperCase()}${rest.join("")}`;
}

export function formatLocationPart(value: string | null | undefined) {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.split("-").map(capitalizeWord).join("-"))
    .join(" ");
}

export function formatLocation(
  city: string | null | undefined,
  province: string | null | undefined,
  fallback = "Location not set",
) {
  const parts = [formatLocationPart(city), formatLocationPart(province)].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : fallback;
}
