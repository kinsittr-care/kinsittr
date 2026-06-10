"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminPageHeader from "./compositions/AdminPageHeader";
import AdminReasonDialog, { type AdminReasonDialogState } from "./AdminReasonDialog";
import AdminConversationDetailPanel from "./compositions/AdminConversationDetailPanel";
import AdminConversationList from "./compositions/AdminConversationList";
import { btnGhostCls } from "./compositions/admin-styles";
import { cn } from "@/lib/utils";
import type { ListAdminAuditActionsParams, ListAdminConversationsParams, ListAdminMessagesParams } from "@/src/types/api/admin";
import type { BookingStatus } from "@/src/types/api/api";
import {
  adminConversationActionsQueryKey,
  adminConversationMessagesQueryKey,
  adminConversationsQueryKey,
  hideAdminConversationMessage,
  listAdminConversationActions,
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
const ACTION_PAGE_SIZE = 10;

export default function ConversationsModerationView() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<BookingStatus | "">("");
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [messagePage, setMessagePage] = useState(1);
  const [actionPage, setActionPage] = useState(1);
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
  const actionParams = useMemo<ListAdminAuditActionsParams>(
    () => ({ page: actionPage, limit: ACTION_PAGE_SIZE }),
    [actionPage],
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
  const actionsQuery = useQuery({
    queryKey: selectedConversationId
      ? adminConversationActionsQueryKey(selectedConversationId, actionParams)
      : ["admin", "conversation-actions", "none"],
    queryFn: () => listAdminConversationActions(selectedConversationId as string, actionParams),
    enabled: Boolean(selectedConversationId),
  });
  const actions = actionsQuery.data?.data?.items ?? [];
  const actionTotal = actionsQuery.data?.data?.total ?? 0;

  const invalidateConversation = async (conversationId: string) => {
    await queryClient.invalidateQueries({ queryKey: ["admin", "conversations"] });
    await queryClient.invalidateQueries({ queryKey: ["admin", "conversation-messages", conversationId] });
    await queryClient.invalidateQueries({ queryKey: ["admin", "conversation-actions", conversationId] });
    await queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
    await queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] });
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
    conversationsQuery.error ||
    messagesQuery.error ||
    actionsQuery.error ||
    lockMutation.error ||
    unlockMutation.error ||
    hideMessageMutation.error;
  const selectedIsBusy =
    selectedConversation &&
    ((lockMutation.isPending && lockMutation.variables?.id === selectedConversation.id) ||
      (unlockMutation.isPending && unlockMutation.variables?.id === selectedConversation.id));
  const updateStatus = (nextStatus: BookingStatus | "") => {
    setPage(1);
    setMessagePage(1);
    setActionPage(1);
    setStatus(nextStatus);
    setSelectedConversationId(null);
  };

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
              setActionPage(1);
              setSubmittedSearch(search.trim());
              setSelectedConversationId(null);
            }}
            className="flex w-full max-w-[760px] flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end"
          >
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search conversations..."
              className="min-w-0 rounded-[10px] border border-admin-border bg-admin-card px-[14px] py-[10px] text-admin-ink sm:min-w-[240px]"
            />
            <button type="submit" className={btnGhostCls}>Search</button>
            <select
              value={status}
              onChange={(event) => updateStatus(event.target.value as BookingStatus | "")}
              className="rounded-[10px] border border-admin-border bg-admin-card px-[14px] py-[10px] text-admin-ink lg:hidden"
              aria-label="Conversation booking status"
            >
              {statusFilters.map((item) => (
                <option key={item.label} value={item.value}>{item.label}</option>
              ))}
            </select>
            <div className="hidden flex-wrap justify-end gap-2 lg:flex">
              {statusFilters.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => updateStatus(item.value)}
                  className={cn(btnGhostCls, status === item.value && "border-admin-clay text-admin-clay")}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </form>
        }
      />

      <div
        className="px-10 pt-6 pb-10 grid gap-[18px]"
        style={{ gridTemplateColumns: selectedConversation ? "360px 1fr" : "1fr" }}
      >
        <div className="flex flex-col gap-3">
          {actionError && (
            <p className="text-admin-red text-[14px] m-0">
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
              setActionPage(1);
              setSelectedConversationId(id);
            }}
          />
        </div>

        {selectedConversation && (
          <AdminConversationDetailPanel
            actions={actions}
            actionPage={actionPage}
            actionTotal={actionTotal}
            conversation={selectedConversation}
            isLoadingActions={actionsQuery.isLoading}
            isBusy={Boolean(selectedIsBusy)}
            isLoadingMessages={messagesQuery.isLoading}
            messages={messages}
            messagePage={messagePage}
            messageTotal={messageTotal}
            messageLimit={MESSAGE_PAGE_SIZE}
            hidingMessageId={hideMessageMutation.variables?.messageId}
            onActionPageChange={setActionPage}
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
