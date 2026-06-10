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

import { cn } from "@/lib/utils";

const labelCls = "text-[12px] font-medium text-brand-faint block mb-[6px] uppercase tracking-[0.06em]";
const inputCls = "w-full border-[1.5px] border-brand-border rounded-[9px] px-[14px] py-[11px] text-[14px] outline-none bg-[var(--bg-warm)] text-[var(--brand-text)] [font-family:inherit]";

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
        <div className="flex gap-3 pb-5">
          <Avatar initials={initials} size={68} />
          <div>
            <div className="font-bold text-[20px]">{profile.display_name}</div>
            <div className="text-brand-faint text-[14px] mt-[2px]">{displayEmail}</div>
            <div className="flex flex-col md:flex-row items-start gap-[6px] mt-3.5">
              {profileComplete && (
                <span className="bg-teal-lt text-teal border border-teal-mid rounded-[20px] px-[10px] py-[2px] text-[12px] font-medium">
                  Verified parent
                </span>
              )}
              <span className="text-[12px] text-brand-faint">
                Member since {formatMonthYear(profile.created_at)}
              </span>
            </div>
          </div>
        </div>
        <button
          className="btn-outline px-4 py-2 text-[13px]"
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
        <div
          className="grid"
          style={{ gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr" }}
        >
          {(
            [
              ["Display name", profile.display_name],
              ["Email", displayEmail],
              ["Phone", displayPhone],
              ["City", displayCity],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="py-[10px] border-b border-brand-border">
              <div className="text-[11.5px] text-brand-faint uppercase tracking-[0.07em] mb-[3px]">
                {label}
              </div>
              <div className="text-[14px] font-medium">{value}</div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="grid gap-x-4"
          style={{ gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr" }}
        >
          <div>
            <label className={labelCls}>Phone</label>
            <input
              value={profileDraft.phone}
              onChange={(event) => updateDraft("phone", event.target.value)}
              className={cn(inputCls, "mb-4")}
            />
          </div>
          <div>
            <label className={labelCls}>Province</label>
            <select
              value={profileDraft.province}
              onChange={(event) => handleProvinceChange(event.target.value)}
              className={cn(inputCls, "mb-4")}
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
            <label className={labelCls}>City</label>
            {usesFreeTextCity ? (
              <input
                value={profileDraft.city}
                placeholder="Enter city"
                onChange={(event) => updateDraft("city", event.target.value)}
                className={cn(inputCls, "mb-4")}
              />
            ) : (
              <select
                value={profileDraft.city}
                disabled={!profileDraft.province}
                onChange={(event) => updateDraft("city", event.target.value)}
                className={cn(inputCls, "mb-4")}
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
            <label className={labelCls}>Children ages</label>
            <div className="flex gap-[10px] flex-wrap mb-3">
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
                  className={cn(inputCls, "w-[84px]")}
                />
              ))}
              <button
                className="btn-outline self-start px-[14px] py-[9px] text-[13px] border-dashed"
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
            className="btn-cta w-fit text-[14px] px-5 py-[10px]"
            style={{ gridColumn: isMobile ? "span 1" : "span 2" }}
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
            <div
              className="text-[#c0392b] text-[13px]"
              style={{ gridColumn: isMobile ? "span 1" : "span 2" }}
            >
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
