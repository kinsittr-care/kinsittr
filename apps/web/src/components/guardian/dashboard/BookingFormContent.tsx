import { cn } from "@/lib/utils";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Nanny } from "./types";
import Avatar from "./Avatar";
import { ApiRequestError } from "@/src/utils/api/api";
import { createBooking } from "@/src/utils/api/bookings";
import { formatCurrency, formatLocationPart } from "@/src/utils/format";
import {
  listPublicNannyReviews,
  publicNannyReviewsQueryKey,
} from "@/src/utils/api/reviews";
import type { Booking } from "@/src/types/api/api";

const inputCls = "w-full border-[1.5px] border-brand-border rounded-[9px] px-[14px] py-[11px] text-[14px] outline-none bg-[var(--bg-warm)] text-[var(--brand-text)] [font-family:inherit]";
const labelCls = "text-[12px] font-medium text-[var(--faint)] block mb-[6px] uppercase tracking-[0.06em]";

function StarRating({ rating, reviews }: { rating: number; reviews: number }) {
  if (reviews === 0) {
    return null;
  }

  return (
    <span className="flex items-center gap-1">
      <span className="text-gold text-[13px]">
        {"★".repeat(Math.floor(rating))}
      </span>
      <span className="text-[13px] font-semibold">{rating.toFixed(1)}</span>
      <span className="text-[12px] text-brand-faint">({reviews})</span>
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
    const reviewsParams = { page: 1, limit: 3 };
    const reviewsQuery = useQuery({
      queryKey: publicNannyReviewsQueryKey(nanny.id, reviewsParams),
      queryFn: async () => listPublicNannyReviews(nanny.id, reviewsParams),
    });

    const getTimezoneOffsetMinutes = () => {
      const [year, month, day] = date.split("-").map(Number);
      const [hour, minute] = startTime.split(":").map(Number);
      return new Date(year, month - 1, day, hour, minute, 0, 0).getTimezoneOffset();
    };
  
    if (step === 2) {
      return (
        <div className="p-6 text-center">
          <div className="w-[72px] h-[72px] rounded-full bg-teal-lt flex items-center justify-center text-[36px] mx-auto mb-5">
            ✅
          </div>
          <h2 className="font-display font-normal text-[26px] mb-[10px]">
            Request sent!
          </h2>
          <p className="text-brand-faint text-[15px] leading-[1.7] max-w-[320px] mx-auto mb-7">
            Your booking request has been sent to <strong>{nanny.name}</strong>.
            Once they approve, messaging will be unlocked.
          </p>
          {createdBooking && (
            <div className="bg-brand-warm border border-brand-border rounded-xl px-4 py-[14px] mx-auto mb-6 max-w-[320px] text-[13px] text-brand-text leading-[1.7] text-left">
              <div><strong>Date:</strong> {createdBooking.date}</div>
              <div><strong>Start:</strong> {createdBooking.start_time}</div>
              <div><strong>Duration:</strong> {createdBooking.duration}h</div>
              <div><strong>Total:</strong> {formatCurrency(createdBooking.total_amount)}</div>
            </div>
          )}
          <button
            onClick={() => {
              if (createdBooking) {
                onBooked(createdBooking);
              }
              onClose();
            }}
            className="w-full p-[13px] text-[15px] rounded-[10px] bg-teal text-white border-0 cursor-pointer font-[inherit] font-medium"
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
        <div className="flex items-center gap-4 pb-5 mb-5 border-b border-brand-border">
          <Avatar initials={nanny.initials} size={52} />
          <div>
            <h2 className="font-display font-normal text-[22px] mb-[3px]">
              {nanny.name}
            </h2>
            <div className="text-[13px] text-brand-faint">
              {formatLocationPart(nanny.city)} · ${nanny.rate}/hr
            </div>
            <StarRating rating={nanny.rating} reviews={nanny.reviews} />
          </div>
        </div>

        <div className="bg-[#fffbe8] border border-[#e8d88c] rounded-[10px] px-[14px] py-[10px] mb-5 text-[13px] text-[#7a6b20]">
          ⏳ Your request will be sent for nanny approval before messaging unlocks.
        </div>

        {reviewsQuery.data?.data?.items.length ? (
          <div className="mb-5">
            <div className={labelCls}>Recent reviews</div>
            <div className="grid gap-[10px]">
              {reviewsQuery.data.data.items.map((review) => (
                <div key={review.id} className="border border-brand-border rounded-xl bg-brand-warm px-3 py-[10px]">
                  <div className="text-gold text-[12px] mb-1">
                    {"★".repeat(review.rating)}
                  </div>
                  <p className="m-0 text-[13px] text-brand-text leading-normal">
                    {review.comment}
                  </p>
                  <div className="mt-[6px] text-[12px] text-brand-faint">
                    {review.parent_display_name || "KinSittr parent"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mb-4">
          <label className={labelCls}>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-0">
          <div>
            <label className={labelCls}>Start time</label>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Duration</label>
            <select
              value={hours}
              onChange={(e) => setHours(+e.target.value)}
              className={cn(inputCls, "cursor-pointer appearance-none")}
            >
              {[2, 3, 4, 5, 6, 7, 8, 10, 12].map((h) => (
                <option key={h} value={h}>{h} hours</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center mt-5 mb-6 bg-brand-warm border border-brand-border rounded-xl p-4">
          <div className="text-[14px] text-brand-faint">{hours}h × ${nanny.rate}/hr</div>
          <div className="text-[24px] font-bold text-teal">${total}</div>
        </div>

        {error && (
          <p className="text-[13px] text-[#b24a3f] mb-[14px]">
            {error}
          </p>
        )}

        <div className="flex gap-[10px]">
          <button
            onClick={() => void handleSubmit()}
            disabled={!date || submitting}
            className={cn(
              "flex-1 p-[13px] text-[15px] rounded-[10px] border-0 text-white font-[inherit] font-medium",
              date && !submitting ? "bg-teal cursor-pointer" : "bg-brand-border cursor-not-allowed",
            )}
          >
            {submitting ? "Sending..." : "Send booking request"}
          </button>
          <button
            onClick={onClose}
            className="px-[18px] py-[13px] text-[15px] rounded-[10px] bg-white text-brand-text border-[1.5px] border-brand-border cursor-pointer font-[inherit]"
          >
            Cancel
          </button>
        </div>
      </div>
    );
}
