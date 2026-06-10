import AdminAvatar from "../compositions/AdminAvatar";
import AdminNannyDocumentsList from "../compositions/AdminNannyDocumentsList";
import AdminStepChip from "../compositions/AdminStepChip";
import { TimerIcon, PinIcon, ArrowSmIcon } from "../compositions/admin-icons";
import { btnGhostSmCls, cardCls } from "../compositions/admin-styles";
import { cn } from "@/lib/utils";
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
    <div className={cardCls}>
      <div className="flex flex-col gap-4 xl:grid xl:grid-cols-[56px_minmax(0,1fr)_minmax(160px,auto)] xl:items-start xl:gap-x-[18px]">
        <div className="flex items-start gap-4 xl:contents">
          <AdminAvatar initials={applicant.initials} size={56} />
          <div className="flex-1 min-w-0">
            <div className="font-display text-[22px] text-admin-ink leading-[1.1]">
              {applicant.name}
            </div>
            <div className="mt-[7px] flex flex-wrap items-center gap-2 text-[13.5px] text-admin-ink-soft">
              <span className="flex text-admin-clay">
                <PinIcon />
              </span>
              <span>{applicant.city}</span>
              <span className="opacity-50">·</span>
              <span>Submitted {applicant.submitted}</span>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-nowrap items-center justify-between gap-3 xl:col-start-3 xl:row-start-1 xl:w-auto xl:flex-col xl:items-end xl:justify-start xl:gap-[14px]">
          <div className={cn("inline-flex min-w-0 items-center gap-[6px] text-[13px] font-semibold xl:text-[13.5px]", urgent ? "text-admin-red" : "text-admin-amber")}>
            <span className="flex">
              <TimerIcon />
            </span>
            <span className="truncate">Waiting {applicant.waiting} day{applicant.waiting > 1 ? "s" : ""}</span>
          </div>
          {applicant.status === "pending" ? (
            <button className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-[9px] border border-black bg-admin-clay px-3 py-2 text-[13px] font-semibold text-black xl:gap-2 xl:rounded-[10px] xl:px-[22px] xl:py-[11px] xl:text-[14px]", isBusy && "opacity-65")} disabled={isBusy} onClick={onStart}>
              Start review <ArrowSmIcon />
            </button>
          ) : canReset ? (
            <button className={cn("shrink-0", btnGhostSmCls, isBusy && "opacity-65")} disabled={isBusy} onClick={onReset}>
              Reset
            </button>
          ) : (
            <button
              className="inline-flex shrink-0 cursor-not-allowed items-center gap-1.5 rounded-[9px] border border-admin-red bg-admin-card px-3 py-2 text-[13px] font-semibold text-admin-red opacity-65 xl:gap-2 xl:rounded-[10px] xl:px-[22px] xl:py-[11px] xl:text-[14px]"
              disabled
            >
              In review <ArrowSmIcon />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 xl:col-start-2 xl:mt-[2px] xl:gap-[10px]">
          {(["docs", "refs", "interview"] as const).map((key) => (
            <button
              key={key}
              disabled={!canUpdateSteps || isBusy}
              onClick={() => onToggle(key)}
              className={cn(
                "[all:unset]",
                canUpdateSteps && !isBusy ? "cursor-pointer" : "cursor-not-allowed",
                !canUpdateSteps && "opacity-60",
              )}
            >
              <AdminStepChip
                label={key === "docs" ? "Docs reviewed" : key === "refs" ? "References checked" : "Interview done"}
                done={steps[key]}
              />
            </button>
          ))}
        </div>

        <div className="min-w-0 xl:col-start-2 xl:col-span-2">
          <div className="text-admin-ink text-[13px] font-bold">
            Uploaded documents ({applicant.documents.length})
          </div>
          <div className="max-h-[180px] overflow-y-auto pr-1 xl:max-h-none xl:overflow-visible xl:pr-0">
            <AdminNannyDocumentsList documents={applicant.documents} compact />
          </div>
        </div>
      </div>
    </div>
  );
}
