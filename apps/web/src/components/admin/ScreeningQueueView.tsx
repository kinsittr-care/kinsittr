"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminPageHeader from "./AdminPageHeader";
import ScreeningCard, { type ScreeningApplicant, type Steps } from "./screening/ScreeningCard";
import { btnGhost } from "./admin-styles";
import type { AdminNanny, ListAdminScreeningNanniesParams } from "@/src/types/api/admin";
import {
  adminScreeningNanniesQueryKey,
  listAdminScreeningNannies,
  resetAdminNannyScreening,
  startAdminNannyScreening,
  updateAdminNannyScreeningSteps,
} from "@/src/utils/api/admin/screening";

const statusFilters = [
  { label: "Pending", value: "pending" },
  { label: "Under review", value: "under_review" },
  { label: "Rejected", value: "rejected" },
] as const;

function initialsFor(nanny: AdminNanny) {
  const source = `${nanny.user_firstname[0] ?? ""}${nanny.user_lastname[0] ?? ""}`;
  return source.toUpperCase() || nanny.display_name.slice(0, 2).toUpperCase() || "NA";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function mapApplicant(nanny: AdminNanny): ScreeningApplicant {
  return {
    id: nanny.id,
    name: nanny.display_name,
    initials: initialsFor(nanny),
    city: `${nanny.city}, ${nanny.province}`,
    submitted: formatDate(nanny.created_at),
    waiting: nanny.waiting_days,
    status: nanny.verification_status,
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
  const params = useMemo<ListAdminScreeningNanniesParams>(
    () => ({ page: 1, limit: 20, status }),
    [status],
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
    const reason = window.prompt("Reason for resetting this screening?");
    if (!reason?.trim()) return;
    resetMutation.mutate({ id: nanny.id, reason: reason.trim() });
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
        right={
          <div style={{ display: "flex", gap: 10 }}>
            {statusFilters.map((item) => (
              <button
                key={item.value}
                onClick={() => setStatus(item.value)}
                style={{
                  ...btnGhost,
                  borderColor: status === item.value ? "var(--admin-clay)" : undefined,
                  color: status === item.value ? "var(--admin-clay)" : undefined,
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        }
      />
      <div
        style={{
          padding: "24px 40px 40px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {actionError && (
          <p style={{ color: "#b34b39", fontSize: 14, margin: 0 }}>
            {actionError instanceof Error ? actionError.message : "Unable to update screening queue."}
          </p>
        )}
        {screeningQuery.isLoading ? (
          <p style={{ color: "var(--admin-ink-soft)", margin: 0 }}>Loading screening queue...</p>
        ) : nannies.length === 0 ? (
          <p style={{ color: "var(--admin-ink-soft)", margin: 0 }}>No nannies found for this status.</p>
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
      </div>
    </>
  );
}
