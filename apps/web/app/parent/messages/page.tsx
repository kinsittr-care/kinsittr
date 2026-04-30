"use client";

import MessagesView from "@/src/components/dashboard/MessagesView";
import { useDashboard } from "@/src/components/dashboard/DashboardContext";

export default function ParentMessagesPage() {
  const { hasMessages } = useDashboard();
  return <MessagesView hasMessages={hasMessages} />;
}
