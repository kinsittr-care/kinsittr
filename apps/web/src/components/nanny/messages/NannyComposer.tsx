"use client";

import { N } from "../tokens";

interface NannyComposerProps {
  input: string;
  sendError: string | null;
  canSend: boolean;
  isSending: boolean;
  isConversationSelected: boolean;
  isMobile: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
}

export default function NannyComposer({
  input,
  sendError,
  canSend,
  isSending,
  isConversationSelected,
  isMobile,
  onInputChange,
  onSend,
}: NannyComposerProps) {
  return (
    <div
      style={{
        padding: isMobile ? "14px 16px" : "18px 26px",
        borderTop: `1px solid ${N.border}`,
        background: N.card,
        flexShrink: 0,
      }}
    >
      {sendError && (
        <p style={{ color: N.rose, fontSize: 13, marginBottom: 10 }}>{sendError}</p>
      )}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
        <textarea
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder="Type your message..."
          disabled={!isConversationSelected || isSending}
          style={{
            flex: 1,
            minHeight: 52,
            maxHeight: 120,
            resize: "vertical",
            borderRadius: 16,
            border: `1px solid ${N.border}`,
            padding: "14px 16px",
            fontSize: 14,
            fontFamily: "inherit",
            outline: "none",
            background: N.cardSoft,
            color: N.inkSoft,
          }}
        />
        <button
          onClick={onSend}
          disabled={!canSend}
          style={{
            padding: "13px 20px",
            fontSize: 14,
            fontWeight: 600,
            background: N.green,
            color: "#f6efd9",
            border: "none",
            borderRadius: 12,
            cursor: canSend ? "pointer" : "default",
            opacity: canSend ? 1 : 0.6,
            fontFamily: "inherit",
            transition: "opacity .15s",
          }}
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
