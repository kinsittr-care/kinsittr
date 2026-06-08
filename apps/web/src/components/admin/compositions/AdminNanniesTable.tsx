import AdminAvatar from "./AdminAvatar";
import { btnApprove, btnDanger, btnGhostSm } from "./admin-styles";
import AdminStars from "./AdminStars";
import AdminPill, { type PillTone } from "./AdminPill";
import { A } from "../tokens";
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
    <div style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 16, overflow: "hidden", boxShadow: A.shadow }}>
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
          textTransform: "uppercase",
          color: A.inkSoft,
        }}
      >
        <div>Nanny</div>
        <div>City</div>
        <div>Rate</div>
        <div>Rating</div>
        <div>Status</div>
        <div style={{ textAlign: "right" }}>Actions</div>
      </div>

      {isLoading ? (
        <div style={{ padding: 24, color: A.inkSoft }}>Loading nannies...</div>
      ) : nannies.length === 0 ? (
        <div style={{ padding: 24, color: A.inkSoft }}>No nannies found.</div>
      ) : (
        nannies.map((nanny, index) => {
          const isBusy = busyIds.has(nanny.id);
          const canVerify = canVerifyNanny(nanny);

          return (
            <div
              key={nanny.id}
              className="admin-table-row"
              onClick={() => onSelect(nanny.id)}
              style={{
                display: "grid",
                gridTemplateColumns: colTemplate,
                alignItems: "center",
                padding: "16px 24px",
                gap: 12,
                borderBottom: index < nannies.length - 1 ? `1px solid ${A.borderSoft}` : "none",
                background: selectedNannyId === nanny.id ? A.cardWarm : "transparent",
                cursor: "pointer",
                transition: "background .15s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <AdminAvatar initials={initialsFor(nanny)} size={40} tone={nanny.user_is_active ? "clay" : "muted"} />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: A.ink }}>{nanny.display_name}</div>
                  <div style={{ fontSize: 12.5, color: A.inkSoft }}>{nanny.user_email}</div>
                </div>
              </div>
              <div style={{ fontSize: 14, color: A.inkMid }}>{formatLocation(nanny.city, nanny.province, "not set")}</div>
              <div>
                <span style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 18, color: A.ink }}>
                  ${nanny.rate_per_hour}
                </span>
                <span style={{ fontSize: 13, color: A.inkSoft, fontWeight: 400 }}>/hr</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <AdminStars value={Math.round(nanny.rating_avg)} />
                <span style={{ fontSize: 13.5, color: A.inkMid, fontWeight: 500 }}>{nanny.rating_avg.toFixed(1)}</span>
              </div>
              <div>
                <AdminPill tone={statusTone(nanny)}>
                  {nanny.user_is_active ? statusLabel(nanny.verification_status) : "suspended"}
                </AdminPill>
              </div>
              <div onClick={(event) => event.stopPropagation()} style={{ display: "flex", justifyContent: "flex-end", gap: 8, flexWrap: "wrap" }}>
                <button disabled={!canVerify || isBusy} onClick={() => onVerify(nanny.id)} style={{ ...btnApprove, opacity: canVerify && !isBusy ? 1 : 0.55 }}>
                  Verify
                </button>
                <button disabled={!nanny.user_is_active || isBusy} onClick={() => onReject(nanny)} style={{ ...btnGhostSm, opacity: nanny.user_is_active && !isBusy ? 1 : 0.55 }}>
                  Reject
                </button>
                <button disabled={!nanny.user_is_active || isBusy} onClick={() => onSuspend(nanny)} style={{ ...btnDanger, opacity: nanny.user_is_active && !isBusy ? 1 : 0.55 }}>
                  Suspend
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
