"use client";

import type { Conversation } from "@/src/types/api/api";
import Avatar from "../Avatar";
import {
  formatThreadTimestamp,
  getInitials,
} from "./message-helpers";

interface MessagesThreadListProps {
  conversations: Conversation[];
  totalConversations: number;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  isMobile: boolean;
  selectedConversationId: string | null;
  onRetry: () => void;
  onSelectConversation: (id: string) => void;
  onLoadMore: () => void;
}

export default function MessagesThreadList({
  conversations,
  totalConversations,
  isLoading,
  isError,
  errorMessage,
  isMobile,
  selectedConversationId,
  onRetry,
  onSelectConversation,
  onLoadMore,
}: MessagesThreadListProps) {
  return (
    <div
      style={{
        width: isMobile ? "100%" : 296,
        flexShrink: 0,
        borderRight: isMobile ? "none" : "1px solid var(--border)",
        overflowY: "auto",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: isMobile ? "20px 16px 14px" : "28px 22px 18px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <h2
          className="font-display"
          style={{ fontWeight: 400, fontSize: isMobile ? 22 : 24 }}
        >
          Messages
        </h2>
      </div>

      {isLoading && (
        <div style={{ padding: "18px 20px", color: "var(--faint)", fontSize: 14 }}>
          Loading conversations...
        </div>
      )}

      {isError && (
        <div style={{ padding: "18px 20px" }}>
          <p style={{ color: "#c0392b", fontSize: 14, marginBottom: 10 }}>
            {errorMessage || "Unable to load conversations right now."}
          </p>
          <button
            onClick={onRetry}
            className="btn-outline"
            style={{ padding: "8px 14px", fontSize: 13 }}
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading &&
        !isError &&
        conversations.map((conversation) => {
          const isSelected = selectedConversationId === conversation.id;
          const hasUnread = conversation.unread_count > 0;

          return (
            <div
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              className="flex items-center gap-[13px]"
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--border)",
                cursor: "pointer",
                background: isSelected && !isMobile ? "var(--teal-lt)" : "transparent",
                transition: "background .12s",
              }}
            >
              <Avatar
                initials={getInitials(conversation.other_participant_name)}
                size={46}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: hasUnread ? 800 : 600,
                    fontSize: 14,
                    marginBottom: 2,
                    color: isSelected ? "var(--teal-dk)" : "var(--brand-text)",
                  }}
                >
                  {conversation.other_participant_name}
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: hasUnread ? "var(--brand-text)" : "var(--faint)",
                    fontWeight: hasUnread ? 600 : 400,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {conversation.last_message_preview || "No messages yet"}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                <div
                  style={{
                    fontSize: 11.5,
                    color: hasUnread ? "var(--teal)" : "var(--faint)",
                    fontWeight: hasUnread ? 700 : 400,
                  }}
                >
                  {formatThreadTimestamp(conversation.last_message_at)}
                </div>
                {hasUnread && (
                  <span
                    style={{
                      minWidth: 20,
                      height: 20,
                      borderRadius: 999,
                      background: "var(--teal)",
                      color: "#fff",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 800,
                      padding: "0 6px",
                    }}
                  >
                    {conversation.unread_count > 99 ? "99+" : conversation.unread_count}
                  </span>
                )}
              </div>
            </div>
          );
        })}

      {!isLoading &&
        !isError &&
        totalConversations > conversations.length && (
          <div style={{ padding: "16px 20px" }}>
            <button
              onClick={onLoadMore}
              className="btn-outline"
              style={{ width: "100%", padding: "10px 14px", fontSize: 13 }}
            >
              Load more conversations
            </button>
          </div>
        )}
    </div>
  );
}
