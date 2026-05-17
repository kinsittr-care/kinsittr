import type { BookingStatus } from "./bookings";

export interface Conversation {
  id: string;
  booking_id: string;
  parent_profile_id: string;
  nanny_profile_id: string;
  booking_status: BookingStatus;
  other_participant_name: string;
  other_participant_city?: string;
  other_participant_province?: string;
  last_message_preview?: string;
  last_message_at?: string | null;
  unread_count: number;
  last_read_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConversationListData {
  items: Conversation[];
  page: number;
  limit: number;
  total: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_user_id: string;
  sender_role: "parent" | "nanny" | "admin";
  body: string;
  created_at: string;
  updated_at: string;
}

export interface MessageListData {
  items: Message[];
  page: number;
  limit: number;
  total: number;
}

export interface ListConversationsParams {
  page?: number;
  limit?: number;
}

export interface ListMessagesParams {
  page?: number;
  limit?: number;
}

export interface SendMessagePayload {
  body: string;
}
