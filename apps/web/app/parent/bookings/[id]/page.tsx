import Link from "next/link";
import BookingDetailCard from "@/src/components/guardian/bookings/BookingDetailCard";

export const metadata = { title: "Booking Details - KinSittr" };

export default async function ParentBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="h-full flex-1 overflow-y-auto px-4 py-5 md:px-8 md:py-8">
      <div className="mx-auto grid max-w-[760px] gap-5">
        <div>
          <Link href="/parent/bookings" className="text-[13px] text-brand-text underline">
            Back to bookings
          </Link>
          <h1 className="font-display mt-5 mb-1 text-[30px] font-normal">
            Booking details
          </h1>
          <p className="m-0 text-[14px] text-brand-faint">
            Review booking status, payment state, and request details.
          </p>
        </div>
        <BookingDetailCard bookingId={id} />
      </div>
    </div>
  );
}
