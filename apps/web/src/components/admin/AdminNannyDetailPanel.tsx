import AdminPill, { type PillTone } from "./compositions/AdminPill";
import AdminStars from "./compositions/AdminStars";
import AdminAuditTimeline from "./compositions/AdminAuditTimeline";
import AdminNannyDocumentsList from "./compositions/AdminNannyDocumentsList";
import { btnApproveCls } from "./compositions/admin-styles";
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
  const panelCls = "bg-admin-card border border-admin-border rounded-2xl shadow-[var(--admin-shadow)] p-[22px] self-start flex flex-col gap-[18px] text-admin-ink-soft";

  if (isLoading) {
    return <aside className={panelCls}>Loading nanny details...</aside>;
  }

  if (!detail) {
    return <aside className={panelCls}>Select a nanny to view details.</aside>;
  }

  const { nanny, bookings, earnings } = detail;

  return (
    <aside className={panelCls}>
      <div>
        <div className="flex justify-between gap-3">
          <div>
            <h2 className="m-0 text-admin-ink text-[20px]">{nanny.display_name}</h2>
            <p className="mt-[5px] mb-0 text-admin-ink-soft text-[13px]">{nanny.user_email}</p>
          </div>
          <AdminPill tone={statusTone(nanny.verification_status, nanny.user_is_active)}>
            {nanny.user_is_active ? nanny.verification_status.replace("_", " ") : "suspended"}
          </AdminPill>
        </div>
        <p className="mt-[14px] mb-0 text-admin-ink-mid text-[13.5px] leading-[1.55]">
          {nanny.bio || "No bio provided."}
        </p>
      </div>

      {!nanny.user_is_active && (
        <button type="button" className={btnApproveCls} onClick={onReactivate}>
          Reactivate nanny
        </button>
      )}

      <div className="grid grid-cols-2 gap-[10px]">
        <Metric label="Earnings" value={formatCurrency(earnings.total_earnings)} />
        <Metric label="Completed" value={String(earnings.completed_bookings)} />
        <Metric label="Bookings" value={String(bookings.total)} />
        <Metric label="Rate" value={`${formatCurrency(nanny.rate_per_hour)}/hr`} />
      </div>

      <div className="border-t border-admin-border-soft pt-4">
        <h3 className="m-0 text-admin-ink text-[15px]">Profile</h3>
        <Detail label="Location" value={formatLocation(nanny.city, nanny.province, "not set")} />
        <Detail label="Specialties" value={nanny.specialties.length ? nanny.specialties.join(", ") : "None listed"} />
        <Detail label="Stripe" value={nanny.stripe_onboarded ? "Onboarded" : "Not onboarded"} />
        <div className="flex items-center gap-2 mt-[10px]">
          <AdminStars value={Math.round(nanny.rating_avg)} />
          <span className="text-admin-ink-mid text-[13px]">
            {nanny.rating_avg.toFixed(1)} ({nanny.rating_count})
          </span>
        </div>
      </div>

      <div className="border-t border-admin-border-soft pt-4">
        <h3 className="m-0 text-admin-ink text-[15px]">Screening documents ({nanny.documents.length})</h3>
        <AdminNannyDocumentsList documents={nanny.documents} />
      </div>

      <div className="border-t border-admin-border-soft pt-4">
        <h3 className="m-0 text-admin-ink text-[15px]">Recent bookings</h3>
        {bookings.items.length === 0 ? (
          <p className="m-0 text-admin-ink-soft text-[13px]">No booking history yet.</p>
        ) : (
          bookings.items.slice(0, 5).map((booking) => (
            <div key={booking.id} className="flex justify-between gap-3 border-t border-admin-border-soft py-3">
              <div>
                <div className="text-admin-ink text-[13.5px] font-semibold">{booking.parent_display_name}</div>
                <div className="text-admin-ink-soft text-[12.5px]">
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
    <div className="bg-admin-card-warm border border-admin-border-soft rounded-xl p-3">
      <div className="text-admin-ink-soft text-[11px] uppercase tracking-[.08em]">{label}</div>
      <div className="mt-[6px] text-admin-clay font-bold text-[15px]">{value}</div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-[10px] text-admin-ink-mid text-[13px]">
      <strong className="text-admin-ink">{label}:</strong> {value}
    </div>
  );
}
