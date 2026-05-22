import AdminPagination from "../AdminPagination";
import { A } from "../tokens";
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
    <div style={sectionStyle}>
      <h3 style={sectionTitle}>Audit timeline</h3>
      {isLoading ? (
        <p style={emptyStyle}>Loading audit actions...</p>
      ) : actions.length === 0 ? (
        <p style={emptyStyle}>No audit actions yet.</p>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {actions.map((action) => {
            const status = describeStatus(action);
            return (
              <div key={action.id} style={actionStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <strong style={{ color: A.ink, fontSize: 13.5 }}>{action.action.replaceAll("_", " ")}</strong>
                  <span style={{ color: A.inkSoft, fontSize: 12 }}>{formatShortDateTime(action.created_at)}</span>
                </div>
                <div style={{ marginTop: 5, color: A.inkSoft, fontSize: 12.5 }}>
                  {action.admin_email ?? "System"}{status ? ` · ${status}` : ""}
                </div>
                {action.reason && (
                  <p style={{ margin: "7px 0 0", color: A.inkMid, fontSize: 13, lineHeight: 1.45 }}>
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

const sectionStyle: React.CSSProperties = {
  borderTop: `1px solid ${A.borderSoft}`,
  paddingTop: 16,
};

const sectionTitle: React.CSSProperties = {
  margin: "0 0 12px",
  color: A.ink,
  fontSize: 15,
};

const emptyStyle: React.CSSProperties = {
  margin: 0,
  color: A.inkSoft,
  fontSize: 13,
};

const actionStyle: React.CSSProperties = {
  border: `1px solid ${A.borderSoft}`,
  borderRadius: 12,
  background: A.cardWarm,
  padding: 12,
};
