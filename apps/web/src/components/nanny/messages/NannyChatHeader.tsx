"use client";

import type { Conversation } from "@/src/types/api/api";
import { N } from "../tokens";
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
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: isMobile ? "14px 16px" : "18px 26px",
        borderBottom: `1px solid ${N.border}`,
        background: N.card,
        boxShadow: "0 2px 12px rgba(45,90,61,.06)",
        flexShrink: 0,
      }}
    >
      {isMobile && (
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: N.green,
            padding: "4px 8px 4px 0",
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 14,
            fontFamily: "inherit",
            fontWeight: 500,
          }}
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
            <div style={{ fontWeight: 600, fontSize: isMobile ? 15 : 16, color: N.greenDk }}>
              {conversation.other_participant_name}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, marginTop: 2 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: conversation.booking_status === "approved" ? N.green : N.inkFaint,
                  display: "inline-block",
                }}
              />
              <span style={{ color: conversation.booking_status === "approved" ? N.green : N.inkFaint }}>
                {formatConversationStatus(conversation.booking_status)}
              </span>
            </div>
          </div>
          {!isMobile && (
            <div style={{ marginLeft: "auto" }}>
              <button
                onClick={onViewBookingDetails}
                style={{
                  padding: "7px 14px",
                  fontSize: 13,
                  background: N.card,
                  border: `1px solid ${N.border}`,
                  borderRadius: 8,
                  cursor: "pointer",
                  color: N.inkSoft,
                  fontFamily: "inherit",
                }}
              >
                Booking details
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={{ fontWeight: 600, fontSize: isMobile ? 15 : 16, color: N.inkMute }}>
          Select a conversation
        </div>
      )}
    </div>
  );
}
