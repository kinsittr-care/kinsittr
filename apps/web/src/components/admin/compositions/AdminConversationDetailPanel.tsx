import AdminPagination from "../AdminPagination";
import AdminAuditTimeline from "./AdminAuditTimeline";
import { btnApprove, btnDanger, btnGhost } from "./admin-styles";
import { A } from "../tokens";
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
    <section style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 16, boxShadow: A.shadow, overflow: "hidden" }}>
      <div style={{ padding: 20, borderBottom: `1px solid ${A.borderSoft}`, display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0, fontFamily: "var(--font-dm-serif), serif", fontSize: 24, color: A.ink }}>
            {conversation.parent.display_name} / {conversation.nanny.display_name}
          </h2>
          <p style={{ margin: "6px 0 0", color: A.inkSoft, fontSize: 13 }}>
            Booking {conversation.booking_status} · {conversation.parent.email} · {conversation.nanny.email}
          </p>
          {conversation.lock_reason && (
            <p style={{ margin: "8px 0 0", color: A.red, fontSize: 13 }}>
              Lock reason: {conversation.lock_reason}
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <button disabled={locked || isBusy} onClick={onLock} style={{ ...btnDanger, opacity: !locked && !isBusy ? 1 : 0.55 }}>
            Lock
          </button>
          <button disabled={!locked || isBusy} onClick={onUnlock} style={{ ...btnApprove, opacity: locked && !isBusy ? 1 : 0.55 }}>
            Unlock
          </button>
        </div>
      </div>

      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: "calc(100dvh - 290px)", overflow: "auto" }}>
          {isLoadingMessages ? (
            <p style={{ margin: 0, color: A.inkSoft }}>Loading messages...</p>
          ) : messages.length === 0 ? (
            <p style={{ margin: 0, color: A.inkSoft }}>No messages in this conversation.</p>
          ) : (
            messages.map((message) => {
              const hidden = Boolean(message.hidden_at);
              const isMessageBusy = hidingMessageId === message.id;

              return (
                <div key={message.id} style={{ padding: 14, border: `1px solid ${hidden ? A.red : A.borderSoft}`, background: hidden ? A.redLight : A.bgSoft, borderRadius: 12 }}>
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
                    <button disabled={hidden || isMessageBusy} onClick={() => onHideMessage(message)} style={{ ...btnGhost, opacity: !hidden && !isMessageBusy ? 1 : 0.55 }}>
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
