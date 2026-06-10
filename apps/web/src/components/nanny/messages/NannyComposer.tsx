"use client";


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
      className="border-t border-nanny-border bg-nanny-card shrink-0"
      style={{ padding: isMobile ? "14px 16px" : "18px 26px" }}
    >
      {sendError && (
        <p className="text-nanny-rose text-[13px] mb-2.5">{sendError}</p>
      )}
      <div className="flex items-end gap-3">
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
          className="flex-1 min-h-[52px] max-h-[120px] resize-y rounded-2xl border border-nanny-border px-4 py-[14px] text-[14px] outline-none bg-nanny-card-soft text-nanny-ink-faint"
        />
        <button
          onClick={onSend}
          disabled={!canSend}
          className={`py-[13px] px-5 text-[14px] font-semibold bg-nanny-green text-[#f6efd9] border-0 rounded-xl transition-opacity duration-150 ${canSend ? "cursor-pointer opacity-100" : "cursor-default opacity-60"}`}
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
