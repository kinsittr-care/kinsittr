"use client";

import { useState } from "react";
import Avatar from "../dashboard/Avatar";
import SectionCard from "./SectionCard";
import { useIsMobile } from "../dashboard/useIsMobile";
import type { ParentProfile, UpdateParentProfilePayload } from "@/src/types/api/api";
import { getStoredAuthSession } from "@/src/utils/api/session";

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
  city: string;
  province: string;
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
  const session = getStoredAuthSession();
  const user = session?.user;
  const displayEmail = user?.email ?? "Not provided";
  const displayPhone = user?.phone || "Not provided";
  const displayCity = `${profile.city}, ${profile.province}`;
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
          <button
            className="btn-cta"
            style={{ gridColumn: isMobile ? "span 1" : "span 2", width: "fit-content", fontSize: 14, padding: "10px 20px" }}
            disabled={isSaving}
            onClick={async () => {
              const updated = await onSave({
                display_name: profileDraft.display_name,
                num_children: profile.num_children,
                children_ages: profile.children_ages,
                city: profileDraft.city,
                province: profileDraft.province,
              });
              if (updated) {
                setEditProfile(false);
              }
            }}
          >
            {isSaving ? "Saving..." : "Save changes"}
          </button>
          {errorMessage && (
            <div style={{ gridColumn: isMobile ? "span 1" : "span 2", color: "#c0392b", fontSize: 13 }}>
              {errorMessage}
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
    city: profile.city,
    province: profile.province,
  };
}

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return `${parts[0]?.[0] ?? "P"}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

function formatMonthYear(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "recently";
  return new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(date);
}
