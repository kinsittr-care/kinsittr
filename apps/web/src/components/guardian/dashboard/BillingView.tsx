"use client";

import { useState } from "react";
import SectionCard from "../profile/SectionCard";

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  color: "var(--muted)",
  display: "block",
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1.5px solid var(--border)",
  borderRadius: 9,
  padding: "11px 14px",
  fontSize: 14,
  outline: "none",
  background: "var(--bg-warm)",
  color: "var(--brand-text)",
  fontFamily: "inherit",
  marginBottom: 16,
};

type Card = { number: string; expiry: string; name: string };

export default function BillingView() {
  const [editPayment, setEditPayment] = useState(false);
  const [card, setCard] = useState<Card>({
    number: "•••• •••• •••• 4242",
    expiry: "09/27",
    name: "Jordan Lee",
  });
  const [cardDraft, setCardDraft] = useState<Card>({ ...card });

  return (
    <div
      style={{
        maxWidth: 620,
        margin: "0 auto",
        padding: "40px 36px 60px",
        overflowY: "auto",
        height: "100%",
      }}
    >
      <div style={{ marginBottom: 36 }}>
        <h1 className="font-display" style={{ fontWeight: 400, fontSize: 30, marginBottom: 4 }}>
          Billing
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>
          Manage your payment methods and billing preferences
        </p>
      </div>

      <SectionCard title="Payment Method">
        {!editPayment ? (
          <div>
            <div 
              className="flex flex-col items-start md:flex-row md:items-center gap-4"
              style={{
                background: "var(--bg-warm)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "18px 20px",
                marginBottom: 16,
              }}
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div
                  style={{
                    width: 52,
                    height: 34,
                    background: "linear-gradient(135deg, #1a3a6e, #2a5cb8)",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.06em",
                    flexShrink: 0,
                  }}
                >
                  VISA
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, letterSpacing: "0.06em" }}>{card.number}</div>
                  <div style={{ fontSize: 13, color: "var(--faint)", marginTop: 2 }}>
                    {card.name} · Expires {card.expiry}
                  </div>
                </div>
              </div>
              <span
                style={{
                  background: "var(--teal-lt)",
                  color: "var(--teal)",
                  border: "1px solid var(--teal-mid)",
                  borderRadius: 20,
                  padding: "3px 10px",
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                ✓ Default
              </span>
            </div>
            <div className="flex flex-col md:flex-row gap-[10px]">
              <button
                className="btn-outline"
                style={{ fontSize: 13, padding: "8px 16px" }}
                onClick={() => {
                  setCardDraft({ ...card });
                  setEditPayment(true);
                }}
              >
                Change card
              </button>
              <button
                style={{
                  padding: "8px 16px",
                  fontSize: 13,
                  borderRadius: 10,
                  background: "#fff",
                  color: "#c0392b",
                  border: "1.5px solid #f0d0d0",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Remove
              </button>
              <button className="btn-outline" style={{ marginLeft: "auto", fontSize: 13, padding: "8px 16px" }}>
                + Add new card
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              background: "var(--bg-warm)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "22px 20px",
            }}
          >
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 18 }}>
              Enter your new card details below.
            </p>
            <label style={labelStyle}>Card number</label>
            <input
              value={cardDraft.number}
              onChange={(event) => setCardDraft({ ...cardDraft, number: event.target.value })}
              placeholder="1234 5678 9012 3456"
              style={inputStyle}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Cardholder name</label>
                <input
                  value={cardDraft.name}
                  onChange={(event) => setCardDraft({ ...cardDraft, name: event.target.value })}
                  placeholder="Full name"
                  style={{ ...inputStyle, marginBottom: 0 }}
                />
              </div>
              <div>
                <label style={labelStyle}>Expiry date</label>
                <input
                  value={cardDraft.expiry}
                  onChange={(event) => setCardDraft({ ...cardDraft, expiry: event.target.value })}
                  placeholder="MM/YY"
                  style={{ ...inputStyle, marginBottom: 0 }}
                />
              </div>
            </div>
            <div className="flex gap-[10px]" style={{ marginTop: 18 }}>
              <button
                className="btn-cta"
                style={{ fontSize: 14, padding: "10px 20px" }}
                onClick={() => {
                  setCard(cardDraft);
                  setEditPayment(false);
                }}
              >
                Save card
              </button>
              <button className="btn-outline" style={{ fontSize: 14, padding: "10px 20px" }} onClick={() => setEditPayment(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
