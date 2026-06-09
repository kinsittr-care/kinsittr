"use client";

import type { Conversation } from "@/src/types/api/api";
import { cn } from "@/lib/utils";
import NannyAvatar from "../NannyAvatar";
import { formatConversationStatus, getInitials } from "./message-helpers";

interface NannyChatHeaderProps {
  conversation: Conversation | null;
  isMobile: boolean;
  onBack: () => void;
  onViewBookingDetails: () => void;
}

export default function NannyChatHeader({
  conversation,
  isMobile,
  onBack,
  onViewBookingDetails,
}: NannyChatHeaderProps) {
  return (
    <div
      className="flex items-center gap-[14px] border-b border-nanny-border bg-nanny-card shadow-[0_2px_12px_rgba(45,90,61,.06)] shrink-0"
      style={{ padding: isMobile ? "14px 16px" : "18px 26px" }}
    >
      {isMobile && (
        <button
          onClick={onBack}
          className="bg-transparent border-0 cursor-pointer text-nanny-green pt-1 pb-1 pr-2 pl-0 flex items-center gap-1 text-[14px] font-medium"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {conversation ? (
        <>
          <NannyAvatar
            initials={getInitials(conversation.other_participant_name)}
            size={isMobile ? 36 : 44}
            tone="cream"
          />
          <div>
            <div className={cn("font-semibold text-nanny-green-dk", isMobile ? "text-[15px]" : "text-[16px]")}>
              {conversation.other_participant_name}
            </div>
            <div className="flex items-center gap-[5px] text-[13px] mt-0.5">
              <span
                className={cn("w-2 h-2 rounded-full inline-block", conversation.booking_status === "approved" ? "bg-nanny-green" : "bg-nanny-ink-faint")}
              />
              <span className={conversation.booking_status === "approved" ? "text-nanny-green" : "text-nanny-ink-faint"}>
                {formatConversationStatus(conversation.booking_status)}
              </span>
            </div>
          </div>
          {!isMobile && (
            <div className="ml-auto">
              <button
                onClick={onViewBookingDetails}
                className="py-[7px] px-[14px] text-[13px] bg-nanny-card border border-nanny-border rounded-lg cursor-pointer text-nanny-ink-faint"
              >
                Booking details
              </button>
            </div>
          )}
        </>
      ) : (
        <div className={cn("font-semibold text-nanny-ink-faint", isMobile ? "text-[15px]" : "text-[16px]")}>
          Select a conversation
        </div>
      )}
    </div>
  );
}
