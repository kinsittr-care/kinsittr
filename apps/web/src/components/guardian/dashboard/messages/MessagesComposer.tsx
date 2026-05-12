"use client";

interface MessagesComposerProps {
  input: string;
  sendError: string | null;
  canSend: boolean;
  isSending: boolean;
  isConversationSelected: boolean;
  isMobile: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
}

export default function MessagesComposer({
  input,
  sendError,
  canSend,
  isSending,
  isConversationSelected,
  isMobile,
  onInputChange,
  onSend,
}: MessagesComposerProps) {
  return (
    <div
      style={{
        padding: isMobile ? "14px 16px" : "18px 26px",
        borderTop: "1px solid var(--border)",
        background: "#fff",
      }}
    >
      {sendError && (
        <p style={{ color: "#c0392b", fontSize: 13, marginBottom: 10 }}>
          {sendError}
        </p>
      )}
      <div className="flex items-end gap-[12px]">
        <textarea
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
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
            border: "1px solid var(--border)",
            padding: "14px 16px",
            fontSize: 14,
            fontFamily: "inherit",
            outline: "none",
          }}
        />
        <button
          onClick={onSend}
          disabled={!canSend}
          className="btn-cta"
          style={{
            padding: "13px 20px",
            fontSize: 14,
            opacity: canSend ? 1 : 0.7,
          }}
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
