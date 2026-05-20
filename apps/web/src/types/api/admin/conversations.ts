import type { BookingStatus } from "../bookings";
import type { AuthUser } from "../auth";
import type { AdminReasonPayload } from "./shared";

export type AdminMessageSenderRole = AuthUser["role"];

export interface AdminConversationParticipant {
  profile_id: string;
  display_name: string;
  email: string;
  city: string;
  province: string;
}

export interface AdminConversation {
  id: string;
  booking_id: string;
  booking_status: BookingStatus;
  parent: AdminConversationParticipant;
  nanny: AdminConversationParticipant;
  last_message_preview: string;
  last_message_at?: string | null;
  message_count: number;
  locked_at?: string | null;
  locked_by?: string | null;
  lock_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminConversationListData {
  items: AdminConversation[];
  page: number;
  limit: number;
  total: number;
}

export interface AdminMessage {
  id: string;
  conversation_id: string;
  sender_user_id: string;
  sender_role: AdminMessageSenderRole;
  sender_email: string;
  sender_firstname: string;
  sender_lastname: string;
  body: string;
  hidden_at?: string | null;
  hidden_by?: string | null;
  hidden_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminMessageListData {
  conversation: AdminConversation;
  items: AdminMessage[];
  page: number;
  limit: number;
  total: number;
}

export interface ListAdminConversationsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: BookingStatus;
}

export interface ListAdminMessagesParams {
  page?: number;
  limit?: number;
}

export type AdminConversationActionPayload = AdminReasonPayload;
