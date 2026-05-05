"use client";

import MessagesView from "@/src/components/guardian/dashboard/MessagesView";
import { useDashboard } from "@/src/components/guardian/dashboard/DashboardContext";

export default function ParentMessagesPage() {
  const { hasMessages } = useDashboard();
  return <MessagesView hasMessages={hasMessages} />;
}
