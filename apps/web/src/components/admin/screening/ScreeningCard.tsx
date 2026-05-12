import { A } from "../tokens";
import AdminAvatar from "../AdminAvatar";
import AdminStepChip from "../AdminStepChip";
import { TimerIcon, PinIcon, ArrowSmIcon } from "../admin-icons";
import { btnPrimary } from "../admin-styles";

export type Steps = { docs: boolean; refs: boolean; interview: boolean };

export type ScreeningApplicant = {
  id: number;
  name: string;
  initials: string;
  city: string;
  submitted: string;
  waiting: number;
};

export default function ScreeningCard({
  applicant,
  steps,
  onToggle,
}: {
  applicant: ScreeningApplicant;
  steps: Steps;
  onToggle: (key: keyof Steps) => void;
}) {
  const urgent = applicant.waiting >= 3;

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
                onClick={() => onToggle(key)}
                style={{ all: "unset", cursor: "pointer" }}
              >
                <AdminStepChip
                  label={key === "docs" ? "Docs reviewed" : key === "refs" ? "References checked" : "Interview done"}
                  done={steps[key]}
                />
              </button>
            ))}
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
          <button style={btnPrimary}>
            Review <ArrowSmIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
