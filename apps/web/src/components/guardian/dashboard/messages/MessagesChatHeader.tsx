"use client";

import type { Conversation } from "@/src/types/api/api";
import Avatar from "../Avatar";
import {
  formatConversationStatus,
  getInitials,
} from "./message-helpers";

interface MessagesChatHeaderProps {
  conversation: Conversation | null;
  isMobile: boolean;
  onBack: () => void;
  onViewProfile: () => void;
  onViewBookingDetails: () => void;
}

export default function MessagesChatHeader({
  conversation,
  isMobile,
  onBack,
  onViewProfile,
  onViewBookingDetails,
}: MessagesChatHeaderProps) {
  return (
    <div
      className="flex items-center gap-[14px] border-b border-brand-border bg-[#fdfaf5] shadow-[0_2px_12px_rgba(40,30,20,.07)]"
      style={{ padding: isMobile ? "14px 16px" : "18px 26px" }}
    >
      {isMobile && (
        <button
          onClick={onBack}
          className="bg-transparent border-0 cursor-pointer text-teal pr-2 py-1 flex items-center gap-1 text-[14px] font-medium [font-family:inherit]"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M10 3L5 8l5 5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      {conversation ? (
        <>
          <Avatar
            initials={getInitials(conversation.other_participant_name)}
            size={isMobile ? 36 : 44}
          />
          <div>
            <div
              className="font-semibold"
              style={{ fontSize: isMobile ? 15 : 16 }}
            >
              {conversation.other_participant_name}
            </div>
            <div className="flex items-center gap-[5px] text-[13px] mt-[2px]">
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{
                  background:
                    conversation.booking_status === "approved" ? "#4caf7d" : "#ccc",
                }}
              />
              <span
                style={{
                  color:
                    conversation.booking_status === "approved"
                      ? "#4caf7d"
                      : "var(--faint)",
                }}
              >
                {formatConversationStatus(conversation.booking_status)}
              </span>
            </div>
          </div>
          {!isMobile && (
            <div className="flex gap-2 ml-auto">
              <button
                className="btn-outline px-[14px] py-[7px] text-[13px]"
                onClick={onViewProfile}
              >
                View profile
              </button>
              <button
                className="btn-outline px-[14px] py-[7px] text-[13px]"
                onClick={onViewBookingDetails}
              >
                Booking details
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="font-semibold" style={{ fontSize: isMobile ? 15 : 16 }}>
          Select a conversation
        </div>
      )}
    </div>
  );
}
