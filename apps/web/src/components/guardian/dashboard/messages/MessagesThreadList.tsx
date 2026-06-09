"use client";

import { cn } from "@/lib/utils";
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
      className="shrink-0 overflow-y-auto bg-[var(--bg)] flex flex-col"
      style={{
        width: isMobile ? "100%" : 296,
        borderRight: isMobile ? "none" : "1px solid var(--border)",
      }}
    >
      <div
        className="border-b border-brand-border"
        style={{ padding: isMobile ? "20px 16px 14px" : "28px 22px 18px" }}
      >
        <h2
          className="font-display font-normal"
          style={{ fontSize: isMobile ? 22 : 24 }}
        >
          Messages
        </h2>
      </div>

      {isLoading && (
        <div className="px-5 py-[18px] text-brand-faint text-[14px]">
          Loading conversations...
        </div>
      )}

      {isError && (
        <div className="px-5 py-[18px]">
          <p className="text-[#c0392b] text-[14px] mb-[10px]">
            {errorMessage || "Unable to load conversations right now."}
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
        conversations.map((conversation) => {
          const isSelected = selectedConversationId === conversation.id;
          const hasUnread = conversation.unread_count > 0;

          return (
            <div
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              className={cn(
                "flex items-center gap-[13px] px-5 py-4 border-b border-brand-border cursor-pointer transition-colors duration-[120ms]",
                isSelected && !isMobile ? "bg-teal-lt" : "bg-transparent",
              )}
            >
              <Avatar
                initials={getInitials(conversation.other_participant_name)}
                size={46}
              />
              <div className="flex-1 min-w-0">
                <div
                  className="text-[14px] mb-[2px]"
                  style={{
                    fontWeight: hasUnread ? 800 : 600,
                    color: isSelected ? "var(--teal-dk)" : "var(--brand-text)",
                  }}
                >
                  {conversation.other_participant_name}
                </div>
                <div
                  className="text-[12.5px] overflow-hidden text-ellipsis whitespace-nowrap"
                  style={{
                    color: hasUnread ? "var(--brand-text)" : "var(--faint)",
                    fontWeight: hasUnread ? 600 : 400,
                  }}
                >
                  {conversation.last_message_preview || "No messages yet"}
                </div>
              </div>
              <div className="flex flex-col items-end gap-[6px] shrink-0">
                <div
                  className="text-[11.5px]"
                  style={{
                    color: hasUnread ? "var(--teal)" : "var(--faint)",
                    fontWeight: hasUnread ? 700 : 400,
                  }}
                >
                  {formatThreadTimestamp(conversation.last_message_at)}
                </div>
                {hasUnread && (
                  <span className="min-w-5 h-5 rounded-full bg-teal text-white inline-flex items-center justify-center text-[11px] font-extrabold px-[6px]">
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
          <div className="px-5 py-4">
            <button
              onClick={onLoadMore}
              className="btn-outline w-full px-[14px] py-[10px] text-[13px]"
            >
              Load more conversations
            </button>
          </div>
        )}
    </div>
  );
}
