"use client";

import type { Message, Conversation } from "@/src/types/api/api";
import type { RefObject } from "react";
import {
  formatConversationStatus,
  formatMessageTimestamp,
  toBubbleSender,
} from "./message-helpers";

interface MessagesMessageListProps {
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

export default function MessagesMessageList({
  conversation,
  messages,
  totalMessages,
  isLoading,
  isError,
  errorMessage,
  bottomRef,
  onRetry,
  onLoadOlder,
}: MessagesMessageListProps) {
  return (
    <div
      className="flex flex-col gap-3"
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "24px 28px",
        background: "#f8f4ee",
      }}
    >
      {conversation && (
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <span
            style={{
              fontSize: 12,
              color: "var(--faint)",
              background: "var(--border)",
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
            className="btn-outline"
            style={{ padding: "8px 14px", fontSize: 13 }}
          >
            Load older messages
          </button>
        </div>
      )}

      {isLoading && (
        <div style={{ textAlign: "center", color: "var(--faint)", fontSize: 14 }}>
          Loading messages...
        </div>
      )}

      {isError && (
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#c0392b", fontSize: 14, marginBottom: 10 }}>
            {errorMessage || "Unable to load messages right now."}
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
        messages.map((message) => {
          const sender = toBubbleSender(message.sender_role);

          return (
            <div
              key={message.id}
              style={{
                display: "flex",
                justifyContent: sender === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "60%",
                  padding: "13px 17px",
                  borderRadius:
                    sender === "user" ? "20px 20px 5px 20px" : "20px 20px 20px 5px",
                  background: sender === "user" ? "var(--teal)" : "#fff",
                  color: sender === "user" ? "#fff" : "var(--brand-text)",
                  boxShadow: "0 4px 14px rgba(40,30,20,.07)",
                }}
              >
                <div style={{ fontSize: 14, lineHeight: 1.65 }}>{message.body}</div>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 11,
                    opacity: 0.8,
                    textAlign: sender === "user" ? "right" : "left",
                  }}
                >
                  {formatMessageTimestamp(message.created_at)}
                </div>
              </div>
            </div>
          );
        })}

      {!isLoading && !isError && conversation && messages.length === 0 && (
        <div style={{ textAlign: "center", color: "var(--faint)", fontSize: 14 }}>
          No messages in this conversation yet.
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
