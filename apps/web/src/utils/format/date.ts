import type { Booking } from "@/src/types/api/api";

type DateInput = string | number | Date;

function toDate(value: DateInput) {
  return value instanceof Date ? value : new Date(value);
}

function toDateOnly(value: string) {
  return new Date(`${value}T00:00:00`);
}

export function formatShortDate(value: DateInput) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(toDate(value));
}

export function formatDateOnlyShort(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(toDateOnly(value));
}

export function formatBookingDate(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00Z`));
}

export function describeBookingTime(booking: Booking) {
  return `${formatBookingDate(booking.date)} · ${booking.start_time} · ${booking.duration}h`;
}

export function formatShortDateCA(value: DateInput) {
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(toDate(value));
}

export function formatWeekdayDateOnly(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(toDateOnly(value));
}

export function formatShortDateTime(value: DateInput) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(toDate(value));
}

export function formatOptionalShortDateTime(value?: string | null, fallback = "") {
  if (!value) return fallback;
  return formatShortDateTime(value);
}

export function formatTimeRange(startTime: string, durationHours: number) {
  const [hour, minute] = startTime.split(":").map(Number);
  const start = new Date();
  start.setHours(hour || 0, minute || 0, 0, 0);
  const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
  const formatter = new Intl.DateTimeFormat("en-CA", {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

export function formatThreadTimestamp(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return "Now";
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function formatMessageTimestamp(value: string) {
  return new Date(value).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatReviewDate(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function formatMonthYear(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "recently";
  return new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(date);
}

export function formatNannyDashboardDate(value: DateInput) {
  return new Intl.DateTimeFormat("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(toDate(value));
}
