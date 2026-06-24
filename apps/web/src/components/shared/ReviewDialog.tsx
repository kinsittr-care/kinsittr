"use client";

import { useState } from "react";

const labelClass = "mb-[7px] block text-[12px] font-bold uppercase tracking-[0.06em] text-[var(--faint)]";
const inputClass = "w-full rounded-xl border-[1.5px] border-[var(--border)] bg-[var(--bg-warm)] px-[14px] py-3 text-[14px] text-[var(--brand-text)] outline-none";

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
    onSubmit({ rating, comment: trimmedComment });
  };

  const handleClose = () => {
    setRating(5);
    setComment("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-80 grid place-items-center bg-[rgba(24,18,12,0.45)] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-dialog-title"
      aria-describedby="review-dialog-description"
    >
      <div className="w-[min(100%,460px)] rounded-[20px] border border-[rgba(64,48,32,0.12)] bg-[#fffdf8] p-[22px] shadow-[0_24px_80px_rgba(40,30,20,.22)]">
        <div className="mb-[18px]">
          <h2
            id="review-dialog-title"
            className="m-0 font-display text-[25px] font-normal text-brand-text"
          >
            {title}
          </h2>
          <p id="review-dialog-description" className="mt-2 mb-0 text-[14px] leading-[1.6] text-brand-faint">
            {description}
          </p>
        </div>

        <div className="mb-[14px]">
          <label className={labelClass}>Rating</label>
          <select value={rating} onChange={(event) => setRating(Number(event.target.value))} className={inputClass}>
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={value}>
                {value} star{value === 1 ? "" : "s"}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-[14px]">
          <label className={labelClass}>Review</label>
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            maxLength={1000}
            rows={5}
            placeholder="Share a concise, respectful review."
            className={`${inputClass} resize-y leading-normal`}
          />
          <div className="mt-[5px] text-right text-[12px] text-brand-faint">
            {trimmedComment.length}/1000
          </div>
        </div>

        <div className="mb-[14px] rounded-xl border border-[#ead593] bg-[#fff7de] px-3 py-[10px] text-[13px] leading-normal text-[#725f16]">
          This action is irreversible. You cannot edit or delete this review after it is sent.
        </div>

        {error && <p className="mt-0 mb-3 text-[13px] text-[#b24a3f]">{error}</p>}

        <div className="flex gap-[10px]">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex-1 rounded-xl border-0 bg-teal px-[14px] py-3 font-bold text-white disabled:cursor-not-allowed disabled:bg-(--border)"
          >
            {isSubmitting ? "Submitting..." : submitLabel}
          </button>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-xl border-[1.5px] border-(--border) bg-white px-[14px] py-3 text-brand-text disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
