import AdminPagination from "../AdminPagination";
import AdminAuditTimeline from "./AdminAuditTimeline";
import { btnApproveCls, btnDangerCls, btnGhostCls } from "./admin-styles";
import { cn } from "@/lib/utils";
import type { AdminAuditAction, AdminConversation, AdminMessage } from "@/src/types/api/admin";
import { formatShortDateTime } from "@/src/utils/format";
import { isConversationLocked } from "./AdminConversationList";

function senderName(message: AdminMessage) {
  return `${message.sender_firstname} ${message.sender_lastname}`.trim() || message.sender_email;
}

type AdminConversationDetailPanelProps = {
  actions: AdminAuditAction[];
  actionPage: number;
  actionTotal: number;
  conversation: AdminConversation;
  isLoadingActions: boolean;
  isBusy: boolean;
  isLoadingMessages: boolean;
  messages: AdminMessage[];
  messagePage: number;
  messageTotal: number;
  messageLimit: number;
  hidingMessageId?: string;
  onHideMessage: (message: AdminMessage) => void;
  onActionPageChange: (page: number) => void;
  onLock: () => void;
  onMessagePageChange: (page: number) => void;
  onUnlock: () => void;
};

export default function AdminConversationDetailPanel({
  actions,
  actionPage,
  actionTotal,
  conversation,
  isLoadingActions,
  isBusy,
  isLoadingMessages,
  messages,
  messagePage,
  messageTotal,
  messageLimit,
  hidingMessageId,
  onActionPageChange,
  onHideMessage,
  onLock,
  onMessagePageChange,
  onUnlock,
}: AdminConversationDetailPanelProps) {
  const locked = isConversationLocked(conversation);

  return (
    <section className="bg-admin-card border border-admin-border rounded-2xl shadow-[var(--admin-shadow)] overflow-hidden">
      <div className="p-5 border-b border-admin-border-soft flex justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h2 className="m-0 font-display text-[22px] text-admin-ink break-words sm:text-[24px]">
            {conversation.parent.display_name} / {conversation.nanny.display_name}
          </h2>
          <p className="mt-[6px] mb-0 text-admin-ink-soft text-[13px] break-words">
            Booking {conversation.booking_status} · {conversation.parent.email} · {conversation.nanny.email}
          </p>
          {conversation.lock_reason && (
            <p className="mt-2 mb-0 text-admin-red text-[13px]">
              Lock reason: {conversation.lock_reason}
            </p>
          )}
        </div>
        <div className="flex w-full flex-col gap-[10px] items-stretch sm:w-auto sm:flex-row sm:items-start">
          <button disabled={locked || isBusy} onClick={onLock} className={cn(btnDangerCls, (locked || isBusy) && "opacity-55")}>
            Lock
          </button>
          <button disabled={!locked || isBusy} onClick={onUnlock} className={cn(btnApproveCls, (!locked || isBusy) && "opacity-55")}>
            Unlock
          </button>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-3">
        <div className="flex flex-col gap-3 max-h-[calc(100dvh-290px)] overflow-auto">
          {isLoadingMessages ? (
            <p className="m-0 text-admin-ink-soft">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="m-0 text-admin-ink-soft">No messages in this conversation.</p>
          ) : (
            messages.map((message) => {
              const hidden = Boolean(message.hidden_at);
              const isMessageBusy = hidingMessageId === message.id;

              return (
                <div
                  key={message.id}
                  className="p-[14px] rounded-xl"
                  style={{
                    border: `1px solid ${hidden ? "var(--admin-red)" : "var(--admin-border-soft)"}`,
                    background: hidden ? "var(--admin-red-light)" : "var(--admin-bg-soft)",
                  }}
                >
                  <div className="flex justify-between gap-3 flex-wrap">
                    <div className="text-admin-ink font-bold text-[13.5px]">
                      {senderName(message)} <span className="text-admin-ink-soft font-medium">({message.sender_role})</span>
                    </div>
                    <div className="text-admin-ink-soft text-[12.5px]">{formatShortDateTime(message.created_at)}</div>
                  </div>
                  <p className={cn("mt-[10px] mb-0 leading-[1.5] text-[14px]", hidden ? "text-admin-red" : "text-admin-ink-mid")}>
                    {hidden ? "Hidden message" : message.body}
                  </p>
                  {message.hidden_reason && (
                    <p className="mt-2 mb-0 text-admin-red text-[13px]">
                      Hidden reason: {message.hidden_reason}
                    </p>
                  )}
                  <div className="mt-[10px]">
                    <button disabled={hidden || isMessageBusy} onClick={() => onHideMessage(message)} className={cn(btnGhostCls, (hidden || isMessageBusy) && "opacity-55")}>
                      Hide message
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <AdminPagination page={messagePage} total={messageTotal} limit={messageLimit} onPageChange={onMessagePageChange} />
        <AdminAuditTimeline
          actions={actions}
          isLoading={isLoadingActions}
          page={actionPage}
          total={actionTotal}
          limit={ACTION_PAGE_SIZE}
          onPageChange={onActionPageChange}
        />
      </div>
    </section>
  );
}

const ACTION_PAGE_SIZE = 10;
