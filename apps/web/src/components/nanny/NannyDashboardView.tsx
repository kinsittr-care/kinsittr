"use client";

import { useQuery } from "@tanstack/react-query";
import type { Booking } from "@/src/types/api/api";
import { getCurrentSession } from "@/src/utils/api/auth";
import { listNannyBookings, nannyBookingsQueryKey } from "@/src/utils/api/bookings";
import { N } from "./tokens";
import DashboardStatCards from "./dashboard/DashboardStatCards";
import DashboardUpcoming from "./dashboard/DashboardUpcoming";
import DashboardChecklist from "./dashboard/DashboardChecklist";

const DASHBOARD_BOOKINGS_PARAMS = { page: 1, limit: 100 };
const EMPTY_BOOKINGS: Booking[] = [];

export default function NannyDashboardView() {
  const sessionQuery = useQuery({
    queryKey: ["auth-me"],
    queryFn: getCurrentSession,
  });
  const bookingsQuery = useQuery({
    queryKey: nannyBookingsQueryKey(DASHBOARD_BOOKINGS_PARAMS),
    queryFn: async () => listNannyBookings(DASHBOARD_BOOKINGS_PARAMS),
  });
  const displayName =
    sessionQuery.data?.data?.nanny_profile?.display_name ||
    sessionQuery.data?.data?.user.firstname ||
    "there";
  const today = new Intl.DateTimeFormat("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());
  const bookings = bookingsQuery.data?.data?.items ?? EMPTY_BOOKINGS;
  const bookingError =
    bookingsQuery.error instanceof Error
      ? bookingsQuery.error.message
      : "Unable to load bookings.";

  return (
    <div style={{ padding: "40px 48px 80px", overflowY: "auto", flex: 1 }}>
      {/* Greeting */}
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontFamily: "DM Serif Display, var(--font-dm-serif), serif",
            fontSize: 36,
            fontWeight: 400,
            color: N.greenDk,
            lineHeight: 1.1,
            letterSpacing: "-.01em",
          }}
        >
          Good morning, {displayName}
        </h1>
        <p style={{ marginTop: 8, fontSize: 14.5, color: N.inkMute }}>{today}</p>
      </div>

      <DashboardStatCards bookings={bookings} isLoading={bookingsQuery.isLoading} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 1fr",
          gap: 18,
          marginTop: 24,
        }}
      >
        <DashboardUpcoming
          bookings={bookings.slice(0, 3)}
          isLoading={bookingsQuery.isLoading}
          isError={bookingsQuery.isError}
          errorMessage={bookingError}
        />
        <DashboardChecklist />
      </div>
    </div>
  );
}
