"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminPageHeader from "./compositions/AdminPageHeader";
import AdminPagination from "./AdminPagination";
import AdminReasonDialog, { type AdminReasonDialogState } from "./AdminReasonDialog";
import ScreeningCard, { type ScreeningApplicant, type Steps } from "./screening/ScreeningCard";
import { btnGhostCls } from "./compositions/admin-styles";
import { cn } from "@/lib/utils";
import type { AdminNanny, ListAdminScreeningNanniesParams } from "@/src/types/api/admin";
import { formatLocation, formatShortDate } from "@/src/utils/format";
import {
  adminScreeningNanniesQueryKey,
  listAdminScreeningNannies,
  resetAdminNannyScreening,
  startAdminNannyScreening,
  updateAdminNannyScreeningSteps,
} from "@/src/utils/api/admin/screening";

const statusFilters = [
  { label: "Pending", mobileLabel: "Pending", value: "pending" },
  { label: "Under review", mobileLabel: "Review", value: "under_review" },
  { label: "Rejected", mobileLabel: "Rejected", value: "rejected" },
] as const;

const PAGE_SIZE = 20;

function initialsFor(nanny: AdminNanny) {
  const source = `${nanny.user_firstname[0] ?? ""}${nanny.user_lastname[0] ?? ""}`;
  return source.toUpperCase() || nanny.display_name.slice(0, 2).toUpperCase() || "NA";
}

function mapApplicant(nanny: AdminNanny): ScreeningApplicant {
  return {
    id: nanny.id,
    name: nanny.display_name,
    initials: initialsFor(nanny),
    city: formatLocation(nanny.city, nanny.province),
    submitted: formatShortDate(nanny.created_at),
    waiting: nanny.waiting_days,
    status: nanny.verification_status,
    documents: nanny.documents,
  };
}

function mapSteps(nanny: AdminNanny): Steps {
  return {
    docs: nanny.screening_steps.docs_reviewed,
    refs: nanny.screening_steps.references_checked,
    interview: nanny.screening_steps.interview_done,
  };
}

function stepPayload(key: keyof Steps, value: boolean) {
  if (key === "docs") return { docs_reviewed: value };
  if (key === "refs") return { references_checked: value };
  return { interview_done: value };
}

export default function ScreeningQueueView() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ListAdminScreeningNanniesParams["status"]>("pending");
  const [page, setPage] = useState(1);
  const [reasonAction, setReasonAction] = useState<AdminReasonDialogState | null>(null);
  const params = useMemo<ListAdminScreeningNanniesParams>(
    () => ({ page, limit: PAGE_SIZE, status }),
    [page, status],
  );
  const queryKey = adminScreeningNanniesQueryKey(params);

  const screeningQuery = useQuery({
    queryKey,
    queryFn: () => listAdminScreeningNannies(params),
  });
  const nannies = screeningQuery.data?.data?.items ?? [];
  const total = screeningQuery.data?.data?.total ?? 0;

  const invalidateScreening = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin", "screening", "nannies"] });
    await queryClient.invalidateQueries({ queryKey: ["admin", "nannies"] });
    await queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] });
  };

  const startMutation = useMutation({
    mutationFn: startAdminNannyScreening,
    onSuccess: invalidateScreening,
  });

  const stepMutation = useMutation({
    mutationFn: ({ id, key, next }: { id: string; key: keyof Steps; next: boolean }) =>
      updateAdminNannyScreeningSteps(id, stepPayload(key, next)),
    onSuccess: invalidateScreening,
  });

  const resetMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      resetAdminNannyScreening(id, { reason }),
    onSuccess: invalidateScreening,
  });

  const busyIds = new Set<string>();
  if (startMutation.isPending && startMutation.variables) busyIds.add(startMutation.variables);
  if (stepMutation.isPending && stepMutation.variables) busyIds.add(stepMutation.variables.id);
  if (resetMutation.isPending && resetMutation.variables) busyIds.add(resetMutation.variables.id);

  const toggle = (nanny: AdminNanny, key: keyof Steps) => {
    const current = mapSteps(nanny)[key];
    stepMutation.mutate({ id: nanny.id, key, next: !current });
  };

  const reset = (nanny: AdminNanny) => {
    setReasonAction({
      title: "Reset screening",
      description: "Move this nanny back to pending for re-review. A reason is required for the admin audit trail.",
      submitLabel: "Reset screening",
      tone: "danger",
      onSubmit: (reason) => {
        resetMutation.mutate({ id: nanny.id, reason });
        setReasonAction(null);
      },
    });
  };

  const actionError =
    startMutation.error ||
    stepMutation.error ||
    resetMutation.error ||
    screeningQuery.error;

  return (
    <>
      <AdminPageHeader
        title="Screening Queue"
        subtitle={`${total} nannies in ${status?.replace("_", " ")} · Target: 24–48hr turnaround`}
      />
      <div className="relative z-10 flex w-full shrink-0 flex-wrap gap-2 border-b border-admin-divider bg-admin-bg px-4 py-3 md:px-10">
        {statusFilters.map((item) => (
          <button
            key={item.value}
            onClick={() => {
              setPage(1);
              setStatus(item.value);
            }}
            className={cn(btnGhostCls, "shrink-0", status === item.value && "border-admin-clay text-admin-clay")}
          >
            <span className="sm:hidden">{item.mobileLabel}</span>
            <span className="hidden sm:inline">{item.label}</span>
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-4 px-4 py-5 md:px-10 md:py-6 max-w-[960px]">
        {actionError && (
          <p className="text-[#b34b39] text-[14px] m-0">
            {actionError instanceof Error ? actionError.message : "Unable to update screening queue."}
          </p>
        )}
        {screeningQuery.isLoading ? (
          <p className="text-admin-ink-soft m-0">Loading screening queue...</p>
        ) : nannies.length === 0 ? (
          <p className="text-admin-ink-soft m-0">No nannies found for this status.</p>
        ) : (
          nannies.map((nanny) => (
            <ScreeningCard
              key={nanny.id}
              applicant={mapApplicant(nanny)}
              isBusy={busyIds.has(nanny.id)}
              onReset={() => reset(nanny)}
              onStart={() => startMutation.mutate(nanny.id)}
              steps={mapSteps(nanny)}
              onToggle={(key) => toggle(nanny, key)}
            />
          ))
        )}
        <AdminPagination page={page} total={total} limit={PAGE_SIZE} onPageChange={setPage} />
      </div>
      <AdminReasonDialog
        action={reasonAction}
        isSubmitting={resetMutation.isPending}
        onClose={() => setReasonAction(null)}
      />
    </>
  );
}
