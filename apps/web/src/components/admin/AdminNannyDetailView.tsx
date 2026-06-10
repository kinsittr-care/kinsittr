"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import AdminNannyDetailPanel from "./AdminNannyDetailPanel";
import AdminPageHeader from "./compositions/AdminPageHeader";
import AdminReasonDialog, { type AdminReasonDialogState } from "./AdminReasonDialog";
import { btnGhostCls } from "./compositions/admin-styles";
import type { ListAdminAuditActionsParams } from "@/src/types/api/admin";
import {
  adminNannyActionsQueryKey,
  adminNannyQueryKey,
  getAdminNanny,
  listAdminNannyActions,
  reactivateAdminNanny,
} from "@/src/utils/api/admin/nannies";

const ACTION_PAGE_SIZE = 10;

export default function AdminNannyDetailView({ nannyId }: { nannyId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [actionPage, setActionPage] = useState(1);
  const [reasonAction, setReasonAction] = useState<AdminReasonDialogState | null>(null);
  const actionParams = useMemo<ListAdminAuditActionsParams>(
    () => ({ page: actionPage, limit: ACTION_PAGE_SIZE }),
    [actionPage],
  );

  const detailQuery = useQuery({
    queryKey: adminNannyQueryKey(nannyId),
    queryFn: () => getAdminNanny(nannyId),
  });
  const actionsQuery = useQuery({
    queryKey: adminNannyActionsQueryKey(nannyId, actionParams),
    queryFn: () => listAdminNannyActions(nannyId, actionParams),
  });
  const reactivateMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      reactivateAdminNanny(id, { reason }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "nannies"] });
      await queryClient.invalidateQueries({ queryKey: adminNannyQueryKey(nannyId) });
      await queryClient.invalidateQueries({ queryKey: ["admin", "nanny-actions", nannyId] });
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
  const title = detail?.nanny.display_name ?? "Nanny details";

  return (
    <>
      <AdminPageHeader
        title={title}
        subtitle="Caregiver profile, booking history, screening documents, and admin timeline."
        right={
          <button type="button" className={btnGhostCls} onClick={() => router.push("/admin/nannies")}>
            Back to all nannies
          </button>
        }
      />
      <div className="px-4 py-5 md:px-10 md:py-6">
        {actionError && (
          <p className="mb-4 text-[14px] text-admin-red">
            {actionError instanceof Error ? actionError.message : "Unable to load nanny details."}
          </p>
        )}
        <AdminNannyDetailPanel
          actions={actions}
          actionPage={actionPage}
          actionTotal={actionTotal}
          detail={detail}
          isLoading={detailQuery.isLoading}
          isLoadingActions={actionsQuery.isLoading}
          onActionPageChange={setActionPage}
          onReactivate={() => {
            setReasonAction({
              title: "Reactivate nanny",
              description: "Restore this nanny account. A reason is required for the admin audit trail.",
              submitLabel: "Reactivate nanny",
              tone: "approve",
              onSubmit: (reason) => {
                reactivateMutation.mutate({ id: nannyId, reason });
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
