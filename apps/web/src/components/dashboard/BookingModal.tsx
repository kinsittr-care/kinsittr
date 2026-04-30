"use client";

import { useState } from "react";
import type { Nanny } from "./types";
import Avatar from "./Avatar";

interface BookingModalProps {
  nanny: Nanny;
  onClose: () => void;
  onBooked: () => void;
}

function StarRating({ rating, reviews }: { rating: number; reviews: number }) {
  const full = Math.floor(rating);
  return (
    <span className="flex items-center gap-1">
      <span style={{ color: "var(--gold)", fontSize: 13 }}>{"★".repeat(full)}</span>
      <span style={{ fontSize: 13, fontWeight: 600 }}>{rating}</span>
      <span style={{ fontSize: 12, color: "var(--faint)" }}>({reviews})</span>
    </span>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", border: "1.5px solid var(--border)", borderRadius: 9,
  padding: "11px 14px", fontSize: 14, outline: "none",
  background: "var(--bg-warm)", color: "var(--brand-text)",
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 500, color: "var(--muted)",
  display: "block", marginBottom: 6,
  textTransform: "uppercase", letterSpacing: "0.06em",
};

export default function BookingModal({ nanny, onClose, onBooked }: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [hours, setHours] = useState(4);
  const total = nanny.rate * hours;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(20,15,10,.5)", backdropFilter: "blur(3px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "#fff", borderRadius: 20, padding: 32, width: 460,
          boxShadow: "0 12px 48px rgba(40,30,20,.14)",
        }}
      >
        {step === 1 ? (
          <>
            {/* Header */}
            <div
              className="flex items-center gap-4 mb-6 pb-5"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <Avatar initials={nanny.initials} size={52} />
              <div>
                <h2
                  className="font-display"
                  style={{ fontWeight: 400, fontSize: 22, marginBottom: 3 }}
                >
                  {nanny.name}
                </h2>
                <div style={{ fontSize: 13, color: "var(--muted)" }}>
                  {nanny.city} · ${nanny.rate}/hr
                </div>
                <StarRating rating={nanny.rating} reviews={nanny.reviews} />
              </div>
              <button
                onClick={onClose}
                style={{
                  marginLeft: "auto", background: "none", border: "none",
                  cursor: "pointer", color: "var(--faint)", fontSize: 24, lineHeight: 1,
                }}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Notice */}
            <div
              style={{
                background: "#fffbe8", border: "1px solid #e8d88c",
                borderRadius: 10, padding: "10px 14px", marginBottom: 20,
                fontSize: 13, color: "#7a6b20",
              }}
            >
              ⏳ Your request will be sent for nanny approval before messaging unlocks.
            </div>

            {/* Date */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* Time + Duration */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={labelStyle}>Start time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Duration</label>
                <select
                  value={hours}
                  onChange={(e) => setHours(+e.target.value)}
                  style={{ ...inputStyle, cursor: "pointer", appearance: "none" }}
                >
                  {[2, 3, 4, 5, 6, 7, 8, 10, 12].map((h) => (
                    <option key={h} value={h}>{h} hours</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Total */}
            <div
              className="flex justify-between items-center mt-5 mb-6"
              style={{
                background: "var(--bg-warm)", border: "1px solid var(--border)",
                borderRadius: 12, padding: 16,
              }}
            >
              <div style={{ fontSize: 14, color: "var(--muted)" }}>
                {hours}h × ${nanny.rate}/hr
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "var(--teal)" }}>
                ${total}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-[10px]">
              <button
                onClick={() => setStep(2)}
                disabled={!date}
                style={{
                  flex: 1, padding: 13, fontSize: 15, borderRadius: 10, border: "none",
                  background: date ? "var(--teal)" : "var(--border)",
                  color: "#fff", cursor: date ? "pointer" : "not-allowed",
                  fontFamily: "inherit", fontWeight: 500,
                  boxShadow: date ? "0 2px 8px rgba(58,90,90,.32)" : "none",
                  transition: "all .15s",
                }}
              >
                Send booking request
              </button>
              <button
                onClick={onClose}
                style={{
                  padding: "13px 18px", fontSize: 15, borderRadius: 10,
                  background: "#fff", color: "var(--brand-text)",
                  border: "1.5px solid var(--border)", cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "10px 0 4px" }}>
            <div
              style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "var(--teal-lt)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 36, margin: "0 auto 20px",
              }}
            >
              ✅
            </div>
            <h2
              className="font-display"
              style={{ fontWeight: 400, fontSize: 26, marginBottom: 10 }}
            >
              Request sent!
            </h2>
            <p
              style={{
                color: "var(--muted)", fontSize: 15, lineHeight: 1.7,
                maxWidth: 320, margin: "0 auto 28px",
              }}
            >
              Your booking request has been sent to <strong>{nanny.name}</strong>.
              Once they approve, messaging will be unlocked.
            </p>
            <button
              onClick={() => { onBooked(); onClose(); }}
              style={{
                width: "100%", padding: 13, fontSize: 15, borderRadius: 10,
                background: "var(--teal)", color: "#fff", border: "none",
                cursor: "pointer", fontFamily: "inherit", fontWeight: 500,
                boxShadow: "0 2px 8px rgba(58,90,90,.32)",
              }}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
