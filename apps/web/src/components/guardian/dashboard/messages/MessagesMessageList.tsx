"use client";

import { cn } from "@/lib/utils";
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
    <div className="flex flex-col gap-3 flex-1 overflow-y-auto py-6 px-7 bg-[#f8f4ee]">
      {conversation && (
        <div className="text-center mb-2">
          <span className="text-[12px] text-brand-faint bg-brand-border rounded-[10px] px-3 py-1">
            {formatConversationStatus(conversation.booking_status)}
          </span>
        </div>
      )}

      {!isLoading && !isError && totalMessages > messages.length && (
        <div className="text-center mb-2">
          <button
            onClick={onLoadOlder}
            className="btn-outline px-[14px] py-2 text-[13px]"
          >
            Load older messages
          </button>
        </div>
      )}

      {isLoading && (
        <div className="text-center text-brand-faint text-[14px]">
          Loading messages...
        </div>
      )}

      {isError && (
        <div className="text-center">
          <p className="text-[#c0392b] text-[14px] mb-[10px]">
            {errorMessage || "Unable to load messages right now."}
          </p>
          <button
            onClick={onRetry}
            className="btn-outline px-[14px] py-2 text-[13px]"
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
              className={cn("flex", sender === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className="max-w-[60%] px-[17px] py-[13px] shadow-[0_4px_14px_rgba(40,30,20,.07)]"
                style={{
                  borderRadius:
                    sender === "user" ? "20px 20px 5px 20px" : "20px 20px 20px 5px",
                  background: sender === "user" ? "var(--teal)" : "#fff",
                  color: sender === "user" ? "#fff" : "var(--brand-text)",
                }}
              >
                <div className="text-[14px] leading-[1.65]">{message.body}</div>
                <div
                  className={cn(
                    "mt-[6px] text-[11px] opacity-80",
                    sender === "user" ? "text-right" : "text-left",
                  )}
                >
                  {formatMessageTimestamp(message.created_at)}
                </div>
              </div>
            </div>
          );
        })}

      {!isLoading && !isError && conversation && messages.length === 0 && (
        <div className="text-center text-brand-faint text-[14px]">
          No messages in this conversation yet.
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
