"use client";

import { cn } from "@/lib/utils";

interface MessagesComposerProps {
  input: string;
  sendError: string | null;
  canSend: boolean;
  isSending: boolean;
  isConversationSelected: boolean;
  isLocked: boolean;
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
  isLocked,
  isMobile,
  onInputChange,
  onSend,
}: MessagesComposerProps) {
  return (
    <div
      className="border-t border-brand-border bg-white"
      style={{ padding: isMobile ? "14px 16px" : "18px 26px" }}
    >
      {sendError && (
        <p className="text-[#c0392b] text-[13px] mb-[10px]">{sendError}</p>
      )}
      {isLocked ? (
        <div className="rounded-2xl border border-brand-border bg-[#f9f4e8] px-4 py-3 text-[13.5px] leading-normal text-brand-ink-soft">
          This conversation has been locked by KinSittr support. You can view past messages, but new messages cannot be sent.
        </div>
      ) : (
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
          className="flex-1 min-h-[52px] max-h-[120px] resize-y rounded-2xl border border-brand-border px-4 py-[14px] text-[14px] font-[inherit] outline-none"
        />
        <button
          onClick={onSend}
          disabled={!canSend}
          className={cn("btn-cta px-5 py-[13px] text-[14px]", !canSend && "opacity-70")}
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </div>
      )}
    </div>
  );
}
