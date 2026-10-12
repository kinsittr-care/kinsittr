import AdminAvatar from "../compositions/AdminAvatar";
import AdminNannyDocumentsList from "../compositions/AdminNannyDocumentsList";
import { PinIcon, ArrowSmIcon } from "../compositions/admin-icons";
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
    <div className={cn(cardCls, "rounded-[28px] px-5 py-6 sm:px-7 lg:px-9 lg:py-8")}>
      <div className="grid gap-7">
        <div className="grid grid-cols-[64px_minmax(0,1fr)] gap-4 lg:grid-cols-[72px_minmax(0,1fr)_auto] lg:gap-5">
          <AdminAvatar initials={applicant.initials} size={72} />
          <div className="min-w-0 pt-1">
            <div className="font-display text-[26px] leading-[1.08] text-admin-ink lg:text-[30px]">
              {applicant.name}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[15px] text-admin-ink-soft lg:text-[17px]">
              <span className="flex text-admin-clay">
                <PinIcon />
              </span>
              <span>{applicant.city}</span>
              <span className="opacity-50">·</span>
              <span>Submitted {applicant.submitted}</span>
            </div>
          </div>
          <div className={cn("col-span-2 inline-flex w-fit items-center justify-center rounded-full px-3.5 py-1.5 text-center text-[13px] font-bold leading-none lg:col-span-1 lg:self-start lg:justify-self-end", urgent ? "bg-admin-red-light text-admin-red" : "bg-admin-amber-light text-admin-amber")}>
            Waiting {applicant.waiting} day{applicant.waiting > 1 ? "s" : ""}
          </div>
        </div>

        <section className="grid gap-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="m-0 text-[20px] font-bold text-admin-ink">Screening checklist</h3>
            <span className="text-[15px] text-admin-ink-soft">
              {Object.values(steps).filter(Boolean).length} of 3 complete
            </span>
          </div>
          <div className="h-2 rounded-full bg-admin-border-soft" />
          <div className="grid gap-3 lg:grid-cols-3">
            {(["docs", "refs", "interview"] as const).map((key) => (
              <button
                key={key}
                disabled={!canUpdateSteps || isBusy}
                onClick={() => onToggle(key)}
                className={cn(
                  "flex min-h-15.5 items-center gap-3 rounded-[18px] border border-admin-border bg-admin-card px-4 text-left text-[15px] font-bold text-admin-ink transition-colors sm:text-[16px]",
                  steps[key] && "border-admin-green bg-admin-green-light text-admin-green",
                  canUpdateSteps && !isBusy ? "cursor-pointer hover:border-admin-clay" : "cursor-not-allowed",
                  !canUpdateSteps && "opacity-80",
                )}
              >
                <StepCircle done={steps[key]} />
                <span>{key === "docs" ? "Documents reviewed" : key === "refs" ? "References checked" : "Interview done"}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-4">
          <h3 className="m-0 text-[20px] font-bold text-admin-ink">
            Uploaded documents ({applicant.documents.length})
          </h3>
          <div className="rounded-[18px] border border-dashed border-admin-clay/50 px-5 py-5 sm:px-6">
            <div className="max-h-55 overflow-y-auto pr-1 lg:max-h-none lg:overflow-visible lg:pr-0">
              <AdminNannyDocumentsList documents={applicant.documents} compact />
            </div>
          </div>
        </section>

        <div className="border-t border-admin-border pt-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            {applicant.status === "pending" ? (
              <button className={cn("inline-flex items-center justify-center gap-2 rounded-[12px] border border-black bg-admin-clay px-5 py-3 text-[14px] font-semibold text-black", isBusy && "opacity-65")} disabled={isBusy} onClick={onStart}>
                Start review <ArrowSmIcon />
              </button>
            ) : canReset ? (
              <button className={cn("justify-center", btnGhostSmCls, isBusy && "opacity-65")} disabled={isBusy} onClick={onReset}>
                Reset
              </button>
            ) : (
              <button
                className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-[12px] border border-admin-red bg-admin-card px-5 py-3 text-[14px] font-semibold text-admin-red opacity-65"
                disabled
              >
                In review <ArrowSmIcon />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepCircle({ done }: { done: boolean }) {
  return (
    <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full border-[3px]", done ? "border-admin-green bg-admin-green text-white" : "border-admin-border bg-admin-card")}>
      {done && (
        <svg width="16" height="16" viewBox="0 0 14 14" aria-hidden="true">
          <path
            d="M2 7l3.5 3.5L12 3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
}
