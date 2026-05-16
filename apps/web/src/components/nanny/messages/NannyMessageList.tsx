"use client";

import type { Conversation, Message } from "@/src/types/api/api";
import type { RefObject } from "react";
import { N } from "../tokens";
import {
  formatConversationStatus,
  formatMessageTimestamp,
  toBubbleSender,
} from "./message-helpers";

interface NannyMessageListProps {
  conversation: Conversation | null;
  messages: Message[];
  totalMessages: number;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  bottomRef: RefObject<HTMLDivElement | null>;
  onRetry: () => void;
  onLoadOlder: () => void;
}

export default function NannyMessageList({
  conversation,
  messages,
  totalMessages,
  isLoading,
  isError,
  errorMessage,
  bottomRef,
  onRetry,
  onLoadOlder,
}: NannyMessageListProps) {
  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "24px 28px",
        background: N.bg,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {conversation && (
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <span
            style={{
              fontSize: 12,
              color: N.inkMute,
              background: N.borderSoft,
              borderRadius: 10,
              padding: "4px 12px",
            }}
          >
            {formatConversationStatus(conversation.booking_status)}
          </span>
        </div>
      )}

      {!isLoading && !isError && totalMessages > messages.length && (
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <button
            onClick={onLoadOlder}
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
            Load older messages
          </button>
        </div>
      )}

      {isLoading && (
        <div style={{ textAlign: "center", color: N.inkFaint, fontSize: 14 }}>
          Loading messages...
        </div>
      )}

      {isError && (
        <div style={{ textAlign: "center" }}>
          <p style={{ color: N.rose, fontSize: 14, marginBottom: 10 }}>
            {errorMessage || "Unable to load messages right now."}
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
        messages.map((message) => {
          const sender = toBubbleSender(message.sender_role);
          const isUser = sender === "user";
          return (
            <div
              key={message.id}
              style={{
                display: "flex",
                justifyContent: isUser ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "60%",
                  padding: "13px 17px",
                  borderRadius: isUser ? "20px 20px 5px 20px" : "20px 20px 20px 5px",
                  background: isUser ? N.green : N.card,
                  color: isUser ? "#f6efd9" : N.inkSoft,
                  boxShadow: N.shadow,
                }}
              >
                <div style={{ fontSize: 14, lineHeight: 1.65 }}>{message.body}</div>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 11,
                    opacity: 0.7,
                    textAlign: isUser ? "right" : "left",
                  }}
                >
                  {formatMessageTimestamp(message.created_at)}
                </div>
              </div>
            </div>
          );
        })}

      {!isLoading && !isError && conversation && messages.length === 0 && (
        <div style={{ textAlign: "center", color: N.inkFaint, fontSize: 14 }}>
          No messages in this conversation yet.
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
