"use client";

import { useState } from "react";
import type { ParentProfile } from "@/src/types/api/api";
import Avatar from "../dashboard/Avatar";
import SectionCard from "./SectionCard";

const childCardStyle: React.CSSProperties = {
  background: "var(--teal-lt)",
  border: "1px solid var(--teal-mid)",
  borderRadius: 10,
  padding: "8px 14px",
};

const inputStyle: React.CSSProperties = {
  width: 84,
  border: "1.5px solid var(--border)",
  borderRadius: 9,
  padding: "9px 12px",
  fontSize: 14,
  outline: "none",
  background: "var(--bg-warm)",
  color: "var(--brand-text)",
};

interface ChildrenSectionProps {
  profile: ParentProfile;
  isSaving: boolean;
  onSave: (childrenAges: number[]) => Promise<ParentProfile | undefined>;
}

export default function ChildrenSection({ profile, isSaving, onSave }: ChildrenSectionProps) {
  const childrenAges = normalizeChildrenAges(profile.children_ages);
  const [isEditing, setIsEditing] = useState(false);
  const [ageDrafts, setAgeDrafts] = useState<string[]>(() =>
    childrenAges.map((age) => String(age)),
  );
  const [error, setError] = useState<string | null>(null);

  return (
    <SectionCard title="Children">
      {!isEditing ? (
        <div className="flex gap-[10px] flex-wrap" style={{ marginBottom: 14 }}>
          {childrenAges.map((age, index) => (
            <div
              key={`${age}-${index}`}
              className="flex items-center gap-2"
              style={childCardStyle}
            >
              <Avatar initials={String(index + 1)} size={30} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--teal-dk)" }}>
                  Child {index + 1}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--muted)" }}>
                  {age} {age === 1 ? "yr" : "yrs"}
                </div>
              </div>
            </div>
          ))}
          <button
            className="btn-outline"
            style={{ padding: "8px 16px", fontSize: 13, borderStyle: "dashed" }}
            onClick={() => {
              setAgeDrafts(childrenAges.map((age) => String(age)));
              setIsEditing(true);
              setError(null);
            }}
          >
            Edit children
          </button>
        </div>
      ) : (
        <div>
          <div className="flex gap-[10px] flex-wrap" style={{ marginBottom: 14 }}>
            {ageDrafts.map((age, index) => (
              <label key={index} style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: "var(--muted)" }}>
                Child {index + 1} age
                <input
                  type="number"
                  min={0}
                  max={18}
                  value={age}
                  onChange={(event) =>
                    setAgeDrafts((current) =>
                      current.map((value, draftIndex) =>
                        draftIndex === index ? event.target.value : value,
                      ),
                    )
                  }
                  style={inputStyle}
                />
              </label>
            ))}
            <button
              className="btn-outline"
              style={{ alignSelf: "end", padding: "9px 14px", fontSize: 13, borderStyle: "dashed" }}
              onClick={() => setAgeDrafts((current) => [...current, "0"])}
            >
              + Add child
            </button>
          </div>
          {error && <div style={{ color: "#c0392b", fontSize: 13, marginBottom: 10 }}>{error}</div>}
          <div className="flex gap-2">
            <button
              className="btn-cta"
              style={{ fontSize: 14, padding: "10px 18px" }}
              disabled={isSaving}
              onClick={async () => {
                const ages = ageDrafts.map((age) => Number(age));
                if (!ages.length || ages.some((age) => !Number.isInteger(age) || age < 0 || age > 18)) {
                  setError("Enter at least one child age between 0 and 18.");
                  return;
                }

                const updated = await onSave(ages);
                if (updated) {
                  setIsEditing(false);
                  setError(null);
                }
              }}
            >
              {isSaving ? "Saving..." : "Save children"}
            </button>
            <button
              className="btn-outline"
              style={{ fontSize: 14, padding: "10px 18px" }}
              onClick={() => {
                setAgeDrafts(childrenAges.map((age) => String(age)));
                setIsEditing(false);
                setError(null);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </SectionCard>
  );
}

function normalizeChildrenAges(childrenAges: ParentProfile["children_ages"]) {
  return Array.isArray(childrenAges) ? childrenAges : [];
}
