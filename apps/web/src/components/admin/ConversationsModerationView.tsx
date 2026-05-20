"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { A } from "./tokens";
import AdminPageHeader from "./compositions/AdminPageHeader";
import AdminReasonDialog, { type AdminReasonDialogState } from "./AdminReasonDialog";
import AdminConversationDetailPanel from "./compositions/AdminConversationDetailPanel";
import AdminConversationList from "./compositions/AdminConversationList";
import { btnGhost } from "./compositions/admin-styles";
import type { ListAdminConversationsParams, ListAdminMessagesParams } from "@/src/types/api/admin";
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

const statusFilters: Array<{ label: string; value: BookingStatus | "" }> = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Declined", value: "declined" },
];

const PAGE_SIZE = 20;
const MESSAGE_PAGE_SIZE = 50;

export default function ConversationsModerationView() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<BookingStatus | "">("");
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [messagePage, setMessagePage] = useState(1);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [reasonAction, setReasonAction] = useState<AdminReasonDialogState | null>(null);

  const params = useMemo<ListAdminConversationsParams>(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: submittedSearch || undefined,
      status: status || undefined,
    }),
    [page, status, submittedSearch],
  );
  const messageParams = useMemo<ListAdminMessagesParams>(
    () => ({ page: messagePage, limit: MESSAGE_PAGE_SIZE }),
    [messagePage],
  );

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
  const messageTotal = messagesQuery.data?.data?.total ?? 0;

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
              setPage(1);
              setMessagePage(1);
              setSubmittedSearch(search.trim());
              setSelectedConversationId(null);
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
                  setPage(1);
                  setMessagePage(1);
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

          <AdminConversationList
            conversations={conversations}
            isLoading={conversationsQuery.isLoading}
            page={page}
            selectedConversationId={selectedConversationId}
            total={total}
            limit={PAGE_SIZE}
            onPageChange={setPage}
            onSelect={(id) => {
              setMessagePage(1);
              setSelectedConversationId(id);
            }}
          />
        </div>

        {selectedConversation && (
          <AdminConversationDetailPanel
            conversation={selectedConversation}
            isBusy={Boolean(selectedIsBusy)}
            isLoadingMessages={messagesQuery.isLoading}
            messages={messages}
            messagePage={messagePage}
            messageTotal={messageTotal}
            messageLimit={MESSAGE_PAGE_SIZE}
            hidingMessageId={hideMessageMutation.variables?.messageId}
            onMessagePageChange={setMessagePage}
            onLock={() => {
              setReasonAction({
                title: "Lock conversation",
                description: "Prevent further messages in this conversation. A reason is required for the admin audit trail.",
                submitLabel: "Lock conversation",
                tone: "danger",
                onSubmit: (reason) => {
                  lockMutation.mutate({ id: selectedConversation.id, reason });
                  setReasonAction(null);
                },
              });
            }}
            onUnlock={() => {
              setReasonAction({
                title: "Unlock conversation",
                description: "Allow messaging to continue in this conversation. A reason is required for the admin audit trail.",
                submitLabel: "Unlock conversation",
                tone: "approve",
                onSubmit: (reason) => {
                  unlockMutation.mutate({ id: selectedConversation.id, reason });
                  setReasonAction(null);
                },
              });
            }}
            onHideMessage={(message) => {
              setReasonAction({
                title: "Hide message",
                description: "Hide this message from the conversation. A reason is required for the admin audit trail.",
                submitLabel: "Hide message",
                tone: "danger",
                onSubmit: (reason) => {
                  hideMessageMutation.mutate({
                    conversationId: selectedConversation.id,
                    messageId: message.id,
                    reason,
                  });
                  setReasonAction(null);
                },
              });
            }}
          />
        )}
      </div>
      <AdminReasonDialog
        action={reasonAction}
        isSubmitting={lockMutation.isPending || unlockMutation.isPending || hideMessageMutation.isPending}
        onClose={() => setReasonAction(null)}
      />
    </>
  );
}
