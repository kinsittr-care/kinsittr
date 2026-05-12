import type { Conversation, Message } from "@/src/types/api/api";

export function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
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
