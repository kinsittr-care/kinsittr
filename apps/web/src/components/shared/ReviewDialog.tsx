"use client";

import { useState } from "react";

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 80,
  background: "rgba(24, 18, 12, 0.45)",
  display: "grid",
  placeItems: "center",
  padding: 16,
};

const cardStyle: React.CSSProperties = {
  width: "min(100%, 460px)",
  borderRadius: 20,
  background: "#fffdf8",
  border: "1px solid rgba(64, 48, 32, 0.12)",
  boxShadow: "0 24px 80px rgba(40,30,20,.22)",
  padding: 22,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 7,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "var(--muted, #7b7168)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 12,
  border: "1.5px solid var(--border, #e7ddd2)",
  background: "var(--bg-warm, #fbf6ee)",
  color: "var(--brand-text, #33271f)",
  padding: "12px 14px",
  fontFamily: "inherit",
  fontSize: 14,
  outline: "none",
};

interface ReviewDialogProps {
  open: boolean;
  title: string;
  description: string;
  submitLabel?: string;
  isSubmitting?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (payload: { rating: number; comment: string }) => void;
}

export default function ReviewDialog({
  open,
  title,
  description,
  submitLabel = "Submit review",
  isSubmitting = false,
  error,
  onClose,
  onSubmit,
}: ReviewDialogProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  if (!open) return null;

  const trimmedComment = comment.trim();
  const canSubmit = rating >= 1 && rating <= 5 && trimmedComment.length > 0 && !isSubmitting;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const confirmed = window.confirm(
      "Reviews cannot be edited or deleted after submission. Submit this review?",
    );
    if (!confirmed) return;
    onSubmit({ rating, comment: trimmedComment });
  };

  const handleClose = () => {
    setRating(5);
    setComment("");
    onClose();
  };

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true" aria-labelledby="review-dialog-title">
      <div style={cardStyle}>
        <div style={{ marginBottom: 18 }}>
          <h2
            id="review-dialog-title"
            className="font-display"
            style={{ margin: 0, fontSize: 25, fontWeight: 400, color: "var(--brand-text, #33271f)" }}
          >
            {title}
          </h2>
          <p style={{ margin: "8px 0 0", color: "var(--muted, #7b7168)", fontSize: 14, lineHeight: 1.6 }}>
            {description}
          </p>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Rating</label>
          <select value={rating} onChange={(event) => setRating(Number(event.target.value))} style={inputStyle}>
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={value}>
                {value} star{value === 1 ? "" : "s"}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Review</label>
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            maxLength={1000}
            rows={5}
            placeholder="Share a concise, respectful review."
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
          />
          <div style={{ textAlign: "right", marginTop: 5, fontSize: 12, color: "var(--faint, #9b9188)" }}>
            {trimmedComment.length}/1000
          </div>
        </div>

        <div
          style={{
            borderRadius: 12,
            background: "#fff7de",
            border: "1px solid #ead593",
            color: "#725f16",
            padding: "10px 12px",
            fontSize: 13,
            lineHeight: 1.5,
            marginBottom: 14,
          }}
        >
          This action is irreversible. You cannot edit or delete this review after it is sent.
        </div>

        {error && <p style={{ color: "#b24a3f", fontSize: 13, margin: "0 0 12px" }}>{error}</p>}

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              flex: 1,
              border: "none",
              borderRadius: 12,
              padding: "12px 14px",
              background: canSubmit ? "var(--teal, #3a6f6f)" : "var(--border, #e7ddd2)",
              color: "#fff",
              fontWeight: 700,
              cursor: canSubmit ? "pointer" : "not-allowed",
              fontFamily: "inherit",
            }}
          >
            {isSubmitting ? "Submitting..." : submitLabel}
          </button>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            style={{
              borderRadius: 12,
              padding: "12px 14px",
              background: "#fff",
              border: "1.5px solid var(--border, #e7ddd2)",
              color: "var(--brand-text, #33271f)",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
