import AdminPill, { type PillTone } from "./compositions/AdminPill";
import AdminStars from "./compositions/AdminStars";
import AdminAuditTimeline from "./compositions/AdminAuditTimeline";
import AdminNannyDocumentsList from "./compositions/AdminNannyDocumentsList";
import { btnApprove } from "./compositions/admin-styles";
import { A } from "./tokens";
import type { AdminAuditAction, AdminNannyDetailData, AdminVerificationStatus } from "@/src/types/api/admin";
import { formatCurrency, formatDateOnlyShort, formatLocation } from "@/src/utils/format";

function statusTone(status: AdminVerificationStatus, active: boolean): PillTone {
  if (!active) return "red";
  if (status === "verified") return "green";
  if (status === "rejected") return "red";
  if (status === "under_review") return "clay";
  return "amber";
}

export default function AdminNannyDetailPanel({
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
  detail?: AdminNannyDetailData | null;
  isLoadingActions: boolean;
  isLoading: boolean;
  onActionPageChange: (page: number) => void;
  onReactivate: () => void;
}) {
  if (isLoading) {
    return <aside style={panelStyle}>Loading nanny details...</aside>;
  }

  if (!detail) {
    return <aside style={panelStyle}>Select a nanny to view details.</aside>;
  }

  const { nanny, bookings, earnings } = detail;

  return (
    <aside style={panelStyle}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h2 style={{ margin: 0, color: A.ink, fontSize: 20 }}>{nanny.display_name}</h2>
            <p style={{ margin: "5px 0 0", color: A.inkSoft, fontSize: 13 }}>{nanny.user_email}</p>
          </div>
          <AdminPill tone={statusTone(nanny.verification_status, nanny.user_is_active)}>
            {nanny.user_is_active ? nanny.verification_status.replace("_", " ") : "suspended"}
          </AdminPill>
        </div>
        <p style={{ margin: "14px 0 0", color: A.inkMid, fontSize: 13.5, lineHeight: 1.55 }}>
          {nanny.bio || "No bio provided."}
        </p>
      </div>

      {!nanny.user_is_active && (
        <button type="button" style={btnApprove} onClick={onReactivate}>
          Reactivate nanny
        </button>
      )}

      <div style={metricGrid}>
        <Metric label="Earnings" value={formatCurrency(earnings.total_earnings)} />
        <Metric label="Completed" value={String(earnings.completed_bookings)} />
        <Metric label="Bookings" value={String(bookings.total)} />
        <Metric label="Rate" value={`${formatCurrency(nanny.rate_per_hour)}/hr`} />
      </div>

      <div style={sectionStyle}>
        <h3 style={sectionTitle}>Profile</h3>
        <Detail label="Location" value={formatLocation(nanny.city, nanny.province, "not set")} />
        <Detail label="Specialties" value={nanny.specialties.length ? nanny.specialties.join(", ") : "None listed"} />
        <Detail label="Stripe" value={nanny.stripe_onboarded ? "Onboarded" : "Not onboarded"} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
          <AdminStars value={Math.round(nanny.rating_avg)} />
          <span style={{ color: A.inkMid, fontSize: 13 }}>
            {nanny.rating_avg.toFixed(1)} ({nanny.rating_count})
          </span>
        </div>
      </div>

      <div style={sectionStyle}>
        <h3 style={sectionTitle}>Screening documents ({nanny.documents.length})</h3>
        <AdminNannyDocumentsList documents={nanny.documents} />
      </div>

      <div style={sectionStyle}>
        <h3 style={sectionTitle}>Recent bookings</h3>
        {bookings.items.length === 0 ? (
          <p style={{ margin: 0, color: A.inkSoft, fontSize: 13 }}>No booking history yet.</p>
        ) : (
          bookings.items.slice(0, 5).map((booking) => (
            <div key={booking.id} style={bookingRowStyle}>
              <div>
                <div style={{ color: A.ink, fontSize: 13.5, fontWeight: 600 }}>{booking.parent_display_name}</div>
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
      <strong style={{ color: A.ink }}>{label}:</strong> {value}
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
