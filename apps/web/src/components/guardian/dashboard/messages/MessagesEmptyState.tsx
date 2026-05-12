"use client";

interface MessagesEmptyStateProps {
  onFindNanny: () => void;
}

export default function MessagesEmptyState({
  onFindNanny,
}: MessagesEmptyStateProps) {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center gap-4"
      style={{ padding: 40 }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "var(--teal-lt)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 36,
        }}
      >
        💬
      </div>
      <div style={{ textAlign: "center" }}>
        <h2
          className="font-display"
          style={{ fontWeight: 400, fontSize: 26, marginBottom: 10 }}
        >
          No messages yet
        </h2>
        <p
          style={{
            color: "var(--muted)",
            fontSize: 15,
            lineHeight: 1.7,
            maxWidth: 360,
          }}
        >
          Once a nanny accepts your booking request, messaging will unlock.
          Find a nanny to get started.
        </p>
      </div>
      <button
        onClick={onFindNanny}
        className="btn-cta"
        style={{ marginTop: 8, padding: "12px 28px", fontSize: 15 }}
      >
        Find a nanny
      </button>
    </div>
  );
}
