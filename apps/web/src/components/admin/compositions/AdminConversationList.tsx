import AdminPagination from "../AdminPagination";
import AdminPill from "./AdminPill";
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
    <div className="flex flex-col gap-3">
      <div className="bg-admin-card border border-admin-border rounded-2xl shadow-[var(--admin-shadow)] overflow-hidden">
        {isLoading ? (
          <p className="p-5 m-0 text-admin-ink-soft">Loading conversations...</p>
        ) : conversations.length === 0 ? (
          <p className="p-5 m-0 text-admin-ink-soft">No conversations found.</p>
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
                background: selectedConversationId === conversation.id ? "var(--admin-card-warm)" : "var(--admin-card)",
                borderBottom: index < conversations.length - 1 ? "1px solid var(--admin-border-soft)" : "none",
              }}
            >
              <div className="flex justify-between gap-[10px] items-center">
                <div className="text-admin-ink font-bold text-[14px]">
                  {conversation.parent.display_name} / {conversation.nanny.display_name}
                </div>
                <AdminPill tone={isConversationLocked(conversation) ? "red" : "green"}>
                  {isConversationLocked(conversation) ? "Locked" : "Open"}
                </AdminPill>
              </div>
              <p className="mt-2 mb-0 text-admin-ink-mid text-[13.5px] leading-[1.4]">
                {conversation.last_message_preview || "No messages yet"}
              </p>
              <div className="mt-2 text-admin-ink-soft text-[12.5px]">
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
