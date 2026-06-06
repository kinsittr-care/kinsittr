"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import type { Notification, NotificationType } from "@/src/types/api/api";
import {
  countUnreadNotifications,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  notificationsQueryKey,
  unreadNotificationsCountQueryKey,
} from "@/src/utils/api/notifications";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const POLL_INTERVAL = 30_000;
const LIST_LIMIT = 30;
const ROLE = "parent";

function routeForNotification(notif: Notification): string {
  if (notif.type === "message_received") {
    return notif.data?.conversation_id
      ? `/parent/messages?conversation_id=${notif.data.conversation_id}`
      : "/parent/messages";
  }
  return notif.data?.booking_id
    ? `/parent/bookings?booking_id=${notif.data.booking_id}`
    : "/parent/bookings";
}

function relativeTime(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function typeIcon(type: NotificationType): string {
  if (type === "message_received") return "💬";
  if (type === "booking_approved" || type === "booking_change_accepted") return "✅";
  if (type === "booking_declined" || type === "booking_change_declined") return "❌";
  if (type === "booking_completed") return "🏁";
  if (type === "booking_change_requested") return "🔄";
  return "📋";
}

export default function ParentNotificationsPanel() {
  const [open, setOpen] = useState(false);
  const [listLimit, setListLimit] = useState(LIST_LIMIT);
  const router = useRouter();
  const queryClient = useQueryClient();

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
  const total = listQuery.data?.data?.total ?? 0;

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: notificationsQueryKey(ROLE) });

  const markReadMutation = useMutation({ mutationFn: markNotificationRead, onSuccess: invalidate });
  const markAllMutation = useMutation({ mutationFn: markAllNotificationsRead, onSuccess: invalidate });

  const handleClick = async (notif: Notification) => {
    if (!notif.read_at) await markReadMutation.mutateAsync(notif.id);
    setOpen(false);
    router.push(routeForNotification(notif));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Notifications"
          className="relative text-teal-lt hover:text-teal hover:bg-teal-lt"
          style={{ background: open ? "var(--teal-lt)" : "var(--teal-dk)", color: open ? "var(--teal)" : "var(--teal-lt)" }}
        >
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[10px] bg-red-500 border-0 rounded-full">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="end"
        sideOffset={10}
        className="w-[calc(100vw-2rem)] max-w-80 p-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-[10px] px-1.5 h-5">
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="xs"
              disabled={markAllMutation.isPending}
              onClick={() => markAllMutation.mutate()}
              className="text-teal h-auto p-0 text-xs font-semibold hover:bg-transparent"
              style={{ color: "var(--teal)" }}
            >
              Mark all read
            </Button>
          )}
        </div>

        {/* Error states */}
        {(markReadMutation.isError || markAllMutation.isError) && (
          <p className="px-4 py-2 text-xs text-destructive">
            {(markReadMutation.error ?? markAllMutation.error) instanceof Error
              ? (markReadMutation.error ?? markAllMutation.error as Error).message
              : "Something went wrong."}
          </p>
        )}

        {/* List */}
        <ScrollArea className="max-h-[min(400px,70vh)]">
          {listQuery.isLoading && (
            <p className="px-4 py-5 text-sm text-muted-foreground">Loading...</p>
          )}
          {listQuery.isError && (
            <p className="px-4 py-5 text-sm text-destructive">
              {listQuery.error instanceof Error ? listQuery.error.message : "Unable to load notifications."}
            </p>
          )}
          {!listQuery.isLoading && !listQuery.isError && notifications.length === 0 && (
            <p className="px-4 py-6 text-sm text-muted-foreground text-center">No notifications yet.</p>
          )}

          {!listQuery.isError && notifications.map((notif) => {
            const isUnread = !notif.read_at;
            return (
              <button
                key={notif.id}
                onClick={() => handleClick(notif)}
                className={cn(
                  "w-full flex items-start gap-3 px-4 py-3 text-left border-b border-border/50 transition-colors",
                  isUnread ? "bg-teal-lt hover:bg-[#d0eeee]" : "hover:bg-muted"
                )}
                style={isUnread ? { background: "var(--teal-lt)" } : undefined}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = isUnread ? "#d0eeee" : "var(--muted)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = isUnread ? "var(--teal-lt)" : "";
                }}
              >
                <span className="text-lg leading-none mt-0.5 shrink-0">{typeIcon(notif.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-[13px] text-foreground mb-0.5", isUnread ? "font-semibold" : "font-medium")}>
                    {notif.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{notif.body}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap">{relativeTime(notif.created_at)}</span>
                  {isUnread && <span className="size-2 rounded-full" style={{ background: "var(--teal)" }} />}
                </div>
              </button>
            );
          })}

          {total > notifications.length && (
            <button
              onClick={() => setListLimit((n) => n + LIST_LIMIT)}
              disabled={listQuery.isFetching}
              className="w-full py-3 text-sm font-semibold border-t border-border hover:bg-muted disabled:opacity-50 transition-colors"
              style={{ color: "var(--teal)" }}
            >
              {listQuery.isFetching ? "Loading..." : "Load more"}
            </button>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
