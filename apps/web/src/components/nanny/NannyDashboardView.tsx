"use client";

import { useQuery } from "@tanstack/react-query";
import type { Booking } from "@/src/types/api/api";
import { getCurrentSession } from "@/src/utils/api/auth";
import { listNannyBookings, nannyBookingsQueryKey } from "@/src/utils/api/bookings";
import { formatNannyDashboardDate } from "@/src/utils/format";
import DashboardStatCards from "./dashboard/DashboardStatCards";
import DashboardUpcoming from "./dashboard/DashboardUpcoming";
import DashboardChecklist from "./dashboard/DashboardChecklist";

const DASHBOARD_BOOKINGS_PARAMS = { page: 1, limit: 100 };
const EMPTY_BOOKINGS: Booking[] = [];

export default function NannyDashboardView() {
  const sessionQuery = useQuery({ queryKey: ["auth-me"], queryFn: getCurrentSession });
  const bookingsQuery = useQuery({
    queryKey: nannyBookingsQueryKey(DASHBOARD_BOOKINGS_PARAMS),
    queryFn: async () => listNannyBookings(DASHBOARD_BOOKINGS_PARAMS),
  });

  const displayName =
    sessionQuery.data?.data?.nanny_profile?.display_name ||
    sessionQuery.data?.data?.user.firstname ||
    "there";
  const session = sessionQuery.data?.data;
  const today = formatNannyDashboardDate(new Date());
  const bookings = bookingsQuery.data?.data?.items ?? EMPTY_BOOKINGS;
  const bookingError =
    bookingsQuery.error instanceof Error ? bookingsQuery.error.message : "Unable to load bookings.";

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-6 pb-16 md:px-6 md:pt-8 lg:px-10 lg:pt-10 lg:pb-20 xl:px-12">
      {/* Greeting */}
      <div className="mb-7 md:mb-8">
        <h1 className="font-display text-[28px] md:text-[36px] font-normal text-nanny-green-dk leading-tight tracking-tight">
          Good morning, {displayName}
        </h1>
        <p className="mt-2 text-sm md:text-[14.5px] text-nanny-ink-faint">{today}</p>
      </div>

      <DashboardStatCards bookings={bookings} isLoading={bookingsQuery.isLoading} />

      {/* Two-panel section: single col on mobile, side-by-side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-4 mt-5">
        <DashboardUpcoming
          bookings={bookings.slice(0, 3)}
          isLoading={bookingsQuery.isLoading}
          isError={bookingsQuery.isError}
          errorMessage={bookingError}
        />
        <DashboardChecklist
          profile={session?.nanny_profile}
          fallbackPhone={session?.user.phone}
          isLoading={sessionQuery.isLoading}
        />
      </div>
    </div>
  );
}
