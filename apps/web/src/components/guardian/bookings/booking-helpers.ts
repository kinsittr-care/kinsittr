import type { BookingStatus } from "@/src/types/api/api";

export function formatBookingTotal(value: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatBookingStatus(status: BookingStatus) {
  switch (status) {
    case "pending":
      return "Pending approval";
    case "approved":
      return "Approved";
    case "declined":
      return "Declined";
    case "cancelled":
      return "Cancelled";
    case "completed":
      return "Completed";
    default:
      return status;
  }
}

export function getBookingInitials(name?: string) {
  if (!name) return "BK";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
