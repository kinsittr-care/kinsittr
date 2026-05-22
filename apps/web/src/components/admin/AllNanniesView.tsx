"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { A } from "./tokens";
import AdminPageHeader from "./compositions/AdminPageHeader";
import AdminNannyDetailPanel from "./AdminNannyDetailPanel";
import AdminPagination from "./AdminPagination";
import AdminReasonDialog, { type AdminReasonDialogState } from "./AdminReasonDialog";
import AdminNanniesTable from "./compositions/AdminNanniesTable";
import { SearchIcon } from "./compositions/admin-icons";
import { btnGhost } from "./compositions/admin-styles";
import type { AdminVerificationStatus, ListAdminAuditActionsParams, ListAdminNanniesParams } from "@/src/types/api/admin";
import {
  adminNannyActionsQueryKey,
  adminNannyQueryKey,
  adminNanniesQueryKey,
  getAdminNanny,
  listAdminNannyActions,
  listAdminNannies,
  reactivateAdminNanny,
  rejectAdminNanny,
  suspendAdminNanny,
  verifyAdminNanny,
} from "@/src/utils/api/admin/nannies";

const PAGE_SIZE = 20;
const ACTION_PAGE_SIZE = 10;

const statusFilters: Array<{ label: string; value: AdminVerificationStatus | "" }> = [
  { label: "All", value: "" },
  { label: "Verified", value: "verified" },
  { label: "Pending", value: "pending" },
  { label: "Under review", value: "under_review" },
  { label: "Rejected", value: "rejected" },
];

export default function AllNanniesView() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [status, setStatus] = useState<AdminVerificationStatus | "">("");
  const [page, setPage] = useState(1);
  const [actionPage, setActionPage] = useState(1);
  const [selectedNannyId, setSelectedNannyId] = useState<string | null>(null);
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
  const detailQuery = useQuery({
    queryKey: selectedNannyId ? adminNannyQueryKey(selectedNannyId) : ["admin", "nanny", "none"],
    queryFn: () => getAdminNanny(selectedNannyId as string),
    enabled: Boolean(selectedNannyId),
  });
  const selectedNannyDetail = detailQuery.data?.data ?? null;
  const actionParams = useMemo<ListAdminAuditActionsParams>(
    () => ({ page: actionPage, limit: ACTION_PAGE_SIZE }),
    [actionPage],
  );
  const actionsQuery = useQuery({
    queryKey: selectedNannyId
      ? adminNannyActionsQueryKey(selectedNannyId, actionParams)
      : ["admin", "nanny-actions", "none"],
    queryFn: () => listAdminNannyActions(selectedNannyId as string, actionParams),
    enabled: Boolean(selectedNannyId),
  });
  const actions = actionsQuery.data?.data?.items ?? [];
  const actionTotal = actionsQuery.data?.data?.total ?? 0;

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin", "nannies"] });
    await queryClient.invalidateQueries({ queryKey: ["admin", "screening", "nannies"] });
    await queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] });
    await queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
    await queryClient.invalidateQueries({ queryKey: ["admin", "conversations"] });
    await queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
    if (selectedNannyId) {
      await queryClient.invalidateQueries({ queryKey: adminNannyQueryKey(selectedNannyId) });
      await queryClient.invalidateQueries({ queryKey: ["admin", "nanny-actions", selectedNannyId] });
    }
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
  const reactivateMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      reactivateAdminNanny(id, { reason }),
    onSuccess: invalidate,
  });

  const busyIds = new Set<string>();
  if (verifyMutation.isPending && verifyMutation.variables) busyIds.add(verifyMutation.variables);
  if (rejectMutation.isPending && rejectMutation.variables) busyIds.add(rejectMutation.variables.id);
  if (suspendMutation.isPending && suspendMutation.variables) busyIds.add(suspendMutation.variables.id);
  if (reactivateMutation.isPending && reactivateMutation.variables) busyIds.add(reactivateMutation.variables.id);

  const actionError =
    nanniesQuery.error ||
    detailQuery.error ||
    actionsQuery.error ||
    verifyMutation.error ||
    rejectMutation.error ||
    suspendMutation.error ||
    reactivateMutation.error;

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
                  setSelectedNannyId(null);
                  setActionPage(1);
            }}
            style={{ display: "flex", gap: 10, alignItems: "center" }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "9px 14px",
                background: A.card,
                border: `1px solid ${A.border}`,
                borderRadius: 10,
                color: A.inkSoft,
                fontSize: 13.5,
                minWidth: 260,
              }}
            >
              <span style={{ display: "flex" }}>
                <SearchIcon />
              </span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, email or city..."
                style={{ all: "unset", flex: 1, color: A.ink }}
              />
            </label>
            <button type="submit" style={btnGhost}>Search</button>
          </form>
        }
      />
      <div style={{ padding: "24px 40px 40px", display: "grid", gridTemplateColumns: selectedNannyId ? "1fr 380px" : "1fr", gap: 18 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {statusFilters.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  setPage(1);
                  setStatus(item.value);
                  setSelectedNannyId(null);
                  setActionPage(1);
                }}
                style={{
                  ...btnGhost,
                  borderColor: status === item.value ? A.clay : A.border,
                  color: status === item.value ? A.clay : A.inkMid,
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

        {actionError && (
          <p style={{ color: A.red, fontSize: 14, margin: 0 }}>
            {actionError instanceof Error ? actionError.message : "Unable to update nanny moderation."}
          </p>
        )}

        <AdminNanniesTable
          busyIds={busyIds}
          isLoading={nanniesQuery.isLoading}
          nannies={nannies}
          selectedNannyId={selectedNannyId}
          onSelect={(id) => {
            setSelectedNannyId(id);
            setActionPage(1);
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
        {selectedNannyId && (
          <AdminNannyDetailPanel
            actions={actions}
            actionPage={actionPage}
            actionTotal={actionTotal}
            detail={selectedNannyDetail}
            isLoading={detailQuery.isLoading}
            isLoadingActions={actionsQuery.isLoading}
            onActionPageChange={setActionPage}
            onReactivate={() => {
              if (!selectedNannyId) return;
              setReasonAction({
                title: "Reactivate nanny",
                description: "Restore this nanny account. A reason is required for the admin audit trail.",
                submitLabel: "Reactivate nanny",
                tone: "approve",
                onSubmit: (reason) => {
                  reactivateMutation.mutate({ id: selectedNannyId, reason });
                  setReasonAction(null);
                },
              });
            }}
          />
        )}
      </div>
      <AdminReasonDialog
        action={reasonAction}
        isSubmitting={rejectMutation.isPending || suspendMutation.isPending || reactivateMutation.isPending}
        onClose={() => setReasonAction(null)}
      />
    </>
  );
}
