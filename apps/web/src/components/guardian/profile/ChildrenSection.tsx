"use client";

import { useState } from "react";
import type { ParentProfile } from "@/src/types/api/api";
import Avatar from "../dashboard/Avatar";
import SectionCard from "./SectionCard";

const childCardCls = "bg-teal-lt border border-teal-mid rounded-[10px] px-[14px] py-2";
const inputCls = "w-[84px] border-[1.5px] border-brand-border rounded-[9px] px-3 py-[9px] text-[14px] outline-none bg-[var(--bg-warm)] text-[var(--brand-text)]";

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
        <div className="flex gap-[10px] flex-wrap mb-[14px]">
          {childrenAges.map((age, index) => (
            <div
              key={`${age}-${index}`}
              className={`flex items-center gap-2 ${childCardCls}`}
            >
              <Avatar initials={String(index + 1)} size={30} />
              <div>
                <div className="text-[13px] font-semibold text-[var(--teal-dk)]">
                  Child {index + 1}
                </div>
                <div className="text-[11.5px] text-[var(--faint)]">
                  {age} {age === 1 ? "yr" : "yrs"}
                </div>
              </div>
            </div>
          ))}
          <button
            className="btn-outline px-4 py-2 text-[13px] border-dashed"
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
          <div className="flex gap-[10px] flex-wrap mb-[14px]">
            {ageDrafts.map((age, index) => (
              <label key={index} className="flex flex-col gap-[6px] text-[12px] text-[var(--faint)]">
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
                  className={inputCls}
                />
              </label>
            ))}
            <button
              className="btn-outline self-end px-[14px] py-[9px] text-[13px] border-dashed"
              onClick={() => setAgeDrafts((current) => [...current, "0"])}
            >
              + Add child
            </button>
          </div>
          {error && <div className="text-[#c0392b] text-[13px] mb-[10px]">{error}</div>}
          <div className="flex gap-2">
            <button
              className="btn-cta text-[14px] px-[18px] py-[10px]"
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
              className="btn-outline text-[14px] px-[18px] py-[10px]"
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
