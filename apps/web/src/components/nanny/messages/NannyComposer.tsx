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
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-end">
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
          className="min-h-[52px] max-h-[120px] w-full min-w-0 flex-1 resize-y rounded-2xl border border-nanny-border bg-nanny-card-soft px-4 py-[14px] text-[14px] text-nanny-ink-faint outline-none"
        />
        <button
          onClick={onSend}
          disabled={!canSend}
          className={`w-full rounded-xl border-0 bg-nanny-green px-5 py-[13px] text-[14px] font-semibold text-[#f6efd9] transition-opacity duration-150 sm:w-auto sm:shrink-0 ${canSend ? "cursor-pointer opacity-100" : "cursor-default opacity-60"}`}
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
