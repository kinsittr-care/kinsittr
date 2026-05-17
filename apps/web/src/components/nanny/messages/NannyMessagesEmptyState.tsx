import { N } from "../tokens";

export default function NannyMessagesEmptyState() {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: 40,
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: N.greenLt,
          border: `1px solid ${N.greenMid}`,
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
          style={{
            fontFamily: "DM Serif Display, var(--font-dm-serif), serif",
            fontWeight: 400,
            fontSize: 26,
            color: N.greenDk,
            marginBottom: 10,
          }}
        >
          No messages yet
        </h2>
        <p style={{ color: N.inkMute, fontSize: 15, lineHeight: 1.7, maxWidth: 360 }}>
          When a parent books you and the booking is active, your conversation will appear here.
        </p>
      </div>
    </div>
  );
}
