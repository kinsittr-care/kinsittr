"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import AdminPageHeader from "./compositions/AdminPageHeader";
import AdminParentDetailPanel from "./AdminParentDetailPanel";
import AdminReasonDialog, { type AdminReasonDialogState } from "./AdminReasonDialog";
import { btnGhostCls } from "./compositions/admin-styles";
import type { ListAdminAuditActionsParams } from "@/src/types/api/admin";
import {
  adminParentActionsQueryKey,
  adminParentQueryKey,
  getAdminParent,
  listAdminParentActions,
  reactivateAdminParent,
} from "@/src/utils/api/admin/parents";

const ACTION_PAGE_SIZE = 10;

export default function AdminParentDetailView({ parentId }: { parentId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [actionPage, setActionPage] = useState(1);
  const [reasonAction, setReasonAction] = useState<AdminReasonDialogState | null>(null);
  const actionParams = useMemo<ListAdminAuditActionsParams>(
    () => ({ page: actionPage, limit: ACTION_PAGE_SIZE }),
    [actionPage],
  );

  const detailQuery = useQuery({
    queryKey: adminParentQueryKey(parentId),
    queryFn: () => getAdminParent(parentId),
  });
  const actionsQuery = useQuery({
    queryKey: adminParentActionsQueryKey(parentId, actionParams),
    queryFn: () => listAdminParentActions(parentId, actionParams),
  });
  const reactivateMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      reactivateAdminParent(id, { reason }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "parents"] });
      await queryClient.invalidateQueries({ queryKey: adminParentQueryKey(parentId) });
      await queryClient.invalidateQueries({ queryKey: ["admin", "parent-actions", parentId] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "conversations"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
    },
  });

  const detail = detailQuery.data?.data ?? null;
  const actions = actionsQuery.data?.data?.items ?? [];
  const actionTotal = actionsQuery.data?.data?.total ?? 0;
  const actionError = detailQuery.error || actionsQuery.error || reactivateMutation.error;
  const title = detail?.parent.display_name ?? "Parent details";

  return (
    <>
      <AdminPageHeader
        title={title}
        subtitle="Parent profile, booking history, and admin timeline."
        right={
          <button type="button" className={btnGhostCls} onClick={() => router.push("/admin/parents")}>
            Back to all parents
          </button>
        }
      />
      <div className="px-4 py-5 md:px-10 md:py-6">
        {actionError && (
          <p className="mb-4 text-[14px] text-admin-red">
            {actionError instanceof Error ? actionError.message : "Unable to load parent details."}
          </p>
        )}
        <AdminParentDetailPanel
          actions={actions}
          actionPage={actionPage}
          actionTotal={actionTotal}
          detail={detail}
          isLoading={detailQuery.isLoading}
          isLoadingActions={actionsQuery.isLoading}
          onActionPageChange={setActionPage}
          onReactivate={() => {
            setReasonAction({
              title: "Reactivate parent",
              description: "Restore this parent account. A reason is required for the admin audit trail.",
              submitLabel: "Reactivate parent",
              tone: "approve",
              onSubmit: (reason) => {
                reactivateMutation.mutate({ id: parentId, reason });
                setReasonAction(null);
              },
            });
          }}
        />
      </div>
      <AdminReasonDialog
        action={reasonAction}
        isSubmitting={reactivateMutation.isPending}
        onClose={() => setReasonAction(null)}
      />
    </>
  );
}
