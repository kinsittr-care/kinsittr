export type NotificationType =
  | "booking_requested"
  | "booking_approved"
  | "booking_declined"
  | "booking_cancelled"
  | "booking_completed"
  | "booking_change_requested"
  | "booking_change_accepted"
  | "booking_change_declined"
  | "message_received";

export interface NotificationPayloadData {
  booking_id?: string;
  conversation_id?: string;
  message_id?: string;
  change_request_id?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  role: "parent" | "nanny";
  type: NotificationType;
  title: string;
  body: string;
  data?: NotificationPayloadData;
  read_at?: string | null;
  created_at: string;
}

export interface NotificationListData {
  items: Notification[];
  page: number;
  limit: number;
  total: number;
}

export interface UnreadCountData {
  count: number;
}

export interface ListNotificationsParams {
  page?: number;
  limit?: number;
  unread_only?: boolean;
}
