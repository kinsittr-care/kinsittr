"use client";

interface MessagesEmptyStateProps {
  onFindNanny: () => void;
}

export default function MessagesEmptyState({
  onFindNanny,
}: MessagesEmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-10">
      <div className="w-20 h-20 rounded-full bg-teal-lt flex items-center justify-center text-[36px]">
        💬
      </div>
      <div className="text-center">
        <h2 className="font-display font-normal text-[26px] mb-[10px]">
          No messages yet
        </h2>
        <p className="text-[var(--faint)] text-[15px] leading-[1.7] max-w-[360px]">
          Once a nanny accepts your booking request, messaging will unlock.
          Find a nanny to get started.
        </p>
      </div>
      <button
        onClick={onFindNanny}
        className="btn-cta mt-2 px-7 py-3 text-[15px]"
      >
        Find a nanny
      </button>
    </div>
  );
}
