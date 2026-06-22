"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import AdminPageHeader from "./compositions/AdminPageHeader";
import AdminConversationList from "./compositions/AdminConversationList";
import { btnGhostCls } from "./compositions/admin-styles";
import { cn } from "@/lib/utils";
import type { ListAdminConversationsParams } from "@/src/types/api/admin";
import type { BookingStatus } from "@/src/types/api/api";
import {
  adminConversationsQueryKey,
  listAdminConversations,
} from "@/src/utils/api/admin/conversations";

const statusFilters: Array<{ label: string; value: BookingStatus | "" }> = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Declined", value: "declined" },
];

const PAGE_SIZE = 20;

export default function ConversationsModerationView() {
  const router = useRouter();
  const [status, setStatus] = useState<BookingStatus | "">("");
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [page, setPage] = useState(1);

  const params = useMemo<ListAdminConversationsParams>(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: submittedSearch || undefined,
      status: status || undefined,
    }),
    [page, status, submittedSearch],
  );

  const conversationsQuery = useQuery({
    queryKey: adminConversationsQueryKey(params),
    queryFn: () => listAdminConversations(params),
  });
  const conversations = conversationsQuery.data?.data?.items ?? [];
  const total = conversationsQuery.data?.data?.total ?? 0;
  const actionError = conversationsQuery.error;
  const updateStatus = (nextStatus: BookingStatus | "") => {
    setPage(1);
    setStatus(nextStatus);
  };

  return (
    <>
      <AdminPageHeader
        title="Conversations"
        subtitle={`${total} conversations found`}
        right={
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setPage(1);
              setSubmittedSearch(search.trim());
            }}
            className="flex w-full max-w-[760px] flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end"
          >
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search conversations..."
              className="min-w-0 rounded-[10px] border border-admin-border bg-admin-card px-[14px] py-[10px] text-admin-ink sm:min-w-[240px]"
            />
            <button type="submit" className={btnGhostCls}>Search</button>
            <select
              value={status}
              onChange={(event) => updateStatus(event.target.value as BookingStatus | "")}
              className="rounded-[10px] border border-admin-border bg-admin-card px-[14px] py-[10px] text-admin-ink lg:hidden"
              aria-label="Conversation booking status"
            >
              {statusFilters.map((item) => (
                <option key={item.label} value={item.value}>{item.label}</option>
              ))}
            </select>
            <div className="hidden flex-wrap justify-end gap-2 lg:flex">
              {statusFilters.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => updateStatus(item.value)}
                  className={cn(btnGhostCls, status === item.value && "border-admin-clay text-admin-clay")}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </form>
        }
      />

      <div className="grid gap-[18px] px-4 py-5 md:px-10 md:py-6">
        <div className="flex flex-col gap-3">
          {actionError && (
            <p className="text-admin-red text-[14px] m-0">
              {actionError instanceof Error ? actionError.message : "Unable to update conversation moderation."}
            </p>
          )}

          <AdminConversationList
            conversations={conversations}
            isLoading={conversationsQuery.isLoading}
            page={page}
            selectedConversationId={null}
            total={total}
            limit={PAGE_SIZE}
            onPageChange={setPage}
            onSelect={(id) => router.push(`/admin/conversations/${id}`)}
          />
        </div>
      </div>
    </>
  );
}
