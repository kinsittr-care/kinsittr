export const SPECIALTY_OPTIONS = [
  { label: "Infant care", value: "Infant care" },
  { label: "Special needs", value: "Special needs" },
  { label: "Montessori", value: "Montessori" },
  { label: "CPR certified", value: "CPR certified" },
  { label: "Bilingual", value: "Bilingual" },
] as const;

export const MAX_NANNY_SPECIALTIES = 3;

export function specialtyLabelFor(value: string) {
  return SPECIALTY_OPTIONS.find((option) => option.value === value)?.label ?? value;
}
