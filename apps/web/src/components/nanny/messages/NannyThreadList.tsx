"use client";

import type { Conversation } from "@/src/types/api/api";
import { N } from "../tokens";
import NannyAvatar from "../NannyAvatar";
import {
  formatThreadTimestamp,
  getInitials,
} from "./message-helpers";

interface NannyThreadListProps {
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

export default function NannyThreadList({
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
}: NannyThreadListProps) {
  return (
    <div
      style={{
        width: isMobile ? "100%" : 296,
        flexShrink: 0,
        borderRight: isMobile ? "none" : `1px solid ${N.border}`,
        overflowY: "auto",
        background: N.cardSoft,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: isMobile ? "20px 16px 14px" : "28px 22px 18px",
          borderBottom: `1px solid ${N.border}`,
        }}
      >
        <h2
          style={{
            fontFamily: "DM Serif Display, var(--font-dm-serif), serif",
            fontWeight: 400,
            fontSize: isMobile ? 22 : 24,
            color: N.greenDk,
          }}
        >
          Messages
        </h2>
      </div>

      {isLoading && (
        <div style={{ padding: "18px 20px", color: N.inkFaint, fontSize: 14 }}>
          Loading conversations...
        </div>
      )}

      {isError && (
        <div style={{ padding: "18px 20px" }}>
          <p style={{ color: N.rose, fontSize: 14, marginBottom: 10 }}>
            {errorMessage || "Unable to load conversations right now."}
          </p>
          <button
            onClick={onRetry}
            style={{
              padding: "8px 14px",
              fontSize: 13,
              background: N.card,
              border: `1px solid ${N.border}`,
              borderRadius: 8,
              cursor: "pointer",
              color: N.inkSoft,
            }}
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading &&
        !isError &&
        conversations.map((conversation) => {
          const isSelected = selectedConversationId === conversation.id;
          return (
            <div
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 13,
                padding: "16px 20px",
                borderBottom: `1px solid ${N.borderSoft}`,
                cursor: "pointer",
                background: isSelected && !isMobile ? N.greenLt : "transparent",
                transition: "background .12s",
                borderLeft: isSelected && !isMobile ? `3px solid ${N.green}` : "3px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "rgba(45,90,61,.05)";
              }}
              onMouseLeave={(e) => {
                if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "transparent";
              }}
            >
              <NannyAvatar
                initials={getInitials(conversation.other_participant_name)}
                size={46}
                tone="cream"
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 14,
                    marginBottom: 2,
                    color: isSelected ? N.greenDk : N.inkSoft,
                  }}
                >
                  {conversation.other_participant_name}
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: N.inkFaint,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {conversation.last_message_preview || "No messages yet"}
                </div>
              </div>
              <div style={{ fontSize: 11.5, color: N.inkFaint, flexShrink: 0 }}>
                {formatThreadTimestamp(conversation.last_message_at)}
              </div>
            </div>
          );
        })}

      {!isLoading && !isError && totalConversations > conversations.length && (
        <div style={{ padding: "16px 20px" }}>
          <button
            onClick={onLoadMore}
            style={{
              width: "100%",
              padding: "10px 14px",
              fontSize: 13,
              background: N.card,
              border: `1px solid ${N.border}`,
              borderRadius: 8,
              cursor: "pointer",
              color: N.inkSoft,
            }}
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
