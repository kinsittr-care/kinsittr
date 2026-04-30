"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MESSAGE_THREADS } from "./data";
import type { MessageThread } from "./types";
import Avatar from "./Avatar";

interface MessagesViewProps {
  hasMessages: boolean;
}

export default function MessagesView({ hasMessages }: MessagesViewProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<MessageThread>(MESSAGE_THREADS[0]);
  const [input, setInput] = useState("");
  const [chats, setChats] = useState<Record<number, MessageThread["chat"]>>(
    () => Object.fromEntries(MESSAGE_THREADS.map((m) => [m.id, m.chat]))
  );
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected, chats]);

  const send = () => {
    if (!input.trim()) return;
    setChats((prev) => ({
      ...prev,
      [selected.id]: [...(prev[selected.id] || []), { from: "user", text: input }],
    }));
    setInput("");
  };

  if (!hasMessages) {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center gap-4"
        style={{ padding: 40 }}
      >
        <div
          style={{
            width: 80, height: 80, borderRadius: "50%",
            background: "var(--teal-lt)",
            display: "flex", alignItems: "center", justifyContent: "center",
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
          <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.7, maxWidth: 360 }}>
            Once a nanny accepts your booking request, messaging will unlock.
            Find a nanny to get started.
          </p>
        </div>
        <button
          onClick={() => router.push("/parent")}
          className="btn-cta"
          style={{ marginTop: 8, padding: "12px 28px", fontSize: 15 }}
        >
          Find a nanny
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden" style={{ flex: 1 }}>
      {/* Thread list */}
      <div
        style={{
          width: 296, flexShrink: 0,
          borderRight: "1px solid var(--border)",
          overflowY: "auto", background: "var(--bg)",
        }}
      >
        <div
          style={{
            padding: "28px 22px 18px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <h2 className="font-display" style={{ fontWeight: 400, fontSize: 24 }}>
            Messages
          </h2>
        </div>

        {MESSAGE_THREADS.map((m) => (
          <div
            key={m.id}
            onClick={() => setSelected(m)}
            className="flex items-center gap-[13px]"
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--border)",
              cursor: "pointer",
              background: selected.id === m.id ? "var(--teal-lt)" : "transparent",
              transition: "background .12s",
            }}
          >
            <div style={{ position: "relative" }}>
              <Avatar initials={m.nannyInitials} size={46} />
              {m.online && (
                <div
                  style={{
                    position: "absolute", bottom: 1, right: 1,
                    width: 11, height: 11, borderRadius: "50%",
                    background: "#4caf7d", border: "2px solid #fff",
                  }}
                />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 600, fontSize: 14, marginBottom: 2,
                  color: selected.id === m.id ? "var(--teal-dk)" : "var(--brand-text)",
                }}
              >
                {m.nannyName}
              </div>
              <div
                style={{
                  fontSize: 12.5, color: "var(--faint)",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}
              >
                {m.preview}
              </div>
            </div>
            <div style={{ fontSize: 11.5, color: "var(--faint)", flexShrink: 0 }}>
              {m.time}
            </div>
          </div>
        ))}
      </div>

      {/* Chat panel */}
      <div className="flex flex-col overflow-hidden" style={{ flex: 1 }}>
        {/* Chat header */}
        <div
          className="flex items-center gap-[14px]"
          style={{
            padding: "18px 26px",
            borderBottom: "1px solid var(--border)",
            background: "#fdfaf5",
            boxShadow: "0 2px 12px rgba(40,30,20,.07)",
          }}
        >
          <Avatar initials={selected.nannyInitials} size={44} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>{selected.nannyName}</div>
            <div className="flex items-center gap-[5px]" style={{ fontSize: 13, marginTop: 2 }}>
              <span
                style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: selected.online ? "#4caf7d" : "#ccc",
                  display: "inline-block",
                }}
              />
              <span style={{ color: selected.online ? "#4caf7d" : "var(--faint)" }}>
                {selected.online ? "Online" : "Offline"}
              </span>
            </div>
          </div>
          <div className="flex gap-2" style={{ marginLeft: "auto" }}>
            <button className="btn-outline" style={{ padding: "7px 14px", fontSize: 13 }}>
              View profile
            </button>
            <button className="btn-outline" style={{ padding: "7px 14px", fontSize: 13 }}>
              Booking details
            </button>
          </div>
        </div>

        {/* Messages */}
        <div
          className="flex flex-col gap-3"
          style={{
            flex: 1, overflowY: "auto", padding: "24px 28px",
            background: "#f8f4ee",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <span
              style={{
                fontSize: 12, color: "var(--faint)",
                background: "var(--border)", borderRadius: 10,
                padding: "4px 12px",
              }}
            >
              Today · Booking approved ✓
            </span>
          </div>

          {(chats[selected.id] || []).map((msg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: msg.from === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "60%", padding: "13px 17px",
                  borderRadius: msg.from === "user"
                    ? "20px 20px 5px 20px"
                    : "20px 20px 20px 5px",
                  background: msg.from === "user" ? "var(--teal)" : "#fff",
                  color: msg.from === "user" ? "#fff" : "var(--brand-text)",
                  fontSize: 14.5, lineHeight: 1.65,
                  boxShadow: msg.from === "user"
                    ? "0 3px 12px rgba(58,90,90,.28)"
                    : "0 2px 12px rgba(40,30,20,.07)",
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div
          className="flex gap-[10px] items-center"
          style={{
            padding: "14px 24px",
            borderTop: "1px solid var(--border)",
            background: "#fdfaf5",
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type a message..."
            style={{
              flex: 1, border: "1.5px solid var(--border)", borderRadius: 30,
              padding: "12px 20px", fontSize: 14, background: "var(--bg)",
              outline: "none", color: "var(--brand-text)", transition: "border-color .15s",
              fontFamily: "inherit",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--teal)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
          <button
            onClick={send}
            style={{
              width: 46, height: 46, borderRadius: "50%",
              background: "var(--teal)", border: "none", color: "#fff",
              cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center", flexShrink: 0,
              boxShadow: "0 3px 10px rgba(58,90,90,.38)",
              transition: "transform .1s, box-shadow .1s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.06)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
            }}
            aria-label="Send"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 9h14M9 2l7 7-7 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
