import type {
  ListNotificationsParams,
  Notification,
  NotificationListData,
  UnreadCountData,
} from "@/src/types/api/api";
import { apiRequest } from "@/src/utils/api/api";

export type NotificationRole = "parent" | "nanny";

export function notificationsQueryKey(role: NotificationRole, params?: ListNotificationsParams) {
  return params ? (["notifications", role, params] as const) : (["notifications", role] as const);
}

export function unreadNotificationsCountQueryKey(role: NotificationRole) {
  return ["notifications", role, "unread-count"] as const;
}

export async function listNotifications(params: ListNotificationsParams = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.unread_only) query.set("unread_only", "true");
  const qs = query.toString();
  return apiRequest<NotificationListData>(
    `/api/v1/notifications${qs ? `?${qs}` : ""}`,
    undefined,
    { requiresAuth: true },
  );
}

export async function countUnreadNotifications() {
  return apiRequest<UnreadCountData>(
    "/api/v1/notifications/unread-count",
    undefined,
    { requiresAuth: true },
  );
}

export async function markNotificationRead(id: string) {
  return apiRequest<Notification>(
    `/api/v1/notifications/${id}/read`,
    { method: "PATCH" },
    { requiresAuth: true },
  );
}

export async function markAllNotificationsRead() {
  return apiRequest<{ updated: number }>(
    "/api/v1/notifications/read-all",
    { method: "PATCH" },
    { requiresAuth: true },
  );
}
