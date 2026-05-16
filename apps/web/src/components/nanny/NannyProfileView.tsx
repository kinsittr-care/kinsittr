"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { NannyProfile, UpdateNannyProfilePayload } from "@/src/types/api/api";
import {
  getOwnNannyProfile,
  ownNannyProfileQueryKey,
  updateOwnNannyProfile,
} from "@/src/utils/api/nanny";
import { N } from "./tokens";
import NannyAvatar from "./NannyAvatar";
import { btnPrimary, btnGhost, inputStyle, labelStyle } from "./nanny-styles";

const BIO_LIMIT = 600;

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function profileToPayload(profile: NannyProfile): UpdateNannyProfilePayload {
  return {
    display_name: profile.display_name,
    bio: profile.bio,
    specialties: profile.specialties ?? [],
    rate_per_hour: profile.rate_per_hour,
    city: profile.city,
    province: profile.province,
  };
}

function NannyProfileForm({ profile }: { profile: NannyProfile }) {
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
      <div
        style={{
          background: N.card,
          border: `1px solid ${N.border}`,
          borderRadius: 18,
          padding: "28px 32px",
          boxShadow: N.shadow,
          marginBottom: 18,
          display: "flex",
          alignItems: "center",
          gap: 24,
        }}
      >
        <div style={{ position: "relative" }}>
          <NannyAvatar initials={getInitials(form.display_name)} size={80} tone="green" />
          {profile.verification_status === "verified" && (
            <div
              style={{
                position: "absolute",
                bottom: -2,
                right: -2,
                background: N.green,
                borderRadius: "50%",
                width: 22,
                height: 22,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `2px solid ${N.card}`,
              }}
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M2 5.5l2.5 2.5L9 2.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </div>
        <div>
          <div
            style={{
              fontFamily: "DM Serif Display, var(--font-dm-serif), serif",
              fontSize: 22,
              color: N.greenDk,
            }}
          >
            {form.display_name}
          </div>
          <div
            style={{
              marginTop: 6,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12.5,
              fontWeight: 600,
              color: profile.verification_status === "verified" ? N.green : N.amber,
              background: profile.verification_status === "verified" ? N.greenLt : N.amberLt,
              border: `1px solid ${profile.verification_status === "verified" ? N.greenMid : N.border}`,
              padding: "4px 10px",
              borderRadius: 999,
              textTransform: "capitalize",
            }}
          >
            {profile.verification_status.replaceAll("_", " ")} caregiver
          </div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <button
            style={{
              padding: "9px 16px",
              background: N.cardSoft,
              border: `1px solid ${N.border}`,
              borderRadius: 10,
              fontSize: 13.5,
              color: N.inkMute,
              cursor: "not-allowed",
            }}
            disabled
          >
            Photo upload later
          </button>
        </div>
      </div>

      <div
        style={{
          background: N.card,
          border: `1px solid ${N.border}`,
          borderRadius: 18,
          padding: "28px 32px",
          boxShadow: N.shadow,
          marginBottom: 18,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px 24px",
        }}
      >
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

      <div
        style={{
          background: N.card,
          border: `1px solid ${N.border}`,
          borderRadius: 18,
          padding: "28px 32px",
          boxShadow: N.shadow,
          marginBottom: 18,
        }}
      >
        <label style={labelStyle}>Bio</label>
        <textarea
          style={{ ...inputStyle, height: 120, resize: "vertical" }}
          value={form.bio}
          onChange={(event) => updateField("bio", event.target.value.slice(0, BIO_LIMIT))}
        />
        <div style={{ marginTop: 6, fontSize: 12.5, color: N.inkFaint, textAlign: "right" }}>
          {form.bio.length} / {BIO_LIMIT}
        </div>
      </div>

      <div
        style={{
          background: N.card,
          border: `1px solid ${N.border}`,
          borderRadius: 18,
          padding: "28px 32px",
          boxShadow: N.shadow,
          marginBottom: 28,
        }}
      >
        <label style={labelStyle}>Hourly rate</label>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <input
            type="range"
            min={15}
            max={75}
            value={form.rate_per_hour}
            onChange={(event) => updateField("rate_per_hour", Number(event.target.value))}
            style={{ flex: 1, accentColor: N.green }}
          />
          <div
            style={{
              fontFamily: "DM Serif Display, var(--font-dm-serif), serif",
              fontSize: 36,
              color: N.green,
              minWidth: 90,
              textAlign: "right",
              lineHeight: 1,
            }}
          >
            ${form.rate_per_hour}
            <span style={{ fontFamily: "inherit", fontSize: 16, color: N.inkMute, fontWeight: 400 }}>/hr</span>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 12, color: N.inkFaint }}>
          <span>$15</span><span>$75</span>
        </div>
      </div>

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

export default function NannyProfileView() {
  const profileQuery = useQuery({
    queryKey: ownNannyProfileQueryKey(),
    queryFn: getOwnNannyProfile,
  });

  return (
    <div style={{ padding: "40px 48px 80px", overflowY: "auto", flex: 1 }}>
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontFamily: "DM Serif Display, var(--font-dm-serif), serif",
            fontSize: 36,
            fontWeight: 400,
            color: N.greenDk,
            lineHeight: 1.1,
          }}
        >
          Your Profile
        </h1>
        <p style={{ marginTop: 8, fontSize: 14.5, color: N.inkMute }}>
          Keep your profile up to date to attract more families.
        </p>
      </div>

      {profileQuery.isLoading && (
        <div style={{ color: N.inkFaint, fontSize: 15 }}>Loading profile...</div>
      )}

      {profileQuery.isError && (
        <div style={{ color: N.rose, fontSize: 15 }}>
          {profileQuery.error instanceof Error ? profileQuery.error.message : "Unable to load profile."}
        </div>
      )}

      {profileQuery.data?.data && (
        <NannyProfileForm key={profileQuery.data.data.id} profile={profileQuery.data.data} />
      )}
    </div>
  );
}
