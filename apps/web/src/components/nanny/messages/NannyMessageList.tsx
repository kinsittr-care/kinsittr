"use client";

import type { Conversation, Message } from "@/src/types/api/api";
import type { RefObject } from "react";
import { cn } from "@/lib/utils";
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
    <div className="flex-1 overflow-y-auto bg-nanny-bg flex flex-col gap-3 px-4 py-5 sm:px-6 lg:px-7 lg:py-6">
      {conversation && (
        <div className="text-center mb-2">
          <span className="text-[12px] text-nanny-ink-faint bg-nanny-border-soft rounded-[10px] px-3 py-1">
            {formatConversationStatus(conversation.booking_status)}
          </span>
        </div>
      )}

      {!isLoading && !isError && totalMessages > messages.length && (
        <div className="text-center mb-2">
          <button
            onClick={onLoadOlder}
            className="py-2 px-[14px] text-[13px] bg-nanny-card border border-nanny-border rounded-lg cursor-pointer text-nanny-ink-faint"
          >
            Load older messages
          </button>
        </div>
      )}

      {isLoading && (
        <div className="text-center text-nanny-ink-faint text-[14px]">
          Loading messages...
        </div>
      )}

      {isError && (
        <div className="text-center">
          <p className="text-nanny-rose text-[14px] mb-2.5">
            {errorMessage || "Unable to load messages right now."}
          </p>
          <button
            onClick={onRetry}
            className="py-2 px-[14px] text-[13px] bg-nanny-card border border-nanny-border rounded-lg cursor-pointer text-nanny-ink-faint"
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
              className={isUser ? "flex justify-end" : "flex justify-start"}
            >
              <div
                className={cn(
                  "max-w-[88%] py-[13px] px-[17px] shadow-(--nanny-shadow) sm:max-w-[78%] lg:max-w-[60%]",
                  isUser
                    ? "bg-nanny-green text-[#f6efd9] rounded-[20px_20px_5px_20px]"
                    : "bg-nanny-card text-nanny-ink-soft rounded-[20px_20px_20px_5px]",
                )}
              >
                <div className="text-[14px] leading-[1.65]">{message.body}</div>
                <div className={cn("mt-1.5 text-[11px] opacity-70", isUser ? "text-right" : "text-left")}>
                  {formatMessageTimestamp(message.created_at)}
                </div>
              </div>
            </div>
          );
        })}

      {!isLoading && !isError && conversation && messages.length === 0 && (
        <div className="text-center text-nanny-ink-faint text-[14px]">
          No messages in this conversation yet.
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
