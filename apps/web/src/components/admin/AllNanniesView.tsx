"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import AdminPageHeader from "./compositions/AdminPageHeader";
import AdminPagination from "./AdminPagination";
import AdminReasonDialog, { type AdminReasonDialogState } from "./AdminReasonDialog";
import AdminNanniesTable from "./compositions/AdminNanniesTable";
import { SearchIcon } from "./compositions/admin-icons";
import { btnGhostCls } from "./compositions/admin-styles";
import { cn } from "@/lib/utils";
import type { AdminVerificationStatus, ListAdminNanniesParams } from "@/src/types/api/admin";
import {
  adminNanniesQueryKey,
  listAdminNannies,
  rejectAdminNanny,
  suspendAdminNanny,
  verifyAdminNanny,
} from "@/src/utils/api/admin/nannies";

const PAGE_SIZE = 20;

const statusFilters: Array<{ label: string; value: AdminVerificationStatus | "" }> = [
  { label: "All", value: "" },
  { label: "Verified", value: "verified" },
  { label: "Pending", value: "pending" },
  { label: "Under review", value: "under_review" },
  { label: "Rejected", value: "rejected" },
];

export default function AllNanniesView() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [status, setStatus] = useState<AdminVerificationStatus | "">("");
  const [page, setPage] = useState(1);
  const [reasonAction, setReasonAction] = useState<AdminReasonDialogState | null>(null);
  const params = useMemo<ListAdminNanniesParams>(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: submittedSearch || undefined,
      status: status || undefined,
    }),
    [page, status, submittedSearch],
  );

  const nanniesQuery = useQuery({
    queryKey: adminNanniesQueryKey(params),
    queryFn: () => listAdminNannies(params),
  });
  const nannies = nanniesQuery.data?.data?.items ?? [];
  const total = nanniesQuery.data?.data?.total ?? 0;

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin", "nannies"] });
    await queryClient.invalidateQueries({ queryKey: ["admin", "screening", "nannies"] });
    await queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] });
    await queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
    await queryClient.invalidateQueries({ queryKey: ["admin", "conversations"] });
    await queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
  };

  const verifyMutation = useMutation({ mutationFn: verifyAdminNanny, onSuccess: invalidate });
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectAdminNanny(id, { reason }),
    onSuccess: invalidate,
  });
  const suspendMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      suspendAdminNanny(id, { reason }),
    onSuccess: invalidate,
  });
  const busyIds = new Set<string>();
  if (verifyMutation.isPending && verifyMutation.variables) busyIds.add(verifyMutation.variables);
  if (rejectMutation.isPending && rejectMutation.variables) busyIds.add(rejectMutation.variables.id);
  if (suspendMutation.isPending && suspendMutation.variables) busyIds.add(suspendMutation.variables.id);

  const actionError =
    nanniesQuery.error ||
    verifyMutation.error ||
    rejectMutation.error ||
    suspendMutation.error;

  return (
    <>
      <AdminPageHeader
        title="All Nannies"
        subtitle={`${total} caregivers found`}
        right={
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setPage(1);
              setSubmittedSearch(search.trim());
            }}
            className="flex w-full flex-col gap-[10px] sm:w-auto sm:flex-row sm:items-center"
          >
            <label className="flex min-w-0 items-center gap-2 rounded-[10px] border border-admin-border bg-admin-card px-[14px] py-[9px] text-[13.5px] text-admin-ink-soft sm:min-w-[260px]">
              <span className="flex">
                <SearchIcon />
              </span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, email or city..."
                className="[all:unset] flex-1 text-admin-ink"
              />
            </label>
            <button type="submit" className={btnGhostCls}>Search</button>
          </form>
        }
      />
      <div className="grid gap-[18px] px-4 py-5 md:px-10 md:py-6">
        <div className="flex flex-col gap-[14px]">
          <div className="flex gap-2 flex-wrap">
            {statusFilters.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  setPage(1);
                  setStatus(item.value);
                }}
                className={cn(btnGhostCls, status === item.value && "border-admin-clay text-admin-clay")}
              >
                {item.label}
              </button>
            ))}
          </div>

        {actionError && (
          <p className="text-admin-red text-[14px] m-0">
            {actionError instanceof Error ? actionError.message : "Unable to update nanny moderation."}
          </p>
        )}

        <AdminNanniesTable
          busyIds={busyIds}
          isLoading={nanniesQuery.isLoading}
          nannies={nannies}
          selectedNannyId={null}
          onSelect={(id) => {
            router.push(`/admin/nannies/${id}`);
          }}
          onVerify={(id) => verifyMutation.mutate(id)}
          onReject={(nanny) => {
            setReasonAction({
              title: "Reject nanny",
              description: "Reject this nanny from screening. A reason is required for the admin audit trail.",
              submitLabel: "Reject nanny",
              tone: "danger",
              onSubmit: (reason) => {
                rejectMutation.mutate({ id: nanny.id, reason });
                setReasonAction(null);
              },
            });
          }}
          onSuspend={(nanny) => {
            setReasonAction({
              title: "Suspend nanny",
              description: "Suspend this nanny account. A reason is required for the admin audit trail.",
              submitLabel: "Suspend nanny",
              tone: "danger",
              onSubmit: (reason) => {
                suspendMutation.mutate({ id: nanny.id, reason });
                setReasonAction(null);
              },
            });
          }}
        />
          <AdminPagination page={page} total={total} limit={PAGE_SIZE} onPageChange={setPage} />
        </div>
      </div>
      <AdminReasonDialog
        action={reasonAction}
        isSubmitting={rejectMutation.isPending || suspendMutation.isPending}
        onClose={() => setReasonAction(null)}
      />
    </>
  );
}
