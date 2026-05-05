"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { Nanny } from "./types";

interface DashboardContextValue {
  hasMessages: boolean;
  setHasMessages: (v: boolean) => void;
  bookingNanny: Nanny | null;
  setBookingNanny: (n: Nanny | null) => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [hasMessages, setHasMessages] = useState(false);
  const [bookingNanny, setBookingNanny] = useState<Nanny | null>(null);

  return (
    <DashboardContext.Provider value={{ hasMessages, setHasMessages, bookingNanny, setBookingNanny }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}
