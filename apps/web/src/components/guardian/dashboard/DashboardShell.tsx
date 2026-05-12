"use client";

import { useRouter } from "next/navigation";
import { DashboardProvider, useDashboard } from "./DashboardContext";
import AppNav from "./AppNav";
import BookingSheet from "../compositions/BookingSheet";
import type { ReactNode } from "react";
import type { Booking } from "@/src/types/api/api";

function ShellInner({ children }: { children: ReactNode }) {
  const { bookingNanny, setBookingNanny } = useDashboard();
  const router = useRouter();

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <AppNav />
      <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>
        {children}
      </div>
      <BookingSheet
        nanny={bookingNanny}
        open={!!bookingNanny}
        onClose={() => setBookingNanny(null)}
        onBooked={(_booking: Booking) => { router.push("/parent/bookings"); }}
      />
    </div>
  );
}

export default function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <DashboardProvider>
      <ShellInner>{children}</ShellInner>
    </DashboardProvider>
  );
}
