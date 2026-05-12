import { useState } from "react";
import { Nanny } from "./types";
import Avatar from "./Avatar";
import { ApiRequestError } from "@/src/utils/api";
import { createBooking } from "@/src/utils/bookings";
import type { Booking } from "@/src/types/api/api";

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
  
  function StarRating({ rating, reviews }: { rating: number; reviews: number }) {
    return (
      <span className="flex items-center gap-1">
        <span style={{ color: "var(--gold)", fontSize: 13 }}>
          {"★".repeat(Math.floor(rating))}
        </span>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{rating}</span>
        <span style={{ fontSize: 12, color: "var(--faint)" }}>({reviews})</span>
      </span>
    );
  }
  
  interface FormProps {
    nanny: Nanny;
    onClose: () => void;
    onBooked: (booking: Booking) => void;
  }
  
export default function BookingFormContent({ nanny, onClose, onBooked }: FormProps) {
    const [step, setStep] = useState(1);
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("08:00");
    const [hours, setHours] = useState(4);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
    const total = nanny.rate * hours;

    const getTimezoneOffsetMinutes = () => {
      const [year, month, day] = date.split("-").map(Number);
      const [hour, minute] = startTime.split(":").map(Number);
      return new Date(year, month - 1, day, hour, minute, 0, 0).getTimezoneOffset();
    };
  
    if (step === 2) {
      return (
        <div className="p-6 text-center">
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
          <h2 className="font-display" style={{ fontWeight: 400, fontSize: 26, marginBottom: 10 }}>
            Request sent!
          </h2>
          <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.7, maxWidth: 320, margin: "0 auto 28px" }}>
            Your booking request has been sent to <strong>{nanny.name}</strong>.
            Once they approve, messaging will be unlocked.
          </p>
          {createdBooking && (
            <div
              style={{
                textAlign: "left",
                background: "var(--bg-warm)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "14px 16px",
                margin: "0 auto 24px",
                maxWidth: 320,
                fontSize: 13,
                color: "var(--brand-text)",
                lineHeight: 1.7,
              }}
            >
              <div><strong>Date:</strong> {createdBooking.date}</div>
              <div><strong>Start:</strong> {createdBooking.start_time}</div>
              <div><strong>Duration:</strong> {createdBooking.duration}h</div>
              <div><strong>Total:</strong> ${createdBooking.total_amount}</div>
            </div>
          )}
          <button
            onClick={() => {
              if (createdBooking) {
                onBooked(createdBooking);
              }
              onClose();
            }}
            style={{
              width: "100%", padding: 13, fontSize: 15, borderRadius: 10,
              background: "var(--teal)", color: "#fff", border: "none",
              cursor: "pointer", fontFamily: "inherit", fontWeight: 500,
            }}
          >
            Done
          </button>
        </div>
      );
    }
  
    const handleSubmit = async () => {
      if (!date || submitting) return;

      setSubmitting(true);
      setError(null);

      try {
        const response = await createBooking({
          nanny_id: nanny.id,
          date,
          start_time: startTime,
          timezone_offset_minutes: getTimezoneOffsetMinutes(),
          duration: hours,
        });
        if (!response.data) {
          throw new ApiRequestError("Booking request succeeded, but no booking details were returned.");
        }

        setCreatedBooking(response.data);
        setStep(2);
      } catch (err) {
        setError(
          err instanceof ApiRequestError
            ? err.message
            : "Unable to send booking request right now.",
        );
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="p-6">
        <div className="flex items-center gap-4 pb-5 mb-5" style={{ borderBottom: "1px solid var(--border)" }}>
          <Avatar initials={nanny.initials} size={52} />
          <div>
            <h2 className="font-display" style={{ fontWeight: 400, fontSize: 22, marginBottom: 3 }}>
              {nanny.name}
            </h2>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>
              {nanny.city} · ${nanny.rate}/hr
            </div>
            <StarRating rating={nanny.rating} reviews={nanny.reviews} />
          </div>
        </div>
  
        <div
          style={{
            background: "#fffbe8", border: "1px solid #e8d88c",
            borderRadius: 10, padding: "10px 14px", marginBottom: 20,
            fontSize: 13, color: "#7a6b20",
          }}
        >
          ⏳ Your request will be sent for nanny approval before messaging unlocks.
        </div>
  
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
        </div>
  
        <div className="grid grid-cols-2 gap-3 mb-0">
          <div>
            <label style={labelStyle}>Start time</label>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={inputStyle} />
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
  
        <div
          className="flex justify-between items-center mt-5 mb-6"
          style={{ background: "var(--bg-warm)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}
        >
          <div style={{ fontSize: 14, color: "var(--muted)" }}>{hours}h × ${nanny.rate}/hr</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "var(--teal)" }}>${total}</div>
        </div>

        {error && (
          <p style={{ fontSize: 13, color: "#b24a3f", marginBottom: 14 }}>
            {error}
          </p>
        )}
  
        <div className="flex gap-[10px]">
          <button
            onClick={() => void handleSubmit()}
            disabled={!date || submitting}
            style={{
              flex: 1, padding: 13, fontSize: 15, borderRadius: 10, border: "none",
              background: date && !submitting ? "var(--teal)" : "var(--border)",
              color: "#fff", cursor: date && !submitting ? "pointer" : "not-allowed",
              fontFamily: "inherit", fontWeight: 500,
            }}
          >
            {submitting ? "Sending..." : "Send booking request"}
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
      </div>
    );
}
