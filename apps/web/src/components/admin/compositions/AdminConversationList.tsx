import AdminPagination from "../AdminPagination";
import AdminPill from "./AdminPill";
import { A } from "../tokens";
import type { AdminConversation } from "@/src/types/api/admin";
import { formatOptionalShortDateTime } from "@/src/utils/format";

export function isConversationLocked(conversation: AdminConversation) {
  return Boolean(conversation.locked_at);
}

type AdminConversationListProps = {
  conversations: AdminConversation[];
  isLoading: boolean;
  page: number;
  selectedConversationId: string | null;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onSelect: (id: string) => void;
};

export default function AdminConversationList({
  conversations,
  isLoading,
  page,
  selectedConversationId,
  total,
  limit,
  onPageChange,
  onSelect,
}: AdminConversationListProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 16, boxShadow: A.shadow, overflow: "hidden" }}>
        {isLoading ? (
          <p style={{ padding: 20, margin: 0, color: A.inkSoft }}>Loading conversations...</p>
        ) : conversations.length === 0 ? (
          <p style={{ padding: 20, margin: 0, color: A.inkSoft }}>No conversations found.</p>
        ) : (
          conversations.map((conversation, index) => (
            <button
              key={conversation.id}
              onClick={() => onSelect(conversation.id)}
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
                <AdminPill tone={isConversationLocked(conversation) ? "red" : "green"}>
                  {isConversationLocked(conversation) ? "Locked" : "Open"}
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
      <AdminPagination page={page} total={total} limit={limit} onPageChange={onPageChange} />
    </div>
  );
}
