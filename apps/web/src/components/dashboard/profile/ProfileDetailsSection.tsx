"use client";

import { useState } from "react";
import Avatar from "../Avatar";
import SectionCard from "./SectionCard";

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

type Profile = { name: string; email: string; phone: string; city: string };

export default function ProfileDetailsSection() {
  const [editProfile, setEditProfile] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    name: "Jordan Lee",
    email: "jordan.lee@email.com",
    phone: "+1 (647) 555-0182",
    city: "Toronto, ON",
  });
  const [profileDraft, setProfileDraft] = useState<Profile>({ ...profile });

  return (
    <SectionCard title="Profile">
      <div
        className="flex items-center gap-5"
        style={{
          marginBottom: 20,
          paddingBottom: 20,
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Avatar initials="JL" size={68} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 20 }}>{profile.name}</div>
          <div style={{ color: "var(--muted)", fontSize: 14, marginTop: 2 }}>{profile.email}</div>
          <div className="flex items-center gap-[6px]" style={{ marginTop: 6 }}>
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
            <span style={{ fontSize: 12, color: "var(--faint)" }}>Member since Jan 2025</span>
          </div>
        </div>
        <button
          className="btn-outline"
          style={{ marginLeft: "auto", padding: "8px 16px", fontSize: 13 }}
          onClick={() => setEditProfile((prev) => !prev)}
        >
          {editProfile ? "Cancel" : "Edit profile"}
        </button>
      </div>

      {!editProfile ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          {(
            [
              ["Full name", profile.name],
              ["Email", profile.email],
              ["Phone", profile.phone],
              ["City", profile.city],
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
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          {(
            [
              ["Full name", "name"],
              ["Email", "email"],
              ["Phone", "phone"],
              ["City", "city"],
            ] as [string, keyof Profile][]
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
            style={{ gridColumn: "span 2", width: "fit-content", fontSize: 14, padding: "10px 20px" }}
            onClick={() => {
              setProfile(profileDraft);
              setEditProfile(false);
            }}
          >
            Save changes
          </button>
        </div>
      )}
    </SectionCard>
  );
}
