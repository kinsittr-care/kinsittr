"use client";

import { useState } from "react";
import Avatar from "../dashboard/Avatar";
import SectionCard from "./SectionCard";
import { useIsMobile } from "../dashboard/useIsMobile";
import type { ParentProfile, UpdateParentProfilePayload } from "@/src/types/api/api";
import { getStoredAuthSession } from "@/src/utils/api/session";
import { formatLocation, formatLocationPart, formatMonthYear } from "@/src/utils/format";
import {
  CITIES_BY_PROVINCE,
  PROVINCE_OPTIONS,
  TESTING_PROVINCE,
} from "@/src/components/nanny/profile/nannyProfileHelpers";

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  color: "var(--faint)",
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
  const displayEmail = user?.email ?? "not set";
  const displayPhone = profile.phone || user?.phone || "not set";
  const displayCity = formatLocation(profile.city, profile.province, "not set");
  const initials = initialsFromName(profile.display_name);
  const profileComplete = isParentProfileComplete(profile, user?.phone ?? "");
  const cityOptions = cityOptionsForProvince(profileDraft.province, profileDraft.city);
  const usesFreeTextCity = profileDraft.province === TESTING_PROVINCE;

  const updateDraft = <TKey extends keyof ProfileDraft>(key: TKey, value: ProfileDraft[TKey]) => {
    setProfileDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleProvinceChange = (province: string) => {
    setProfileDraft((prev) => ({
      ...prev,
      province,
      city: "",
    }));
  };

  return (
    <SectionCard title="Profile">
      <div className="flex flex-col items-start gap-4 border-b border-brand-border pb-5 mb-5 md:flex-row md:items-center md:gap-5">
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
              {profileComplete && (
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
              )}
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
          <div>
            <label style={labelStyle}>Phone</label>
            <input
              value={profileDraft.phone}
              onChange={(event) => updateDraft("phone", event.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Province</label>
            <select
              value={profileDraft.province}
              onChange={(event) => handleProvinceChange(event.target.value)}
              style={inputStyle}
            >
              <option value="">Select province</option>
              {provinceOptionsForValue(profileDraft.province).map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>City</label>
            {usesFreeTextCity ? (
              <input
                value={profileDraft.city}
                placeholder="Enter city"
                onChange={(event) => updateDraft("city", event.target.value)}
                style={inputStyle}
              />
            ) : (
              <select
                value={profileDraft.city}
                disabled={!profileDraft.province}
                onChange={(event) => updateDraft("city", event.target.value)}
                style={inputStyle}
              >
                <option value="">{profileDraft.province ? "Select city" : "Select province first"}</option>
                {cityOptions.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            )}
          </div>
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
                display_name: profile.display_name,
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
  const childrenAges = normalizeChildrenAges(profile.children_ages);
  return {
    phone: profile.phone,
    city: formatLocationPart(profile.city),
    province: formatLocationPart(profile.province),
    children_ages: childrenAges.length ? childrenAges.map((age) => String(age)) : ["0"],
  };
}

function normalizeChildrenAges(childrenAges: ParentProfile["children_ages"]) {
  return Array.isArray(childrenAges) ? childrenAges : [];
}

function isParentProfileComplete(profile: ParentProfile, userPhone: string) {
  return Boolean(
    profile.display_name.trim() &&
      (profile.phone.trim() || userPhone.trim()) &&
      profile.city.trim() &&
      profile.province.trim() &&
      normalizeChildrenAges(profile.children_ages).length > 0,
  );
}

function provinceOptionsForValue(value: string) {
  if (!value || PROVINCE_OPTIONS.includes(value)) {
    return PROVINCE_OPTIONS;
  }
  return [value, ...PROVINCE_OPTIONS];
}

function cityOptionsForProvince(province: string, city: string) {
  const options = CITIES_BY_PROVINCE[province] ?? [];
  if (!city || options.includes(city)) {
    return options;
  }
  return [city, ...options];
}

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return `${parts[0]?.[0] ?? "P"}${parts[1]?.[0] ?? ""}`.toUpperCase();
}
