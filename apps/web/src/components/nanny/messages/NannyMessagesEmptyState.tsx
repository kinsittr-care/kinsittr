export default function NannyMessagesEmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-10">
      <div className="w-20 h-20 rounded-full bg-nanny-green-lt border border-nanny-green-mid flex items-center justify-center text-[36px]">
        💬
      </div>
      <div className="text-center">
        <h2 className="font-display font-normal text-[26px] text-nanny-green-dk mb-2.5">
          No messages yet
        </h2>
        <p className="text-nanny-ink-faint text-[15px] leading-[1.7] max-w-[360px]">
          When a parent books you and the booking is active, your conversation will appear here.
        </p>
      </div>
    </div>
  );
}
