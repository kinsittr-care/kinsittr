"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { Nanny } from "./types";

interface DashboardContextValue {
  bookingNanny: Nanny | null;
  setBookingNanny: (n: Nanny | null) => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [bookingNanny, setBookingNanny] = useState<Nanny | null>(null);

  return (
    <DashboardContext.Provider value={{ bookingNanny, setBookingNanny }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}
