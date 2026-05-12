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
      className="flex items-center gap-[14px]"
      style={{
        padding: isMobile ? "14px 16px" : "18px 26px",
        borderBottom: "1px solid var(--border)",
        background: "#fdfaf5",
        boxShadow: "0 2px 12px rgba(40,30,20,.07)",
      }}
    >
      {isMobile && (
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--teal)",
            padding: "4px 8px 4px 0",
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 14,
            fontFamily: "inherit",
            fontWeight: 500,
          }}
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
            <div style={{ fontWeight: 600, fontSize: isMobile ? 15 : 16 }}>
              {conversation.other_participant_name}
            </div>
            <div
              className="flex items-center gap-[5px]"
              style={{ fontSize: 13, marginTop: 2 }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background:
                    conversation.booking_status === "approved" ? "#4caf7d" : "#ccc",
                  display: "inline-block",
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
            <div className="flex gap-2" style={{ marginLeft: "auto" }}>
              <button
                className="btn-outline"
                style={{ padding: "7px 14px", fontSize: 13 }}
                onClick={onViewProfile}
              >
                View profile
              </button>
              <button
                className="btn-outline"
                style={{ padding: "7px 14px", fontSize: 13 }}
                onClick={onViewBookingDetails}
              >
                Booking details
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={{ fontWeight: 600, fontSize: isMobile ? 15 : 16 }}>
          Select a conversation
        </div>
      )}
    </div>
  );
}
