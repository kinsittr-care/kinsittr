import { Suspense } from "react";
import ParentBookingsView from "@/src/components/guardian/bookings/ParentBookingsView";

export const metadata = { title: "Bookings — KinSittr" };

export default function ParentBookingsPage() {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px 32px" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 className="font-display" style={{ fontWeight: 400, fontSize: 30, marginBottom: 4 }}>
            Bookings
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>
            Review your booking requests, track status updates, and manage pending requests.
          </p>
        </div>
        <Suspense fallback={<p style={{ color: "var(--muted)", fontSize: 14 }}>Loading bookings…</p>}>
          <ParentBookingsView />
        </Suspense>
      </div>
    </div>
  );
}
