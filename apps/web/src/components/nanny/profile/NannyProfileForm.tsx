"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { NannyProfile, UpdateNannyProfilePayload } from "@/src/types/api/api";
import { ownNannyProfileQueryKey, updateOwnNannyProfile } from "@/src/utils/api/nanny";
import { btnGhostCls, btnPrimaryCls, inputCls, labelCls } from "../nanny-styles";
import { cn } from "@/lib/utils";
import {
  BIO_LIMIT,
  CITIES_BY_PROVINCE,
  PROVINCE_OPTIONS,
  SPECIALTIES_TOTAL_LIMIT,
  SPECIALTY_MAX_COUNT,
  TESTING_PROVINCE,
  profileToPayload,
} from "./nannyProfileHelpers";
import { NannyDocumentUploadSection } from "./NannyDocumentUploadSection";
import { NannyProfileHeaderCard } from "./NannyProfileHeaderCard";

export default function NannyProfileForm({ profile }: { profile: NannyProfile }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<UpdateNannyProfilePayload>(() => profileToPayload(profile));
  const [specialtyText, setSpecialtyText] = useState(() => profile.specialties.join(", "));
  const [message, setMessage] = useState<string | null>(null);
  const isPublicProfile = profile.verification_status === "verified";

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
        <button className={cn("w-full sm:w-auto", btnPrimaryCls)} disabled={updateMutation.isPending} onClick={() => updateMutation.mutate(form)}>
          {updateMutation.isPending ? "Saving..." : "Save changes"}
        </button>
        {isPublicProfile ? (
          <Link className={cn("w-full sm:w-auto text-center", btnGhostCls)} href={`/nannies/${profile.id}`} target="_blank">
            Preview public profile
          </Link>
        ) : (
          <button
            className={cn("w-full sm:w-auto cursor-not-allowed opacity-[0.62]", btnGhostCls)}
            type="button"
            disabled
            title="Your public profile is available after KinSittr verifies your nanny account."
          >
            Preview after verification
          </button>
        )}
        {message && (
          <span className={cn("text-[13.5px] font-semibold", updateMutation.isError ? "text-nanny-rose" : "text-nanny-green")}>
            {message}
          </span>
        )}
      </div>

      <NannyDocumentUploadSection />
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
    <div className="grid grid-cols-1 gap-5 p-5 sm:p-7 md:grid-cols-2 md:gap-x-6 bg-nanny-card border border-nanny-border rounded-[18px] shadow-[var(--nanny-shadow)] mb-[18px]">
      <div>
        <label className={labelCls}>Phone</label>
        <input className={inputCls} value={form.phone} onChange={(event) => updateField("phone", event.target.value)} />
      </div>
      <div>
        <label className={labelCls}>Province</label>
        <select className={inputCls} value={form.province} onChange={(event) => handleProvinceChange(event.target.value)}>
          <option value="">Select province</option>
          {provinceOptionsForValue(form.province).map((province) => (
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
            className={inputCls}
            value={form.city}
            placeholder="Enter city"
            onChange={(event) => updateField("city", event.target.value)}
          />
        ) : (
          <select
            className={inputCls}
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
        <label className={labelCls}>Specialties</label>
        <input
          className={inputCls}
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
    <div className="p-5 sm:p-7 bg-nanny-card border border-nanny-border rounded-[18px] shadow-[var(--nanny-shadow)] mb-[18px]">
      <label className={labelCls}>Bio</label>
      <textarea className={cn(inputCls, "h-[120px] resize-y")} value={bio} onChange={(event) => updateField("bio", event.target.value.slice(0, BIO_LIMIT))} />
      <div className="mt-[6px] text-[12.5px] text-nanny-ink-faint text-right">
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
    <div className="p-5 sm:p-7 bg-nanny-card border border-nanny-border rounded-[18px] shadow-[var(--nanny-shadow)] mb-7">
      <label className={labelCls}>Hourly rate</label>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
        <input type="range" min={15} max={75} value={rate} onChange={(event) => updateField("rate_per_hour", Number(event.target.value))} className="flex-1 accent-nanny-green" />
        <div className="text-left sm:text-right font-display text-[36px] text-nanny-green min-w-[90px] leading-none">
          ${rate}
          <span className="font-display text-[16px] text-nanny-ink-faint font-normal">/hr</span>
        </div>
      </div>
      <div className="flex justify-between mt-1 text-[12px] text-nanny-ink-faint">
        <span>$15</span><span>$75</span>
      </div>
    </div>
  );
}
