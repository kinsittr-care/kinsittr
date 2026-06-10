"use client";

import type { Conversation } from "@/src/types/api/api";
import { cn } from "@/lib/utils";
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
      className={cn(
        "bg-nanny-card-soft flex flex-col overflow-y-auto shrink-0",
        isMobile ? "w-full" : "w-[296px] border-r border-nanny-border",
      )}
    >
      <div className={cn("border-b border-nanny-border", isMobile ? "px-4 pt-5 pb-[14px]" : "px-[22px] pt-7 pb-[18px]")}>
        <h2
          className={cn("font-display font-normal text-nanny-green-dk", isMobile ? "text-[22px]" : "text-[24px]")}
        >
          Messages
        </h2>
      </div>

      {isLoading && (
        <div className="px-5 py-[18px] text-nanny-ink-faint text-[14px]">
          Loading conversations...
        </div>
      )}

      {isError && (
        <div className="px-5 py-[18px]">
          <p className="text-nanny-rose text-[14px] mb-[10px]">
            {errorMessage || "Unable to load conversations right now."}
          </p>
          <button
            onClick={onRetry}
            className="px-[14px] py-2 text-[13px] bg-nanny-card border border-nanny-border rounded-lg cursor-pointer text-nanny-ink-soft"
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
                "flex items-center gap-[13px] px-5 py-4 border-b border-nanny-border-soft cursor-pointer transition-[background] duration-[120ms]",
                isSelected && !isMobile
                  ? "bg-nanny-green-lt border-l-[3px] border-l-nanny-green"
                  : "bg-transparent border-l-[3px] border-l-transparent",
              )}
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
              <div className="flex-1 min-w-0">
                <div className={cn("text-[14px] mb-0.5", hasUnread ? "font-extrabold" : "font-semibold", isSelected ? "text-nanny-green-dk" : "text-nanny-ink-soft")}>
                  {conversation.other_participant_name}
                </div>
                <div className={cn("text-[12.5px] overflow-hidden text-ellipsis whitespace-nowrap", hasUnread ? "text-nanny-ink-soft font-semibold" : "text-nanny-ink-faint font-normal")}>
                  {conversation.last_message_preview || "No messages yet"}
                </div>
              </div>
              <div className="flex flex-col items-end gap-[6px] shrink-0">
                <div className={cn("text-[11.5px]", hasUnread ? "text-nanny-green font-bold" : "text-nanny-ink-faint font-normal")}>
                  {formatThreadTimestamp(conversation.last_message_at)}
                </div>
                {hasUnread && (
                  <span className="min-w-5 h-5 rounded-full bg-nanny-green text-white inline-flex items-center justify-center text-[11px] font-extrabold px-[6px]">
                    {conversation.unread_count > 99 ? "99+" : conversation.unread_count}
                  </span>
                )}
              </div>
            </div>
          );
        })}

      {!isLoading && !isError && totalConversations > conversations.length && (
        <div className="px-5 py-4">
          <button
            onClick={onLoadMore}
            className="w-full px-[14px] py-[10px] text-[13px] bg-nanny-card border border-nanny-border rounded-lg cursor-pointer text-nanny-ink-soft"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
