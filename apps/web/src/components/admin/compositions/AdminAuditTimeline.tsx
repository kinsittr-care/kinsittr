import AdminPagination from "../AdminPagination";
import type { AdminAuditAction } from "@/src/types/api/admin";
import { formatShortDateTime } from "@/src/utils/format";

type AdminAuditTimelineProps = {
  actions: AdminAuditAction[];
  isLoading: boolean;
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
};

function describeStatus(action: AdminAuditAction) {
  if (action.previous_status && action.new_status) {
    return `${action.previous_status} -> ${action.new_status}`;
  }
  if (action.new_status) return `set to ${action.new_status}`;
  return null;
}

export default function AdminAuditTimeline({
  actions,
  isLoading,
  page,
  total,
  limit,
  onPageChange,
}: AdminAuditTimelineProps) {
  return (
    <div className="border-t border-admin-border-soft pt-4">
      <h3 className="m-0 mb-3 text-admin-ink text-[15px]">Audit timeline</h3>
      {isLoading ? (
        <p className="m-0 text-admin-ink-soft text-[13px]">Loading audit actions...</p>
      ) : actions.length === 0 ? (
        <p className="m-0 text-admin-ink-soft text-[13px]">No audit actions yet.</p>
      ) : (
        <div className="grid gap-[10px]">
          {actions.map((action) => {
            const status = describeStatus(action);
            return (
              <div key={action.id} className="border border-admin-border-soft rounded-xl bg-admin-card-warm p-3">
                <div className="flex justify-between gap-[10px]">
                  <strong className="text-admin-ink text-[13.5px]">{action.action.replaceAll("_", " ")}</strong>
                  <span className="text-admin-ink-soft text-[12px]">{formatShortDateTime(action.created_at)}</span>
                </div>
                <div className="mt-[5px] text-admin-ink-soft text-[12.5px]">
                  {action.admin_email ?? "System"}{status ? ` · ${status}` : ""}
                </div>
                {action.reason && (
                  <p className="mt-[7px] mb-0 text-admin-ink-mid text-[13px] leading-[1.45]">
                    {action.reason}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
      {total > limit && (
        <AdminPagination page={page} total={total} limit={limit} onPageChange={onPageChange} />
      )}
    </div>
  );
}
