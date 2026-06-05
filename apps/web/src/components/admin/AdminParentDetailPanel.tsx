import AdminPill from "./compositions/AdminPill";
import AdminAuditTimeline from "./compositions/AdminAuditTimeline";
import { btnApprove } from "./compositions/admin-styles";
import { A } from "./tokens";
import type { AdminAuditAction, AdminParentDetailData } from "@/src/types/api/admin";
import { formatCurrency, formatDateOnlyShort } from "@/src/utils/format";

export default function AdminParentDetailPanel({
  actions,
  actionPage,
  actionTotal,
  detail,
  isLoadingActions,
  isLoading,
  onActionPageChange,
  onReactivate,
}: {
  actions: AdminAuditAction[];
  actionPage: number;
  actionTotal: number;
  detail?: AdminParentDetailData | null;
  isLoadingActions: boolean;
  isLoading: boolean;
  onActionPageChange: (page: number) => void;
  onReactivate: () => void;
}) {
  if (isLoading) {
    return <aside style={panelStyle}>Loading parent details...</aside>;
  }

  if (!detail) {
    return <aside style={panelStyle}>Select a parent to view details.</aside>;
  }

  const { parent, bookings } = detail;

  return (
    <aside style={panelStyle}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h2 style={{ margin: 0, color: A.ink, fontSize: 20 }}>{parent.display_name}</h2>
            <p style={{ margin: "5px 0 0", color: A.inkSoft, fontSize: 13 }}>{parent.user_email}</p>
          </div>
          <AdminPill tone={parent.user_is_active ? "green" : "red"}>
            {parent.user_is_active ? "active" : "suspended"}
          </AdminPill>
        </div>
      </div>

      {!parent.user_is_active && (
        <button type="button" style={btnApprove} onClick={onReactivate}>
          Reactivate parent
        </button>
      )}

      <div style={metricGrid}>
        <Metric label="Spend" value={formatCurrency(parent.total_spend)} />
        <Metric label="Bookings" value={String(parent.booking_count)} />
        <Metric label="Children" value={String(parent.num_children)} />
        <Metric label="History" value={String(bookings.total)} />
      </div>

      <div style={sectionStyle}>
        <h3 style={sectionTitle}>Profile</h3>
        <Detail label="Name" value={`${parent.user_firstname} ${parent.user_lastname}`.trim()} />
        <Detail label="Location" value={`${parent.city}, ${parent.province}`} />
        <Detail label="Children ages" value={parent.children_ages.length ? parent.children_ages.join(", ") : "None listed"} />
        <Detail label="Stripe customer" value={parent.stripe_customer_id || "Not created"} />
      </div>

      <div style={sectionStyle}>
        <h3 style={sectionTitle}>Recent bookings</h3>
        {bookings.items.length === 0 ? (
          <p style={{ margin: 0, color: A.inkSoft, fontSize: 13 }}>No booking history yet.</p>
        ) : (
          bookings.items.slice(0, 5).map((booking) => (
            <div key={booking.id} style={bookingRowStyle}>
              <div>
                <div style={{ color: A.ink, fontSize: 13.5, fontWeight: 600 }}>{booking.nanny_display_name}</div>
                <div style={{ color: A.inkSoft, fontSize: 12.5 }}>
                  {formatDateOnlyShort(booking.date)} · {booking.start_time} · {booking.duration}h
                </div>
              </div>
              <AdminPill tone={booking.status === "completed" ? "completed" : booking.status === "approved" ? "green" : "amber"}>
                {booking.status}
              </AdminPill>
            </div>
          ))
        )}
      </div>

      <AdminAuditTimeline
        actions={actions}
        isLoading={isLoadingActions}
        page={actionPage}
        total={actionTotal}
        limit={ACTION_PAGE_SIZE}
        onPageChange={onActionPageChange}
      />
    </aside>
  );
}

const ACTION_PAGE_SIZE = 10;

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: A.cardWarm, border: `1px solid ${A.borderSoft}`, borderRadius: 12, padding: 12 }}>
      <div style={{ color: A.inkSoft, fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em" }}>{label}</div>
      <div style={{ marginTop: 6, color: A.clay, fontWeight: 700, fontSize: 15 }}>{value}</div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginTop: 10, color: A.inkMid, fontSize: 13 }}>
      <strong style={{ color: A.ink }}>{label}:</strong> {value || "not set"}
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  background: A.card,
  border: `1px solid ${A.border}`,
  borderRadius: 16,
  boxShadow: A.shadow,
  padding: 22,
  alignSelf: "start",
  display: "flex",
  flexDirection: "column",
  gap: 18,
  color: A.inkSoft,
};

const metricGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
};

const sectionStyle: React.CSSProperties = {
  borderTop: `1px solid ${A.borderSoft}`,
  paddingTop: 16,
};

const sectionTitle: React.CSSProperties = {
  margin: 0,
  color: A.ink,
  fontSize: 15,
};

const bookingRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  borderTop: `1px solid ${A.borderSoft}`,
  padding: "12px 0",
};
