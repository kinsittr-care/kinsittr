"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import AdminPageHeader from "./compositions/AdminPageHeader";
import AdminConversationDetailPanel from "./compositions/AdminConversationDetailPanel";
import AdminReasonDialog, { type AdminReasonDialogState } from "./AdminReasonDialog";
import { btnGhostCls } from "./compositions/admin-styles";
import type { ListAdminAuditActionsParams, ListAdminMessagesParams } from "@/src/types/api/admin";
import {
  adminConversationActionsQueryKey,
  adminConversationMessagesQueryKey,
  hideAdminConversationMessage,
  listAdminConversationActions,
  listAdminConversationMessages,
  lockAdminConversation,
  unlockAdminConversation,
} from "@/src/utils/api/admin/conversations";

const MESSAGE_PAGE_SIZE = 50;
const ACTION_PAGE_SIZE = 10;

export default function AdminConversationDetailView({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [messagePage, setMessagePage] = useState(1);
  const [actionPage, setActionPage] = useState(1);
  const [reasonAction, setReasonAction] = useState<AdminReasonDialogState | null>(null);
  const messageParams = useMemo<ListAdminMessagesParams>(
    () => ({ page: messagePage, limit: MESSAGE_PAGE_SIZE }),
    [messagePage],
  );
  const actionParams = useMemo<ListAdminAuditActionsParams>(
    () => ({ page: actionPage, limit: ACTION_PAGE_SIZE }),
    [actionPage],
  );

  const messagesQuery = useQuery({
    queryKey: adminConversationMessagesQueryKey(conversationId, messageParams),
    queryFn: () => listAdminConversationMessages(conversationId, messageParams),
  });
  const selectedConversation = messagesQuery.data?.data?.conversation ?? null;
  const messages = messagesQuery.data?.data?.items ?? [];
  const messageTotal = messagesQuery.data?.data?.total ?? 0;

  const actionsQuery = useQuery({
    queryKey: adminConversationActionsQueryKey(conversationId, actionParams),
    queryFn: () => listAdminConversationActions(conversationId, actionParams),
  });
  const actions = actionsQuery.data?.data?.items ?? [];
  const actionTotal = actionsQuery.data?.data?.total ?? 0;

  const invalidateConversation = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin", "conversations"] });
    await queryClient.invalidateQueries({ queryKey: ["admin", "conversation-messages", conversationId] });
    await queryClient.invalidateQueries({ queryKey: ["admin", "conversation-actions", conversationId] });
    await queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
    await queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] });
  };

  const lockMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      lockAdminConversation(id, { reason }),
    onSuccess: invalidateConversation,
  });

  const unlockMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      unlockAdminConversation(id, { reason }),
    onSuccess: invalidateConversation,
  });

  const hideMessageMutation = useMutation({
    mutationFn: ({ messageId, reason }: { messageId: string; reason: string }) =>
      hideAdminConversationMessage(conversationId, messageId, { reason }),
    onSuccess: invalidateConversation,
  });

  const actionError =
    messagesQuery.error || actionsQuery.error || lockMutation.error || unlockMutation.error || hideMessageMutation.error;
  const selectedIsBusy =
    selectedConversation &&
    ((lockMutation.isPending && lockMutation.variables?.id === selectedConversation.id) ||
      (unlockMutation.isPending && unlockMutation.variables?.id === selectedConversation.id));

  return (
    <>
      <AdminPageHeader
        title="Conversation details"
        subtitle="Review messages, lock or unlock the thread, and audit moderation actions."
        right={
          <button type="button" className={btnGhostCls} onClick={() => router.push("/admin/conversations")}>
            Back to conversations
          </button>
        }
      />
      <div className="px-4 py-5 md:px-10 md:py-6">
        {actionError && (
          <p className="mb-4 text-[14px] text-admin-red">
            {actionError instanceof Error ? actionError.message : "Unable to update conversation moderation."}
          </p>
        )}
        {messagesQuery.isLoading && !selectedConversation ? (
          <div className="rounded-2xl border border-admin-border bg-admin-card p-6 text-admin-ink-soft shadow-[var(--admin-shadow)]">
            Loading conversation...
          </div>
        ) : selectedConversation ? (
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
                  hideMessageMutation.mutate({ messageId: message.id, reason });
                  setReasonAction(null);
                },
              });
            }}
          />
        ) : (
          <div className="rounded-2xl border border-admin-border bg-admin-card p-6 text-admin-ink-soft shadow-[var(--admin-shadow)]">
            Conversation not found.
          </div>
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
