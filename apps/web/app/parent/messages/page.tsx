"use client";

import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import MessagesView from "@/src/components/guardian/dashboard/MessagesView";
import {
  conversationsQueryKey,
  listConversations,
} from "@/src/utils/api/conversations";

export default function ParentMessagesPage() {
  const { data } = useQuery({
    queryKey: conversationsQueryKey({ page: 1, limit: 1 }),
    queryFn: async () => listConversations({ page: 1, limit: 1 }),
  });

  return (
    <Suspense fallback={null}>
      <MessagesView hasMessages={(data?.data?.total ?? 0) > 0} />
    </Suspense>
  );
}
