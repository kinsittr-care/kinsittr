import AdminAvatar from "./AdminAvatar";
import { btnApproveCls, btnDangerCls, btnGhostSmCls } from "./admin-styles";
import AdminStars from "./AdminStars";
import AdminPill, { type PillTone } from "./AdminPill";
import { cn } from "@/lib/utils";
import type { AdminNanny, AdminVerificationStatus } from "@/src/types/api/admin";
import { formatLocation } from "@/src/utils/format";

const colTemplate = "2.1fr 1.35fr .85fr 1.1fr 1fr 1.45fr";

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

export function canVerifyNanny(nanny: AdminNanny) {
  return (
    nanny.user_is_active &&
    nanny.verification_status === "under_review" &&
    nanny.screening_steps.docs_reviewed &&
    nanny.screening_steps.references_checked &&
    nanny.screening_steps.interview_done
  );
}

type AdminNanniesTableProps = {
  busyIds: Set<string>;
  isLoading: boolean;
  nannies: AdminNanny[];
  selectedNannyId: string | null;
  onReject: (nanny: AdminNanny) => void;
  onSelect: (id: string) => void;
  onSuspend: (nanny: AdminNanny) => void;
  onVerify: (id: string) => void;
};

export default function AdminNanniesTable({
  busyIds,
  isLoading,
  nannies,
  selectedNannyId,
  onReject,
  onSelect,
  onSuspend,
  onVerify,
}: AdminNanniesTableProps) {
  return (
    <div className="bg-admin-card border border-admin-border rounded-2xl overflow-hidden shadow-(--admin-shadow)">
      <div
        className="hidden px-6 py-[14px] border-b border-admin-divider bg-admin-card-warm text-[11.5px] font-semibold tracking-[.14em] uppercase text-admin-ink-soft xl:grid"
        style={{ gridTemplateColumns: colTemplate }}
      >
        <div>Nanny</div>
        <div>City</div>
        <div>Rate</div>
        <div>Rating</div>
        <div>Status</div>
        <div className="text-right">Actions</div>
      </div>

      {isLoading ? (
        <div className="p-6 text-admin-ink-soft">Loading nannies...</div>
      ) : nannies.length === 0 ? (
        <div className="p-6 text-admin-ink-soft">No nannies found.</div>
      ) : (
        <div className="flex flex-col gap-2 p-2">
        {nannies.map((nanny) => {
          const isBusy = busyIds.has(nanny.id);
          const canVerify = canVerifyNanny(nanny);

          return (
            <div
              key={nanny.id}
              className="admin-table-row grid grid-cols-1 cursor-pointer gap-3 rounded-xl border border-admin-border-soft px-4 py-4 transition-colors duration-150 sm:px-6 xl:grid-cols-[2.1fr_1.35fr_.85fr_1.1fr_1fr_1.45fr] xl:items-center"
              onClick={() => onSelect(nanny.id)}
              style={{
                background: selectedNannyId === nanny.id ? "var(--admin-card-warm)" : "transparent",
              }}
            >
              <div
                className="hidden xl:contents"
              >
                <div className="flex items-center gap-[14px]">
                  <AdminAvatar initials={initialsFor(nanny)} size={40} tone={nanny.user_is_active ? "clay" : "muted"} />
                  <div>
                    <div className="text-[15px] font-semibold text-admin-ink">{nanny.display_name}</div>
                    <div className="text-[12.5px] text-admin-ink-soft">{nanny.user_email}</div>
                  </div>
                </div>
                <div className="text-[14px] text-admin-ink-mid">{formatLocation(nanny.city, nanny.province, "not set")}</div>
                <div>
                  <span className="font-display text-[18px] text-admin-ink">
                    ${nanny.rate_per_hour}
                  </span>
                  <span className="text-[13px] text-admin-ink-soft font-normal">/hr</span>
                </div>
                <div className="flex items-center gap-2">
                  {nanny.rating_count > 0 ? (
                    <>
                      <AdminStars value={Math.round(nanny.rating_avg)} />
                      <span className="text-[13.5px] text-admin-ink-mid font-medium">{nanny.rating_avg.toFixed(1)}</span>
                    </>
                  ) : (
                    <span className="text-[13.5px] text-admin-ink-mid font-medium">New</span>
                  )}
                </div>
                <div>
                  <AdminPill tone={statusTone(nanny)}>
                    {nanny.user_is_active ? statusLabel(nanny.verification_status) : "suspended"}
                  </AdminPill>
                </div>
              </div>

              <div className="flex items-start justify-between gap-3 xl:hidden">
                <div className="flex min-w-0 items-start gap-[14px]">
                  <AdminAvatar initials={initialsFor(nanny)} size={40} tone={nanny.user_is_active ? "clay" : "muted"} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[15px] font-semibold text-admin-ink">{nanny.display_name}</div>
                    <div className="truncate text-[12.5px] text-admin-ink-soft">{nanny.user_email}</div>
                  </div>
                </div>
                <div className="shrink-0">
                  <AdminPill tone={statusTone(nanny)}>
                    {nanny.user_is_active ? statusLabel(nanny.verification_status) : "suspended"}
                  </AdminPill>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-admin-ink-mid xl:hidden">
                <span>{formatLocation(nanny.city, nanny.province, "not set")}</span>
                <span>
                  <span className="font-display text-[17px] text-admin-ink">${nanny.rate_per_hour}</span>
                  <span className="text-admin-ink-soft">/hr</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  {nanny.rating_count > 0 ? (
                    <>
                      <AdminStars value={Math.round(nanny.rating_avg)} />
                      <span>{nanny.rating_avg.toFixed(1)}</span>
                    </>
                  ) : (
                    <span>New</span>
                  )}
                </span>
              </div>

              <div onClick={(event) => event.stopPropagation()} className="flex flex-wrap gap-2 border-t border-admin-border-soft pt-3 xl:border-t-0 xl:pt-0 xl:justify-end">
                <button disabled={!canVerify || isBusy} onClick={() => onVerify(nanny.id)} className={cn(btnApproveCls, (!canVerify || isBusy) && "opacity-55")}>
                  Verify
                </button>
                <button disabled={!nanny.user_is_active || isBusy} onClick={() => onReject(nanny)} className={cn(btnGhostSmCls, (!nanny.user_is_active || isBusy) && "opacity-55")}>
                  Reject
                </button>
                <button disabled={!nanny.user_is_active || isBusy} onClick={() => onSuspend(nanny)} className={cn(btnDangerCls, (!nanny.user_is_active || isBusy) && "opacity-55")}>
                  Suspend
                </button>
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
}
