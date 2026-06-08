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
      <div className="flex flex-col gap-4 sm:grid sm:grid-cols-[56px_minmax(0,1fr)_minmax(160px,auto)] sm:items-start sm:gap-x-[18px]">
        <div className="flex items-start gap-4 sm:contents">
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
            <div className="mt-[7px] flex flex-wrap items-center gap-2 text-[13.5px]" style={{ color: A.inkSoft }}>
              <span style={{ color: A.clay, display: "flex" }}>
                <PinIcon />
              </span>
              <span>{applicant.city}</span>
              <span style={{ opacity: 0.5 }}>·</span>
              <span>Submitted {applicant.submitted}</span>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 sm:col-start-3 sm:row-start-1 sm:w-auto sm:items-end sm:gap-[14px]">
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
            <button className="w-full sm:w-auto" disabled={isBusy} onClick={onStart} style={{ ...btnPrimary, opacity: isBusy ? 0.65 : 1 }}>
              Start review <ArrowSmIcon />
            </button>
          ) : canReset ? (
            <button className="w-full sm:w-auto" disabled={isBusy} onClick={onReset} style={{ ...btnGhostSm, opacity: isBusy ? 0.65 : 1 }}>
              Reset
            </button>
          ) : (
            <button className="w-full sm:w-auto" disabled style={{ ...btnPrimary, opacity: 0.65, cursor: "not-allowed" }}>
              In review <ArrowSmIcon />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 sm:col-start-2 sm:mt-[2px] sm:gap-[10px]">
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

        <div className="min-w-0 sm:col-start-2 sm:col-span-2">
          <div style={{ color: A.ink, fontSize: 13, fontWeight: 700 }}>
            Uploaded documents ({applicant.documents.length})
          </div>
          <div className="max-h-[180px] overflow-y-auto pr-1 sm:max-h-none sm:overflow-visible sm:pr-0">
            <AdminNannyDocumentsList documents={applicant.documents} compact />
          </div>
        </div>
      </div>
    </div>
  );
}
