import AdminPill from "./compositions/AdminPill";
import AdminAuditTimeline from "./compositions/AdminAuditTimeline";
import { btnApproveCls } from "./compositions/admin-styles";
import type { AdminAuditAction, AdminParentDetailData } from "@/src/types/api/admin";
import { formatCurrency, formatDateOnlyShort, formatLocation } from "@/src/utils/format";

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
  const panelCls = "bg-admin-card border border-admin-border rounded-2xl shadow-[var(--admin-shadow)] p-[22px] self-start flex flex-col gap-[18px] text-admin-ink-soft";

  if (isLoading) {
    return <aside className={panelCls}>Loading parent details...</aside>;
  }

  if (!detail) {
    return <aside className={panelCls}>Select a parent to view details.</aside>;
  }

  const { parent, bookings } = detail;
  const childrenAges = Array.isArray(parent.children_ages) ? parent.children_ages : [];

  return (
    <aside className={panelCls}>
      <div>
        <div className="flex justify-between gap-3">
          <div>
            <h2 className="m-0 text-admin-ink text-[20px]">{parent.display_name}</h2>
            <p className="mt-[5px] mb-0 text-admin-ink-soft text-[13px]">{parent.user_email}</p>
          </div>
          <AdminPill tone={parent.user_is_active ? "green" : "red"}>
            {parent.user_is_active ? "active" : "suspended"}
          </AdminPill>
        </div>
      </div>

      {!parent.user_is_active && (
        <button type="button" className={btnApproveCls} onClick={onReactivate}>
          Reactivate parent
        </button>
      )}

      <div className="grid grid-cols-2 gap-[10px]">
        <Metric label="Spend" value={formatCurrency(parent.total_spend)} />
        <Metric label="Bookings" value={String(parent.booking_count)} />
        <Metric label="Children" value={String(parent.num_children)} />
        <Metric label="History" value={String(bookings.total)} />
      </div>

      <div className="border-t border-admin-border-soft pt-4">
        <h3 className="m-0 text-admin-ink text-[15px]">Profile</h3>
        <Detail label="Name" value={`${parent.user_firstname} ${parent.user_lastname}`.trim()} />
        <Detail label="Location" value={formatLocation(parent.city, parent.province, "not set")} />
        <Detail label="Children ages" value={childrenAges.length ? childrenAges.join(", ") : "None listed"} />
        <Detail label="Stripe customer" value={parent.stripe_customer_id || "Not created"} />
      </div>

      <div className="border-t border-admin-border-soft pt-4">
        <h3 className="m-0 text-admin-ink text-[15px]">Recent bookings</h3>
        {bookings.items.length === 0 ? (
          <p className="m-0 text-admin-ink-soft text-[13px]">No booking history yet.</p>
        ) : (
          bookings.items.slice(0, 5).map((booking) => (
            <div key={booking.id} className="flex justify-between gap-3 border-t border-admin-border-soft py-3">
              <div>
                <div className="text-admin-ink text-[13.5px] font-semibold">{booking.nanny_display_name}</div>
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
      <strong className="text-admin-ink">{label}:</strong> {value || "not set"}
    </div>
  );
}
