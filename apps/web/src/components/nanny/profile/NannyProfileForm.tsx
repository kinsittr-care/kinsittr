"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { NannyProfile, UpdateNannyProfilePayload } from "@/src/types/api/api";
import { ownNannyProfileQueryKey, updateOwnNannyProfile } from "@/src/utils/api/nanny";
import { btnGhost, btnPrimary, inputStyle, labelStyle } from "../nanny-styles";
import { N } from "../tokens";
import {
  BIO_LIMIT,
  CITIES_BY_PROVINCE,
  PROVINCE_OPTIONS,
  SPECIALTIES_TOTAL_LIMIT,
  SPECIALTY_MAX_COUNT,
  TESTING_PROVINCE,
  profileToPayload,
} from "./nannyProfileHelpers";
import { NannyProfileHeaderCard } from "./NannyProfileHeaderCard";

export default function NannyProfileForm({ profile }: { profile: NannyProfile }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<UpdateNannyProfilePayload>(() => profileToPayload(profile));
  const [specialtyText, setSpecialtyText] = useState(() => profile.specialties.join(", "));
  const [message, setMessage] = useState<string | null>(null);

  const updateMutation = useMutation({
    mutationFn: updateOwnNannyProfile,
    onSuccess: async () => {
      setMessage("Profile updated.");
      await queryClient.invalidateQueries({ queryKey: ownNannyProfileQueryKey() });
      await queryClient.invalidateQueries({ queryKey: ["auth-me"] });
    },
    onError: (error) => {
      setMessage(error instanceof Error ? error.message : "Unable to update profile.");
    },
  });

  const updateField = <TKey extends keyof UpdateNannyProfilePayload>(
    key: TKey,
    value: UpdateNannyProfilePayload[TKey],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (message) setMessage(null);
  };

  return (
    <>
      <NannyProfileHeaderCard profile={profile} />
      <BasicFields
        form={form}
        specialtyText={specialtyText}
        updateField={updateField}
        onSpecialtyTextChange={(value) => {
          const nextText = limitSpecialtyText(value, specialtyText);
          setSpecialtyText(nextText);
          updateField("specialties", parseSpecialties(nextText));
        }}
      />
      <BioField bio={form.bio} updateField={updateField} />
      <RateField rate={form.rate_per_hour} updateField={updateField} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button className="w-full sm:w-auto" style={btnPrimary} disabled={updateMutation.isPending} onClick={() => updateMutation.mutate(form)}>
          {updateMutation.isPending ? "Saving..." : "Save changes"}
        </button>
        <button className="w-full sm:w-auto" style={btnGhost}>Preview public profile</button>
        {message && (
          <span style={{ color: updateMutation.isError ? N.rose : N.green, fontSize: 13.5, fontWeight: 600 }}>
            {message}
          </span>
        )}
      </div>
    </>
  );
}

function BasicFields({
  form,
  specialtyText,
  updateField,
  onSpecialtyTextChange,
}: {
  form: UpdateNannyProfilePayload;
  specialtyText: string;
  updateField: <TKey extends keyof UpdateNannyProfilePayload>(key: TKey, value: UpdateNannyProfilePayload[TKey]) => void;
  onSpecialtyTextChange: (value: string) => void;
}) {
  const cityOptions = cityOptionsForProvince(form.province, form.city);
  const usesFreeTextCity = form.province === TESTING_PROVINCE;
  const handleProvinceChange = (province: string) => {
    updateField("province", province);
    updateField("city", "");
  };

  return (
    <div
      className="grid grid-cols-1 gap-5 p-5 sm:p-7 md:grid-cols-2 md:gap-x-6"
      style={{ background: N.card, border: `1px solid ${N.border}`, borderRadius: 18, boxShadow: N.shadow, marginBottom: 18 }}
    >
      <div>
        <label style={labelStyle}>Phone</label>
        <input style={inputStyle} value={form.phone} onChange={(event) => updateField("phone", event.target.value)} />
      </div>
      <div>
        <label style={labelStyle}>Province</label>
        <select style={inputStyle} value={form.province} onChange={(event) => handleProvinceChange(event.target.value)}>
          <option value="">Select province</option>
          {provinceOptionsForValue(form.province).map((province) => (
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
            style={inputStyle}
            value={form.city}
            placeholder="Enter city"
            onChange={(event) => updateField("city", event.target.value)}
          />
        ) : (
          <select
            style={inputStyle}
            value={form.city}
            disabled={!form.province}
            onChange={(event) => updateField("city", event.target.value)}
          >
            <option value="">{form.province ? "Select city" : "Select province first"}</option>
            {cityOptions.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        )}
      </div>
      <div>
        <label style={labelStyle}>Specialties</label>
        <input
          style={inputStyle}
          value={specialtyText}
          placeholder="Infant care, CPR certified"
          onChange={(event) => onSpecialtyTextChange(event.target.value)}
        />
      </div>
    </div>
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

function limitSpecialtyText(value: string, previousValue: string) {
  const nextText = value.split(",").slice(0, SPECIALTY_MAX_COUNT).join(",");
  const isDeleting = nextText.length < previousValue.length;
  if (isDeleting || getSpecialtyCharacterCount(parseSpecialties(nextText)) <= SPECIALTIES_TOTAL_LIMIT) {
    return nextText;
  }
  return previousValue;
}

function parseSpecialties(value: string) {
  return value
    .split(",")
    .map((segment) => segment.trim())
    .filter(Boolean)
    .slice(0, SPECIALTY_MAX_COUNT);
}

function getSpecialtyCharacterCount(specialties: string[]) {
  return specialties.reduce((total, specialty) => total + specialty.length, 0);
}

function BioField({
  bio,
  updateField,
}: {
  bio: string;
  updateField: <TKey extends keyof UpdateNannyProfilePayload>(key: TKey, value: UpdateNannyProfilePayload[TKey]) => void;
}) {
  return (
    <div className="p-5 sm:p-7" style={{ background: N.card, border: `1px solid ${N.border}`, borderRadius: 18, boxShadow: N.shadow, marginBottom: 18 }}>
      <label style={labelStyle}>Bio</label>
      <textarea style={{ ...inputStyle, height: 120, resize: "vertical" }} value={bio} onChange={(event) => updateField("bio", event.target.value.slice(0, BIO_LIMIT))} />
      <div style={{ marginTop: 6, fontSize: 12.5, color: N.inkFaint, textAlign: "right" }}>
        {bio.length} / {BIO_LIMIT}
      </div>
    </div>
  );
}

function RateField({
  rate,
  updateField,
}: {
  rate: number;
  updateField: <TKey extends keyof UpdateNannyProfilePayload>(key: TKey, value: UpdateNannyProfilePayload[TKey]) => void;
}) {
  return (
    <div className="p-5 sm:p-7" style={{ background: N.card, border: `1px solid ${N.border}`, borderRadius: 18, boxShadow: N.shadow, marginBottom: 28 }}>
      <label style={labelStyle}>Hourly rate</label>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
        <input type="range" min={15} max={75} value={rate} onChange={(event) => updateField("rate_per_hour", Number(event.target.value))} style={{ flex: 1, accentColor: N.green }} />
        <div className="text-left sm:text-right" style={{ fontFamily: "DM Serif Display, var(--font-dm-serif), serif", fontSize: 36, color: N.green, minWidth: 90, lineHeight: 1 }}>
          ${rate}
          <span style={{ fontFamily: "inherit", fontSize: 16, color: N.inkMute, fontWeight: 400 }}>/hr</span>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 12, color: N.inkFaint }}>
        <span>$15</span><span>$75</span>
      </div>
    </div>
  );
}
