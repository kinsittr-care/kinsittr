"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { DashboardProvider, useDashboard } from "./DashboardContext";
import AppNav from "./AppNav";
import BookingSheet from "../compositions/BookingSheet";
import type { ReactNode } from "react";
import type { Booking } from "@/src/types/api/api";
import { parentBookingQueryKey } from "@/src/utils/api/bookings";
import ProfileCompletionBanner from "../../shared/ProfileCompletionBanner";
import AuthGuard from "../../auth/AuthGuard";

function ShellInner({ children }: { children: ReactNode }) {
  const { bookingNanny, setBookingNanny } = useDashboard();
  const router = useRouter();
  const queryClient = useQueryClient();

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <AppNav />
      <ProfileCompletionBanner role="parent" />
      <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>
        {children}
      </div>
      <BookingSheet
        nanny={bookingNanny}
        open={!!bookingNanny}
        onClose={() => setBookingNanny(null)}
        onBooked={async (booking: Booking) => {
          await queryClient.invalidateQueries({ queryKey: ["parent-bookings"] });
          await queryClient.invalidateQueries({ queryKey: parentBookingQueryKey(booking.id) });
          router.push("/parent/bookings");
        }}
      />
    </div>
  );
}

export default function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <AuthGuard role="parent">
      <DashboardProvider>
        <ShellInner>{children}</ShellInner>
      </DashboardProvider>
    </AuthGuard>
  );
}
