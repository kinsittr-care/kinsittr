"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { A } from "./tokens";
import AdminPageHeader from "./AdminPageHeader";
import AdminNannyDetailPanel from "./AdminNannyDetailPanel";
import AdminPagination from "./AdminPagination";
import AdminAvatar from "./AdminAvatar";
import AdminPill, { type PillTone } from "./AdminPill";
import AdminStars from "./AdminStars";
import { SearchIcon } from "./admin-icons";
import { btnDanger, btnGhost, btnGhostSm, btnApprove } from "./admin-styles";
import type { AdminNanny, AdminVerificationStatus, ListAdminNanniesParams } from "@/src/types/api/admin";
import {
  adminNannyQueryKey,
  adminNanniesQueryKey,
  getAdminNanny,
  listAdminNannies,
  rejectAdminNanny,
  suspendAdminNanny,
  verifyAdminNanny,
} from "@/src/utils/api/admin/nannies";

const colTemplate = "2.1fr 1.35fr .85fr 1.1fr 1fr 1.45fr";
const PAGE_SIZE = 20;

const statusFilters: Array<{ label: string; value: AdminVerificationStatus | "" }> = [
  { label: "All", value: "" },
  { label: "Verified", value: "verified" },
  { label: "Pending", value: "pending" },
  { label: "Under review", value: "under_review" },
  { label: "Rejected", value: "rejected" },
];

function initialsFor(nanny: AdminNanny) {
  const source = `${nanny.user_firstname[0] ?? ""}${nanny.user_lastname[0] ?? ""}`;
  return source.toUpperCase() || nanny.display_name.slice(0, 2).toUpperCase() || "NA";
}

function statusLabel(status: AdminVerificationStatus) {
  return status.replace("_", " ");
}

function statusTone(nanny: AdminNanny): PillTone {
  if (!nanny.user_is_active) return "red";
  if (nanny.verification_status === "verified") return "green";
  if (nanny.verification_status === "rejected") return "red";
  if (nanny.verification_status === "under_review") return "clay";
  return "amber";
}

function canVerify(nanny: AdminNanny) {
  return (
    nanny.user_is_active &&
    nanny.verification_status === "under_review" &&
    nanny.screening_steps.docs_reviewed &&
    nanny.screening_steps.references_checked &&
    nanny.screening_steps.interview_done
  );
}

export default function AllNanniesView() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [status, setStatus] = useState<AdminVerificationStatus | "">("");
  const [page, setPage] = useState(1);
  const [selectedNannyId, setSelectedNannyId] = useState<string | null>(null);
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

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin", "nannies"] });
    await queryClient.invalidateQueries({ queryKey: ["admin", "screening", "nannies"] });
    if (selectedNannyId) {
      await queryClient.invalidateQueries({ queryKey: adminNannyQueryKey(selectedNannyId) });
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

  const busyIds = new Set<string>();
  if (verifyMutation.isPending && verifyMutation.variables) busyIds.add(verifyMutation.variables);
  if (rejectMutation.isPending && rejectMutation.variables) busyIds.add(rejectMutation.variables.id);
  if (suspendMutation.isPending && suspendMutation.variables) busyIds.add(suspendMutation.variables.id);

  const askReason = (label: string) => window.prompt(`Reason for ${label}?`)?.trim();

  const actionError =
    nanniesQuery.error || detailQuery.error || verifyMutation.error || rejectMutation.error || suspendMutation.error;

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

        <div
          style={{
            background: A.card,
            border: `1px solid ${A.border}`,
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: A.shadow,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: colTemplate,
              padding: "14px 24px",
              borderBottom: `1px solid ${A.divider}`,
              background: A.cardWarm,
              fontSize: 11.5,
              fontWeight: 600,
              letterSpacing: ".14em",
              textTransform: "uppercase" as const,
              color: A.inkSoft,
            }}
          >
            <div>Nanny</div>
            <div>City</div>
            <div>Rate</div>
            <div>Rating</div>
            <div>Status</div>
            <div style={{ textAlign: "right" }}>Actions</div>
          </div>

          {nanniesQuery.isLoading ? (
            <div style={{ padding: 24, color: A.inkSoft }}>Loading nannies...</div>
          ) : nannies.length === 0 ? (
            <div style={{ padding: 24, color: A.inkSoft }}>No nannies found.</div>
          ) : (
            nannies.map((nanny, i) => {
              const isBusy = busyIds.has(nanny.id);
              return (
                <div
                  key={nanny.id}
                  className="admin-table-row"
                  onClick={() => setSelectedNannyId(nanny.id)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: colTemplate,
                    alignItems: "center",
                    padding: "16px 24px",
                    gap: 12,
                    borderBottom: i < nannies.length - 1 ? `1px solid ${A.borderSoft}` : "none",
                    background: selectedNannyId === nanny.id ? A.cardWarm : "transparent",
                    cursor: "pointer",
                    transition: "background .15s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <AdminAvatar
                      initials={initialsFor(nanny)}
                      size={40}
                      tone={nanny.user_is_active ? "clay" : "muted"}
                    />
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: A.ink }}>{nanny.display_name}</div>
                      <div style={{ fontSize: 12.5, color: A.inkSoft }}>{nanny.user_email}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 14, color: A.inkMid }}>{nanny.city}, {nanny.province}</div>
                  <div>
                    <span style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 18, color: A.ink }}>
                      ${nanny.rate_per_hour}
                    </span>
                    <span style={{ fontSize: 13, color: A.inkSoft, fontWeight: 400 }}>/hr</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <AdminStars value={Math.round(nanny.rating_avg)} />
                    <span style={{ fontSize: 13.5, color: A.inkMid, fontWeight: 500 }}>{nanny.rating_avg.toFixed(1)}</span>
                  </div>
                  <div>
                    <AdminPill tone={statusTone(nanny)}>
                      {nanny.user_is_active ? statusLabel(nanny.verification_status) : "suspended"}
                    </AdminPill>
                  </div>
                  <div
                    onClick={(event) => event.stopPropagation()}
                    style={{ display: "flex", justifyContent: "flex-end", gap: 8, flexWrap: "wrap" }}
                  >
                    <button
                      disabled={!canVerify(nanny) || isBusy}
                      onClick={() => verifyMutation.mutate(nanny.id)}
                      style={{ ...btnApprove, opacity: canVerify(nanny) && !isBusy ? 1 : 0.55 }}
                    >
                      Verify
                    </button>
                    <button
                      disabled={!nanny.user_is_active || isBusy}
                      onClick={() => {
                        const reason = askReason("rejecting this nanny");
                        if (reason) rejectMutation.mutate({ id: nanny.id, reason });
                      }}
                      style={{ ...btnGhostSm, opacity: nanny.user_is_active && !isBusy ? 1 : 0.55 }}
                    >
                      Reject
                    </button>
                    <button
                      disabled={!nanny.user_is_active || isBusy}
                      onClick={() => {
                        const reason = askReason("suspending this nanny");
                        if (reason) suspendMutation.mutate({ id: nanny.id, reason });
                      }}
                      style={{ ...btnDanger, opacity: nanny.user_is_active && !isBusy ? 1 : 0.55 }}
                    >
                      Suspend
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
          <AdminPagination page={page} total={total} limit={PAGE_SIZE} onPageChange={setPage} />
        </div>
        {selectedNannyId && (
          <AdminNannyDetailPanel detail={selectedNannyDetail} isLoading={detailQuery.isLoading} />
        )}
      </div>
    </>
  );
}
