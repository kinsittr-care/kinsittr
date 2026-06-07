import { A } from "../tokens";
import AdminAvatar from "../compositions/AdminAvatar";
import AdminNannyDocumentsList from "../compositions/AdminNannyDocumentsList";
import AdminStepChip from "../compositions/AdminStepChip";
import { TimerIcon, PinIcon, ArrowSmIcon } from "../compositions/admin-icons";
import { btnGhostSm, btnPrimary } from "../compositions/admin-styles";
import type { AdminNannyDocument, AdminVerificationStatus } from "@/src/types/api/admin";

export type Steps = { docs: boolean; refs: boolean; interview: boolean };

export type ScreeningApplicant = {
  id: string;
  name: string;
  initials: string;
  city: string;
  submitted: string;
  waiting: number;
  status: AdminVerificationStatus;
  documents: AdminNannyDocument[];
};

export default function ScreeningCard({
  applicant,
  isBusy = false,
  onReset,
  onStart,
  steps,
  onToggle,
}: {
  applicant: ScreeningApplicant;
  isBusy?: boolean;
  onReset: () => void;
  onStart: () => void;
  steps: Steps;
  onToggle: (key: keyof Steps) => void;
}) {
  const urgent = applicant.waiting >= 3;
  const canUpdateSteps = applicant.status === "under_review";
  const canReset = applicant.status === "rejected";

  return (
    <div
      style={{
        background: A.card,
        border: `1px solid ${A.border}`,
        borderRadius: 16,
        padding: "22px 24px",
        boxShadow: A.shadow,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 18 }}>
        <AdminAvatar initials={applicant.initials} size={56} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "var(--font-dm-serif), serif",
              fontSize: 22,
              color: A.ink,
              lineHeight: 1.1,
            }}
          >
            {applicant.name}
          </div>
          <div
            style={{
              marginTop: 7,
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13.5,
              color: A.inkSoft,
            }}
          >
            <span style={{ color: A.clay, display: "flex" }}>
              <PinIcon />
            </span>
            {applicant.city}
            <span style={{ opacity: 0.5 }}>·</span>
            Submitted {applicant.submitted}
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 18,
              flexWrap: "wrap",
            }}
          >
            {(["docs", "refs", "interview"] as const).map((key) => (
              <button
                key={key}
                disabled={!canUpdateSteps || isBusy}
                onClick={() => onToggle(key)}
                style={{
                  all: "unset",
                  cursor: canUpdateSteps && !isBusy ? "pointer" : "not-allowed",
                  opacity: canUpdateSteps ? 1 : 0.6,
                }}
              >
                <AdminStepChip
                  label={key === "docs" ? "Docs reviewed" : key === "refs" ? "References checked" : "Interview done"}
                  done={steps[key]}
                />
              </button>
            ))}
          </div>
          <div style={{ marginTop: 18 }}>
            <div style={{ color: A.ink, fontSize: 13, fontWeight: 700 }}>
              Uploaded documents ({applicant.documents.length})
            </div>
            <AdminNannyDocumentsList documents={applicant.documents} compact />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 14,
            minWidth: 160,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13.5,
              fontWeight: 600,
              color: urgent ? A.red : A.amber,
            }}
          >
            <span style={{ display: "flex" }}>
              <TimerIcon />
            </span>
            Waiting {applicant.waiting} day{applicant.waiting > 1 ? "s" : ""}
          </div>
          {applicant.status === "pending" ? (
            <button disabled={isBusy} onClick={onStart} style={{ ...btnPrimary, opacity: isBusy ? 0.65 : 1 }}>
              Start review <ArrowSmIcon />
            </button>
          ) : canReset ? (
            <button disabled={isBusy} onClick={onReset} style={{ ...btnGhostSm, opacity: isBusy ? 0.65 : 1 }}>
              Reset
            </button>
          ) : (
            <button disabled style={{ ...btnPrimary, opacity: 0.65, cursor: "not-allowed" }}>
              In review <ArrowSmIcon />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
