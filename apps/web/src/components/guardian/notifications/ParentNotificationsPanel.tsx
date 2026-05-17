"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Notification, NotificationType } from "@/src/types/api/api";
import {
  countUnreadNotifications,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  notificationsQueryKey,
  unreadNotificationsCountQueryKey,
} from "@/src/utils/api/notifications";

const POLL_INTERVAL = 30_000;
const LIST_LIMIT = 30;
const ROLE = "parent";

function parentRouteForNotification(notif: Notification): string {
  if (notif.type === "message_received") {
    const conversationID = notif.data?.conversation_id;
    return conversationID ? `/parent/messages?conversation_id=${conversationID}` : "/parent/messages";
  }
  const bookingID = notif.data?.booking_id;
  return bookingID ? `/parent/bookings?booking_id=${bookingID}` : "/parent/bookings";
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function typeIcon(type: NotificationType): string {
  if (type === "message_received") return "💬";
  if (type === "booking_requested" || type === "booking_cancelled") return "📋";
  if (type === "booking_approved") return "✅";
  if (type === "booking_declined") return "❌";
  if (type === "booking_completed") return "🏁";
  if (type === "booking_change_requested") return "🔄";
  if (type === "booking_change_accepted") return "✅";
  if (type === "booking_change_declined") return "❌";
  return "📅";
}

interface ParentNotificationsPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function ParentNotificationsPanel({
  open,
  onClose,
}: ParentNotificationsPanelProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [listLimit, setListLimit] = useState(LIST_LIMIT);

  const countQuery = useQuery({
    queryKey: unreadNotificationsCountQueryKey(ROLE),
    queryFn: countUnreadNotifications,
    refetchInterval: POLL_INTERVAL,
  });

  const listQuery = useQuery({
    queryKey: notificationsQueryKey(ROLE, { page: 1, limit: listLimit }),
    queryFn: () => listNotifications({ page: 1, limit: listLimit }),
    enabled: open,
  });

  const unreadCount = countQuery.data?.data?.count ?? 0;
  const notifications = listQuery.data?.data?.items ?? [];
  const totalNotifications = listQuery.data?.data?.total ?? 0;

  const invalidate = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey(ROLE) }),
    ]);

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: invalidate,
  });

  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: invalidate,
  });

  const mutationError = markReadMutationError(markReadMutation.error ?? markAllMutation.error);

  const handleClick = async (notif: Notification) => {
    if (!notif.read_at) await markReadMutation.mutateAsync(notif.id);
    onClose();
    router.push(parentRouteForNotification(notif));
  };

  return (
    <>
      {/* Bell button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Notifications"
        style={{
          position: "relative",
          background: open ? "var(--teal-lt)" : "var(--teal-dk)",
          border: "none",
          cursor: "pointer",
          padding: "7px 10px",
          borderRadius: 9,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: open ? "var(--teal)" : "var(--teal-lt)",
          transition: "all .15s",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
          <path
            d="M9 2a5 5 0 0 1 5 5v3l1.5 2H2.5L4 10V7a5 5 0 0 1 5-5z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M7 15a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: 3,
              right: 3,
              minWidth: 16,
              height: 16,
              borderRadius: 999,
              background: "#e74c3c",
              color: "#fff",
              fontSize: 10,
              fontWeight: 800,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 4px",
              lineHeight: 1,
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            right: 0,
            width: 340,
            background: "#fff",
            border: "1px solid var(--border)",
            borderRadius: 14,
            boxShadow: "0 12px 48px rgba(40,30,20,.14)",
            zIndex: 200,
            overflow: "hidden",
            maxHeight: 480,
            display: "flex",
            flexDirection: "column",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px 12px",
              borderBottom: "1px solid var(--border)",
              flexShrink: 0,
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 14, color: "var(--brand-text)" }}>
              Notifications
              {unreadCount > 0 && (
                <span
                  style={{
                    marginLeft: 8,
                    background: "#e74c3c",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 800,
                    borderRadius: 999,
                    padding: "2px 7px",
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </span>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllMutation.mutate()}
                disabled={markAllMutation.isPending}
                style={{
                  fontSize: 12,
                  color: "var(--teal)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  padding: 0,
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {countQuery.isError && (
              <div style={{ padding: "10px 16px", color: "#b24a3f", fontSize: 12 }}>
                Unable to refresh unread count.
              </div>
            )}
            {mutationError && (
              <div style={{ padding: "10px 16px", color: "#b24a3f", fontSize: 12 }}>
                {mutationError}
              </div>
            )}
            {listQuery.isLoading && (
              <div style={{ padding: "20px 16px", color: "var(--faint)", fontSize: 13 }}>
                Loading...
              </div>
            )}
            {listQuery.isError && (
              <div style={{ padding: "20px 16px", color: "#b24a3f", fontSize: 13 }}>
                {listQuery.error instanceof Error ? listQuery.error.message : "Unable to load notifications."}
              </div>
            )}
            {!listQuery.isLoading && !listQuery.isError && notifications.length === 0 && (
              <div
                style={{
                  padding: "24px 16px",
                  color: "var(--faint)",
                  fontSize: 13,
                  textAlign: "center",
                }}
              >
                No notifications yet.
              </div>
            )}
            {!listQuery.isError && notifications.map((notif) => {
              const isUnread = !notif.read_at;
              return (
                <div
                  key={notif.id}
                  onClick={() => handleClick(notif)}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "12px 16px",
                    borderBottom: "1px solid var(--border-soft, #f0ede8)",
                    cursor: "pointer",
                    background: isUnread ? "var(--teal-lt)" : "transparent",
                    transition: "background .1s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = isUnread
                      ? "#d0eeee"
                      : "var(--teal-lt)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = isUnread
                      ? "var(--teal-lt)"
                      : "transparent";
                  }}
                >
                  <span style={{ fontSize: 18, lineHeight: 1, marginTop: 1, flexShrink: 0 }}>
                    {typeIcon(notif.type)}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: isUnread ? 700 : 500,
                        color: "var(--brand-text)",
                        marginBottom: 2,
                      }}
                    >
                      {notif.title}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--faint)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {notif.body}
                    </div>
                  </div>
                  <div
                    style={{
                      flexShrink: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: 4,
                    }}
                  >
                    <span style={{ fontSize: 11, color: "var(--faint)", whiteSpace: "nowrap" }}>
                      {formatRelativeTime(notif.created_at)}
                    </span>
                    {isUnread && (
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: "var(--teal)",
                          display: "inline-block",
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
            {totalNotifications > notifications.length && (
              <button
                onClick={() => setListLimit((current) => current + LIST_LIMIT)}
                disabled={listQuery.isFetching}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "none",
                  borderTop: "1px solid var(--border)",
                  background: "#fff",
                  color: "var(--teal)",
                  cursor: listQuery.isFetching ? "not-allowed" : "pointer",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                {listQuery.isFetching ? "Loading..." : "Load more"}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function markReadMutationError(error: unknown) {
  return error instanceof Error ? error.message : null;
}
