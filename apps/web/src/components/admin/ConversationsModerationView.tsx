"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { A } from "./tokens";
import AdminPageHeader from "./AdminPageHeader";
import AdminPill from "./AdminPill";
import { btnApprove, btnDanger, btnGhost } from "./admin-styles";
import type {
  AdminConversation,
  AdminMessage,
  ListAdminConversationsParams,
  ListAdminMessagesParams,
} from "@/src/types/api/admin";
import type { BookingStatus } from "@/src/types/api/api";
import {
  adminConversationMessagesQueryKey,
  adminConversationsQueryKey,
  hideAdminConversationMessage,
  listAdminConversationMessages,
  listAdminConversations,
  lockAdminConversation,
  unlockAdminConversation,
} from "@/src/utils/api/admin/conversations";
import { formatOptionalShortDateTime, formatShortDateTime } from "@/src/utils/format";

const statusFilters: Array<{ label: string; value: BookingStatus | "" }> = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Declined", value: "declined" },
];

function senderName(message: AdminMessage) {
  return `${message.sender_firstname} ${message.sender_lastname}`.trim() || message.sender_email;
}

function isLocked(conversation: AdminConversation) {
  return Boolean(conversation.locked_at);
}

export default function ConversationsModerationView() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<BookingStatus | "">("");
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  const params = useMemo<ListAdminConversationsParams>(
    () => ({
      page: 1,
      limit: 20,
      search: submittedSearch || undefined,
      status: status || undefined,
    }),
    [status, submittedSearch],
  );
  const messageParams = useMemo<ListAdminMessagesParams>(() => ({ page: 1, limit: 50 }), []);

  const conversationsQuery = useQuery({
    queryKey: adminConversationsQueryKey(params),
    queryFn: () => listAdminConversations(params),
  });
  const conversations = conversationsQuery.data?.data?.items ?? [];
  const total = conversationsQuery.data?.data?.total ?? 0;
  const fallbackConversation = conversations.find((item) => item.id === selectedConversationId);

  const messagesQuery = useQuery({
    queryKey: selectedConversationId
      ? adminConversationMessagesQueryKey(selectedConversationId, messageParams)
      : ["admin", "conversation-messages", "none"],
    queryFn: () => listAdminConversationMessages(selectedConversationId as string, messageParams),
    enabled: Boolean(selectedConversationId),
  });
  const selectedConversation = messagesQuery.data?.data?.conversation ?? fallbackConversation ?? null;
  const messages = messagesQuery.data?.data?.items ?? [];

  const invalidateConversation = async (conversationId: string) => {
    await queryClient.invalidateQueries({ queryKey: ["admin", "conversations"] });
    await queryClient.invalidateQueries({ queryKey: ["admin", "conversation-messages", conversationId] });
  };

  const lockMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      lockAdminConversation(id, { reason }),
    onSuccess: async (_data, variables) => invalidateConversation(variables.id),
  });

  const unlockMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      unlockAdminConversation(id, { reason }),
    onSuccess: async (_data, variables) => invalidateConversation(variables.id),
  });

  const hideMessageMutation = useMutation({
    mutationFn: ({ conversationId, messageId, reason }: { conversationId: string; messageId: string; reason: string }) =>
      hideAdminConversationMessage(conversationId, messageId, { reason }),
    onSuccess: async (_data, variables) => invalidateConversation(variables.conversationId),
  });

  const askReason = (action: string) => window.prompt(`Reason for ${action}?`)?.trim();
  const actionError =
    conversationsQuery.error || messagesQuery.error || lockMutation.error || unlockMutation.error || hideMessageMutation.error;
  const selectedIsBusy =
    selectedConversation &&
    ((lockMutation.isPending && lockMutation.variables?.id === selectedConversation.id) ||
      (unlockMutation.isPending && unlockMutation.variables?.id === selectedConversation.id));

  return (
    <>
      <AdminPageHeader
        title="Conversations"
        subtitle={`${total} conversations found`}
        right={
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setSubmittedSearch(search.trim());
            }}
            style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}
          >
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search conversations..."
              style={{
                padding: "10px 14px",
                background: A.card,
                border: `1px solid ${A.border}`,
                borderRadius: 10,
                color: A.ink,
                minWidth: 240,
              }}
            />
            <button type="submit" style={btnGhost}>Search</button>
            {statusFilters.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setStatus(item.value);
                  setSelectedConversationId(null);
                }}
                style={{
                  ...btnGhost,
                  borderColor: status === item.value ? A.clay : A.border,
                  color: status === item.value ? A.clay : A.inkMid,
                }}
              >
                {item.label}
              </button>
            ))}
          </form>
        }
      />

      <div style={{ padding: "24px 40px 40px", display: "grid", gridTemplateColumns: selectedConversation ? "360px 1fr" : "1fr", gap: 18 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {actionError && (
            <p style={{ color: A.red, fontSize: 14, margin: 0 }}>
              {actionError instanceof Error ? actionError.message : "Unable to update conversation moderation."}
            </p>
          )}

          <div style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 16, boxShadow: A.shadow, overflow: "hidden" }}>
            {conversationsQuery.isLoading ? (
              <p style={{ padding: 20, margin: 0, color: A.inkSoft }}>Loading conversations...</p>
            ) : conversations.length === 0 ? (
              <p style={{ padding: 20, margin: 0, color: A.inkSoft }}>No conversations found.</p>
            ) : (
              conversations.map((conversation, index) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversationId(conversation.id)}
                  style={{
                    all: "unset",
                    display: "block",
                    width: "100%",
                    boxSizing: "border-box",
                    padding: 18,
                    cursor: "pointer",
                    background: selectedConversationId === conversation.id ? A.cardWarm : A.card,
                    borderBottom: index < conversations.length - 1 ? `1px solid ${A.borderSoft}` : "none",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                    <div style={{ color: A.ink, fontWeight: 700, fontSize: 14 }}>
                      {conversation.parent.display_name} / {conversation.nanny.display_name}
                    </div>
                    <AdminPill tone={isLocked(conversation) ? "red" : "green"}>
                      {isLocked(conversation) ? "Locked" : "Open"}
                    </AdminPill>
                  </div>
                  <p style={{ margin: "8px 0 0", color: A.inkMid, fontSize: 13.5, lineHeight: 1.4 }}>
                    {conversation.last_message_preview || "No messages yet"}
                  </p>
                  <div style={{ marginTop: 8, color: A.inkSoft, fontSize: 12.5 }}>
                    {conversation.message_count} messages · {formatOptionalShortDateTime(conversation.last_message_at, "No messages yet")}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {selectedConversation && (
          <section style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 16, boxShadow: A.shadow, overflow: "hidden" }}>
            <div style={{ padding: 20, borderBottom: `1px solid ${A.borderSoft}`, display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div>
                <h2 style={{ margin: 0, fontFamily: "var(--font-dm-serif), serif", fontSize: 24, color: A.ink }}>
                  {selectedConversation.parent.display_name} / {selectedConversation.nanny.display_name}
                </h2>
                <p style={{ margin: "6px 0 0", color: A.inkSoft, fontSize: 13 }}>
                  Booking {selectedConversation.booking_status} · {selectedConversation.parent.email} · {selectedConversation.nanny.email}
                </p>
                {selectedConversation.lock_reason && (
                  <p style={{ margin: "8px 0 0", color: A.red, fontSize: 13 }}>
                    Lock reason: {selectedConversation.lock_reason}
                  </p>
                )}
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <button
                  disabled={isLocked(selectedConversation) || Boolean(selectedIsBusy)}
                  onClick={() => {
                    const reason = askReason("locking this conversation");
                    if (reason) lockMutation.mutate({ id: selectedConversation.id, reason });
                  }}
                  style={{ ...btnDanger, opacity: !isLocked(selectedConversation) && !selectedIsBusy ? 1 : 0.55 }}
                >
                  Lock
                </button>
                <button
                  disabled={!isLocked(selectedConversation) || Boolean(selectedIsBusy)}
                  onClick={() => {
                    const reason = askReason("unlocking this conversation");
                    if (reason) unlockMutation.mutate({ id: selectedConversation.id, reason });
                  }}
                  style={{ ...btnApprove, opacity: isLocked(selectedConversation) && !selectedIsBusy ? 1 : 0.55 }}
                >
                  Unlock
                </button>
              </div>
            </div>

            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12, maxHeight: "calc(100dvh - 230px)", overflow: "auto" }}>
              {messagesQuery.isLoading ? (
                <p style={{ margin: 0, color: A.inkSoft }}>Loading messages...</p>
              ) : messages.length === 0 ? (
                <p style={{ margin: 0, color: A.inkSoft }}>No messages in this conversation.</p>
              ) : (
                messages.map((message) => {
                  const hidden = Boolean(message.hidden_at);
                  const isBusy =
                    hideMessageMutation.isPending &&
                    hideMessageMutation.variables?.messageId === message.id;

                  return (
                    <div
                      key={message.id}
                      style={{
                        padding: 14,
                        border: `1px solid ${hidden ? A.red : A.borderSoft}`,
                        background: hidden ? A.redLight : A.bgSoft,
                        borderRadius: 12,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                        <div style={{ color: A.ink, fontWeight: 700, fontSize: 13.5 }}>
                          {senderName(message)} <span style={{ color: A.inkSoft, fontWeight: 500 }}>({message.sender_role})</span>
                        </div>
                        <div style={{ color: A.inkSoft, fontSize: 12.5 }}>{formatShortDateTime(message.created_at)}</div>
                      </div>
                      <p style={{ margin: "10px 0 0", color: hidden ? A.red : A.inkMid, lineHeight: 1.5, fontSize: 14 }}>
                        {hidden ? "Hidden message" : message.body}
                      </p>
                      {message.hidden_reason && (
                        <p style={{ margin: "8px 0 0", color: A.red, fontSize: 13 }}>
                          Hidden reason: {message.hidden_reason}
                        </p>
                      )}
                      <div style={{ marginTop: 10 }}>
                        <button
                          disabled={hidden || isBusy}
                          onClick={() => {
                            const reason = askReason("hiding this message");
                            if (reason) {
                              hideMessageMutation.mutate({
                                conversationId: selectedConversation.id,
                                messageId: message.id,
                                reason,
                              });
                            }
                          }}
                          style={{ ...btnGhost, opacity: !hidden && !isBusy ? 1 : 0.55 }}
                        >
                          Hide message
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
