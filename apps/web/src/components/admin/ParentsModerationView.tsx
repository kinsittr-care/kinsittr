"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { A } from "./tokens";
import AdminPageHeader from "./compositions/AdminPageHeader";
import AdminPagination from "./AdminPagination";
import AdminParentDetailPanel from "./AdminParentDetailPanel";
import AdminAvatar from "./compositions/AdminAvatar";
import AdminPill from "./compositions/AdminPill";
import AdminReasonDialog, { type AdminReasonDialogState } from "./AdminReasonDialog";
import { SearchIcon } from "./compositions/admin-icons";
import { btnDanger, btnGhost } from "./compositions/admin-styles";
import type { AdminParent, ListAdminAuditActionsParams, ListAdminParentsParams } from "@/src/types/api/admin";
import { formatLocation } from "@/src/utils/format";
import {
  adminParentActionsQueryKey,
  adminParentQueryKey,
  adminParentsQueryKey,
  getAdminParent,
  listAdminParentActions,
  listAdminParents,
  reactivateAdminParent,
  suspendAdminParent,
} from "@/src/utils/api/admin/parents";

const colTemplate = "2.2fr 1.35fr .9fr 1fr 1fr 1fr";
const PAGE_SIZE = 20;
const ACTION_PAGE_SIZE = 10;

function initialsFor(parent: AdminParent) {
  const source = `${parent.user_firstname[0] ?? ""}${parent.user_lastname[0] ?? ""}`;
  return source.toUpperCase() || parent.display_name.slice(0, 2).toUpperCase() || "PA";
}

export default function ParentsModerationView() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [actionPage, setActionPage] = useState(1);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
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
  const detailQuery = useQuery({
    queryKey: selectedParentId ? adminParentQueryKey(selectedParentId) : ["admin", "parent", "none"],
    queryFn: () => getAdminParent(selectedParentId as string),
    enabled: Boolean(selectedParentId),
  });
  const selectedParentDetail = detailQuery.data?.data ?? null;
  const actionParams = useMemo<ListAdminAuditActionsParams>(
    () => ({ page: actionPage, limit: ACTION_PAGE_SIZE }),
    [actionPage],
  );
  const actionsQuery = useQuery({
    queryKey: selectedParentId
      ? adminParentActionsQueryKey(selectedParentId, actionParams)
      : ["admin", "parent-actions", "none"],
    queryFn: () => listAdminParentActions(selectedParentId as string, actionParams),
    enabled: Boolean(selectedParentId),
  });
  const actions = actionsQuery.data?.data?.items ?? [];
  const actionTotal = actionsQuery.data?.data?.total ?? 0;

  const invalidateParent = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin", "parents"] });
    await queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] });
    await queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
    await queryClient.invalidateQueries({ queryKey: ["admin", "conversations"] });
    await queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
    if (selectedParentId) {
      await queryClient.invalidateQueries({ queryKey: adminParentQueryKey(selectedParentId) });
      await queryClient.invalidateQueries({ queryKey: ["admin", "parent-actions", selectedParentId] });
    }
  };

  const suspendMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      suspendAdminParent(id, { reason }),
    onSuccess: invalidateParent,
  });
  const reactivateMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      reactivateAdminParent(id, { reason }),
    onSuccess: invalidateParent,
  });

  const actionError = parentsQuery.error || detailQuery.error || actionsQuery.error || suspendMutation.error || reactivateMutation.error;

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
              setSelectedParentId(null);
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
      <div style={{ padding: "24px 40px 40px", display: "grid", gridTemplateColumns: selectedParentId ? "1fr 380px" : "1fr", gap: 18 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {actionError && (
            <p style={{ color: A.red, fontSize: 14, margin: 0 }}>
              {actionError instanceof Error ? actionError.message : "Unable to update parent moderation."}
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
            <div>Parent</div>
            <div>City</div>
            <div>Children</div>
            <div>Bookings</div>
            <div>Status</div>
            <div style={{ textAlign: "right" }}>Action</div>
          </div>

          {parentsQuery.isLoading ? (
            <div style={{ padding: 24, color: A.inkSoft }}>Loading parents...</div>
          ) : parents.length === 0 ? (
            <div style={{ padding: 24, color: A.inkSoft }}>No parents found.</div>
          ) : (
            parents.map((parent, i) => {
              const isBusy = suspendMutation.isPending && suspendMutation.variables?.id === parent.id;
              return (
                <div
                  key={parent.id}
                  className="admin-table-row"
                  onClick={() => {
                    setSelectedParentId(parent.id);
                    setActionPage(1);
                  }}
                  style={{
                    display: "grid",
                    gridTemplateColumns: colTemplate,
                    alignItems: "center",
                    padding: "16px 24px",
                    gap: 12,
                    borderBottom: i < parents.length - 1 ? `1px solid ${A.borderSoft}` : "none",
                    background: selectedParentId === parent.id ? A.cardWarm : "transparent",
                    cursor: "pointer",
                    transition: "background .15s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <AdminAvatar initials={initialsFor(parent)} size={40} tone={parent.user_is_active ? "clay" : "muted"} />
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: A.ink }}>{parent.display_name}</div>
                      <div style={{ fontSize: 12.5, color: A.inkSoft }}>{parent.user_email}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 14, color: A.inkMid }}>{formatLocation(parent.city, parent.province, "not set")}</div>
                  <div style={{ fontSize: 14, color: A.inkMid }}>{parent.num_children}</div>
                  <div style={{ fontSize: 14, color: A.inkMid }}>{parent.booking_count}</div>
                  <div>
                    <AdminPill tone={parent.user_is_active ? "green" : "red"}>
                      {parent.user_is_active ? "active" : "suspended"}
                    </AdminPill>
                  </div>
                  <div onClick={(event) => event.stopPropagation()} style={{ textAlign: "right" }}>
                    <button
                      disabled={!parent.user_is_active || isBusy}
                      onClick={() => {
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
                      style={{ ...btnDanger, opacity: parent.user_is_active && !isBusy ? 1 : 0.55 }}
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
        {selectedParentId && (
          <AdminParentDetailPanel
            actions={actions}
            actionPage={actionPage}
            actionTotal={actionTotal}
            detail={selectedParentDetail}
            isLoading={detailQuery.isLoading}
            isLoadingActions={actionsQuery.isLoading}
            onActionPageChange={setActionPage}
            onReactivate={() => {
              if (!selectedParentId) return;
              setReasonAction({
                title: "Reactivate parent",
                description: "Restore this parent account. A reason is required for the admin audit trail.",
                submitLabel: "Reactivate parent",
                tone: "approve",
                onSubmit: (reason) => {
                  reactivateMutation.mutate({ id: selectedParentId, reason });
                  setReasonAction(null);
                },
              });
            }}
          />
        )}
      </div>
      <AdminReasonDialog
        action={reasonAction}
        isSubmitting={suspendMutation.isPending || reactivateMutation.isPending}
        onClose={() => setReasonAction(null)}
      />
    </>
  );
}
