"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { NannyProfile, UpdateNannyProfilePayload } from "@/src/types/api/api";
import { ownNannyProfileQueryKey, updateOwnNannyProfile } from "@/src/utils/api/nanny";
import { btnGhost, btnPrimary, inputStyle, labelStyle } from "../nanny-styles";
import { N } from "../tokens";
import { BIO_LIMIT, profileToPayload } from "./nannyProfileHelpers";
import { NannyProfileHeaderCard } from "./NannyProfileHeaderCard";

export default function NannyProfileForm({ profile }: { profile: NannyProfile }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<UpdateNannyProfilePayload>(() => profileToPayload(profile));
  const [message, setMessage] = useState<string | null>(null);

  const updateMutation = useMutation({
    mutationFn: updateOwnNannyProfile,
    onSuccess: async () => {
      setMessage("Profile updated.");
      await queryClient.invalidateQueries({ queryKey: ownNannyProfileQueryKey() });
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
      <NannyProfileHeaderCard form={form} profile={profile} />
      <BasicFields form={form} updateField={updateField} />
      <BioField bio={form.bio} updateField={updateField} />
      <RateField rate={form.rate_per_hour} updateField={updateField} />

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button style={btnPrimary} disabled={updateMutation.isPending} onClick={() => updateMutation.mutate(form)}>
          {updateMutation.isPending ? "Saving..." : "Save changes"}
        </button>
        <button style={btnGhost}>Preview public profile</button>
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
  updateField,
}: {
  form: UpdateNannyProfilePayload;
  updateField: <TKey extends keyof UpdateNannyProfilePayload>(key: TKey, value: UpdateNannyProfilePayload[TKey]) => void;
}) {
  return (
    <div style={{ background: N.card, border: `1px solid ${N.border}`, borderRadius: 18, padding: "28px 32px", boxShadow: N.shadow, marginBottom: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 24px" }}>
      <div>
        <label style={labelStyle}>Display name</label>
        <input style={inputStyle} value={form.display_name} onChange={(event) => updateField("display_name", event.target.value)} />
      </div>
      <div>
        <label style={labelStyle}>City</label>
        <input style={inputStyle} value={form.city} onChange={(event) => updateField("city", event.target.value)} />
      </div>
      <div>
        <label style={labelStyle}>Province</label>
        <input style={inputStyle} value={form.province} onChange={(event) => updateField("province", event.target.value)} />
      </div>
      <div>
        <label style={labelStyle}>Specialties</label>
        <input
          style={inputStyle}
          value={form.specialties.join(", ")}
          onChange={(event) =>
            updateField(
              "specialties",
              event.target.value
                .split(",")
                .map((value) => value.trim())
                .filter(Boolean),
            )
          }
        />
      </div>
    </div>
  );
}

function BioField({
  bio,
  updateField,
}: {
  bio: string;
  updateField: <TKey extends keyof UpdateNannyProfilePayload>(key: TKey, value: UpdateNannyProfilePayload[TKey]) => void;
}) {
  return (
    <div style={{ background: N.card, border: `1px solid ${N.border}`, borderRadius: 18, padding: "28px 32px", boxShadow: N.shadow, marginBottom: 18 }}>
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
    <div style={{ background: N.card, border: `1px solid ${N.border}`, borderRadius: 18, padding: "28px 32px", boxShadow: N.shadow, marginBottom: 28 }}>
      <label style={labelStyle}>Hourly rate</label>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <input type="range" min={15} max={75} value={rate} onChange={(event) => updateField("rate_per_hour", Number(event.target.value))} style={{ flex: 1, accentColor: N.green }} />
        <div style={{ fontFamily: "DM Serif Display, var(--font-dm-serif), serif", fontSize: 36, color: N.green, minWidth: 90, textAlign: "right", lineHeight: 1 }}>
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
