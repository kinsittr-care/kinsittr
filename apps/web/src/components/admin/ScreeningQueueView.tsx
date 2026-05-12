"use client";

import { useState } from "react";
import AdminPageHeader from "./AdminPageHeader";
import ScreeningCard, { type Steps } from "./screening/ScreeningCard";
import { btnGhost } from "./admin-styles";

const SCREENING = [
  {
    id: 1,
    name: "Tanya Volkov",
    initials: "TV",
    city: "Ottawa, ON",
    submitted: "Apr 6, 2026",
    waiting: 2,
    steps: { docs: true, refs: false, interview: false },
  },
  {
    id: 2,
    name: "James Adeyemi",
    initials: "JA",
    city: "Toronto, ON",
    submitted: "Apr 5, 2026",
    waiting: 3,
    steps: { docs: true, refs: true, interview: false },
  },
  {
    id: 3,
    name: "Sophie Tremblay",
    initials: "ST",
    city: "Quebec City, QC",
    submitted: "Apr 4, 2026",
    waiting: 4,
    steps: { docs: false, refs: false, interview: false },
  },
];

export default function ScreeningQueueView() {
  const [steps, setSteps] = useState<Record<number, Steps>>(
    Object.fromEntries(SCREENING.map((n) => [n.id, { ...n.steps }])),
  );

  const toggle = (id: number, key: keyof Steps) =>
    setSteps((s) => ({ ...s, [id]: { ...s[id], [key]: !s[id][key] } }));

  return (
    <>
      <AdminPageHeader
        title="Screening Queue"
        subtitle="3 nannies awaiting review · Target: 24–48hr turnaround"
        right={
          <div style={{ display: "flex", gap: 10 }}>
            <button style={btnGhost}>Filter</button>
            <button style={btnGhost}>Export CSV</button>
          </div>
        }
      />
      <div
        style={{
          padding: "24px 40px 40px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {SCREENING.map((n) => (
          <ScreeningCard
            key={n.id}
            applicant={n}
            steps={steps[n.id]}
            onToggle={(key) => toggle(n.id, key)}
          />
        ))}
      </div>
    </>
  );
}
