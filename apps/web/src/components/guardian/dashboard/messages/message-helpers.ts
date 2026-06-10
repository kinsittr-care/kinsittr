import type { Conversation, Message } from "@/src/types/api/api";
export { formatMessageTimestamp, formatThreadTimestamp } from "@/src/utils/format";

export function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function formatConversationStatus(status: Conversation["booking_status"]) {
  switch (status) {
    case "approved":
      return "Booking approved";
    case "pending":
      return "Booking pending";
    case "declined":
      return "Booking declined";
    case "cancelled":
      return "Booking cancelled";
    default:
      return "Conversation";
  }
}

export function toBubbleSender(role: Message["sender_role"]) {
  return role === "parent" ? "user" : "nanny";
}
