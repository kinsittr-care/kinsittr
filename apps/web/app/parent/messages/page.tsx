"use client";

import { useQuery } from "@tanstack/react-query";
import MessagesView from "@/src/components/guardian/dashboard/MessagesView";
import { listParentBookings, parentBookingsQueryKey } from "@/src/utils/bookings";

export default function ParentMessagesPage() {
  const { data } = useQuery({
    queryKey: parentBookingsQueryKey({ page: 1, limit: 1, status: "approved" }),
    queryFn: async () => listParentBookings({ page: 1, limit: 1, status: "approved" }),
  });
  const hasMessages = (data?.data?.total ?? 0) > 0;
  return <MessagesView hasMessages={hasMessages} />;
}
