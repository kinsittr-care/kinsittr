import { Suspense } from "react";
import ParentBookingsView from "../bookings/ParentBookingsView";

export default function BookingHistorySection() {
  return (
    <Suspense fallback={null}>
      <ParentBookingsView compact showViewAllLink />
    </Suspense>
  );
}
