"use client";

import { useState } from "react";
import Avatar from "../dashboard/Avatar";
import SectionCard from "./SectionCard";
import { useIsMobile } from "../dashboard/useIsMobile";
import type { ParentProfile, UpdateParentProfilePayload } from "@/src/types/api/api";
import { getStoredAuthSession } from "@/src/utils/api/session";
import { formatMonthYear } from "@/src/utils/format";

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  color: "var(--muted)",
  display: "block",
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1.5px solid var(--border)",
  borderRadius: 9,
  padding: "11px 14px",
  fontSize: 14,
  outline: "none",
  background: "var(--bg-warm)",
  color: "var(--brand-text)",
  fontFamily: "inherit",
  marginBottom: 16,
};

type ProfileDraft = {
  display_name: string;
  phone: string;
  city: string;
  province: string;
  children_ages: string[];
};

interface ProfileDetailsSectionProps {
  profile: ParentProfile;
  isSaving: boolean;
  errorMessage: string | null;
  onSave: (payload: UpdateParentProfilePayload) => Promise<ParentProfile | undefined>;
}

export default function ProfileDetailsSection({
  profile,
  isSaving,
  errorMessage,
  onSave,
}: ProfileDetailsSectionProps) {
  const isMobile = useIsMobile();
  const [editProfile, setEditProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState<ProfileDraft>(() => draftFromProfile(profile));
  const [draftError, setDraftError] = useState<string | null>(null);
  const session = getStoredAuthSession();
  const user = session?.user;
  const displayEmail = user?.email ?? "Not provided";
  const displayPhone = profile.phone || user?.phone || "Not provided";
  const displayCity = profile.city && profile.province ? `${profile.city}, ${profile.province}` : "Not provided";
  const initials = initialsFromName(profile.display_name);

  return (
    <SectionCard title="Profile">
      <div className="flex flex-col md:flex-row items-end md:items-center md:gap-5 border-b border-brand-border pb-5 mb-5">
        <div
          className="flex gap-3"
          style={{
            // marginBottom: 20,
            paddingBottom: 20,
          }}
        >
          <Avatar initials={initials} size={68} />
          <div className="">
            <div style={{ fontWeight: 700, fontSize: 20 }}>{profile.display_name}</div>
            <div style={{ color: "var(--faint)", fontSize: 14, marginTop: 2 }}>{displayEmail}</div>
            <div className="flex flex-col md:flex-row items-start gap-[6px] mt-3.5">
              <span
                style={{
                  background: "var(--teal-lt)",
                  color: "var(--teal)",
                  border: "1px solid var(--teal-mid)",
                  borderRadius: 20,
                  padding: "2px 10px",
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                Verified parent
              </span>
              <span style={{ fontSize: 12, color: "var(--faint)" }}>
                Member since {formatMonthYear(profile.created_at)}
              </span>
            </div>
          </div>
        </div>
        <button
          className="btn-outline"
          style={{ padding: "8px 16px", fontSize: 13 }}
          onClick={() => {
            if (!editProfile) {
              setProfileDraft(draftFromProfile(profile));
              setDraftError(null);
            }
            setEditProfile((prev) => !prev);
          }}
        >
          {editProfile ? "Cancel" : "Edit profile"}
        </button>
      </div>


      {!editProfile ? (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr" }}>
          {(
            [
              ["Display name", profile.display_name],
              ["Email", displayEmail],
              ["Phone", displayPhone],
              ["City", displayCity],
            ] as const
          ).map(([label, value]) => (
            <div key={label} style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <div
                style={{
                  fontSize: 11.5,
                  color: "var(--faint)",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  marginBottom: 3,
                }}
              >
                {label}
              </div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{value}</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "0 16px" }}>
          {(
            [
              ["Display name", "display_name"],
              ["Phone", "phone"],
              ["City", "city"],
              ["Province", "province"],
            ] as [string, keyof ProfileDraft][]
          ).map(([label, key]) => (
            <div key={key}>
              <label style={labelStyle}>{label}</label>
              <input
                value={profileDraft[key]}
                onChange={(event) =>
                  setProfileDraft((prev) => ({ ...prev, [key]: event.target.value }))
                }
                style={inputStyle}
              />
            </div>
          ))}
          <div style={{ gridColumn: isMobile ? "span 1" : "span 2" }}>
            <label style={labelStyle}>Children ages</label>
            <div className="flex gap-[10px] flex-wrap" style={{ marginBottom: 12 }}>
              {profileDraft.children_ages.map((age, index) => (
                <input
                  key={index}
                  aria-label={`Child ${index + 1} age`}
                  type="number"
                  min={0}
                  max={18}
                  value={age}
                  onChange={(event) =>
                    setProfileDraft((prev) => ({
                      ...prev,
                      children_ages: prev.children_ages.map((value, draftIndex) =>
                        draftIndex === index ? event.target.value : value,
                      ),
                    }))
                  }
                  style={{ ...inputStyle, width: 84, marginBottom: 0 }}
                />
              ))}
              <button
                className="btn-outline"
                style={{ alignSelf: "start", padding: "9px 14px", fontSize: 13, borderStyle: "dashed" }}
                type="button"
                onClick={() =>
                  setProfileDraft((prev) => ({
                    ...prev,
                    children_ages: [...prev.children_ages, "0"],
                  }))
                }
              >
                + Add child
              </button>
            </div>
          </div>
          <button
            className="btn-cta"
            style={{ gridColumn: isMobile ? "span 1" : "span 2", width: "fit-content", fontSize: 14, padding: "10px 20px" }}
            disabled={isSaving}
            onClick={async () => {
              const childrenAges = profileDraft.children_ages.map((age) => Number(age));
              if (
                !childrenAges.length ||
                childrenAges.some((age) => !Number.isInteger(age) || age < 0 || age > 18)
              ) {
                setDraftError("Enter at least one child age between 0 and 18.");
                return;
              }

              const updated = await onSave({
                display_name: profileDraft.display_name,
                phone: profileDraft.phone,
                num_children: childrenAges.length,
                children_ages: childrenAges,
                city: profileDraft.city,
                province: profileDraft.province,
              });
              if (updated) {
                setEditProfile(false);
                setDraftError(null);
              }
            }}
          >
            {isSaving ? "Saving..." : "Save changes"}
          </button>
          {(draftError || errorMessage) && (
            <div style={{ gridColumn: isMobile ? "span 1" : "span 2", color: "#c0392b", fontSize: 13 }}>
              {draftError || errorMessage}
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}

function draftFromProfile(profile: ParentProfile): ProfileDraft {
  return {
    display_name: profile.display_name,
    phone: profile.phone,
    city: profile.city,
    province: profile.province,
    children_ages: profile.children_ages.length ? profile.children_ages.map((age) => String(age)) : ["0"],
  };
}

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return `${parts[0]?.[0] ?? "P"}${parts[1]?.[0] ?? ""}`.toUpperCase();
}
