"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import AdminPageHeader from "./compositions/AdminPageHeader";
import AdminPagination from "./AdminPagination";
import AdminReasonDialog, { type AdminReasonDialogState } from "./AdminReasonDialog";
import AdminParentsTable from "./compositions/AdminParentsTable";
import { SearchIcon } from "./compositions/admin-icons";
import { btnGhostCls } from "./compositions/admin-styles";
import type { ListAdminParentsParams } from "@/src/types/api/admin";
import {
  adminParentsQueryKey,
  listAdminParents,
  suspendAdminParent,
} from "@/src/utils/api/admin/parents";

const PAGE_SIZE = 20;

export default function ParentsModerationView() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [reasonAction, setReasonAction] = useState<AdminReasonDialogState | null>(null);
  const params = useMemo<ListAdminParentsParams>(
    () => ({ page, limit: PAGE_SIZE, search: submittedSearch || undefined }),
    [page, submittedSearch],
  );

  const parentsQuery = useQuery({
    queryKey: adminParentsQueryKey(params),
    queryFn: () => listAdminParents(params),
  });
  const parents = parentsQuery.data?.data?.items ?? [];
  const total = parentsQuery.data?.data?.total ?? 0;

  const invalidateParent = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin", "parents"] });
    await queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] });
    await queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
    await queryClient.invalidateQueries({ queryKey: ["admin", "conversations"] });
    await queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
  };

  const suspendMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      suspendAdminParent(id, { reason }),
    onSuccess: invalidateParent,
  });

  const busyIds = new Set<string>();
  if (suspendMutation.isPending && suspendMutation.variables) busyIds.add(suspendMutation.variables.id);

  const actionError = parentsQuery.error || suspendMutation.error;

  return (
    <>
      <AdminPageHeader
        title="Parents"
        subtitle={`${total} parent accounts found`}
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
          {actionError && (
            <p className="text-admin-red text-[14px] m-0">
              {actionError instanceof Error ? actionError.message : "Unable to update parent moderation."}
            </p>
          )}

          <AdminParentsTable
            busyIds={busyIds}
            isLoading={parentsQuery.isLoading}
            parents={parents}
            selectedParentId={null}
            onSelect={(id) => router.push(`/admin/parents/${id}`)}
            onSuspend={(parent) => {
              setReasonAction({
                title: "Suspend parent",
                description: "Suspend this parent account. A reason is required for the admin audit trail.",
                submitLabel: "Suspend parent",
                tone: "danger",
                onSubmit: (reason) => {
                  suspendMutation.mutate({ id: parent.id, reason });
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
        isSubmitting={suspendMutation.isPending}
        onClose={() => setReasonAction(null)}
      />
    </>
  );
}
