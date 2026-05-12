"use client";

import { useState } from "react";
import { N } from "./tokens";
import NannyAvatar from "./NannyAvatar";
import { btnPrimary, btnGhost, inputStyle, labelStyle } from "./nanny-styles";

const BIO_LIMIT = 600;

export default function NannyProfileView() {
  const [rate, setRate] = useState(28);
  const [bio, setBio] = useState(
    "Experienced caregiver with 6 years working with children aged 0–10. CPR certified, first aid trained, and passionate about early childhood development.",
  );

  return (
    <div style={{ padding: "40px 48px 80px" }}>
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

      {/* Photo + verified */}
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
          <NannyAvatar initials="AK" size={80} tone="green" />
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
        </div>
        <div>
          <div
            style={{
              fontFamily: "DM Serif Display, var(--font-dm-serif), serif",
              fontSize: 22,
              color: N.greenDk,
            }}
          >
            Amara Kofi
          </div>
          <div
            style={{
              marginTop: 6,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12.5,
              fontWeight: 600,
              color: N.green,
              background: N.greenLt,
              border: `1px solid ${N.greenMid}`,
              padding: "4px 10px",
              borderRadius: 999,
            }}
          >
            ✓ Verified caregiver
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
              cursor: "pointer",
            }}
          >
            Change photo
          </button>
        </div>
      </div>

      {/* Fields */}
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
        {[
          { label: "Display name", defaultValue: "Amara Kofi" },
          { label: "City",         defaultValue: "Toronto, ON" },
          { label: "Years experience", defaultValue: "6" },
        ].map(({ label, defaultValue }) => (
          <div key={label}>
            <label style={labelStyle}>{label}</label>
            <input style={inputStyle} defaultValue={defaultValue} />
          </div>
        ))}
      </div>

      {/* Bio */}
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
          value={bio}
          onChange={(e) => setBio(e.target.value.slice(0, BIO_LIMIT))}
        />
        <div style={{ marginTop: 6, fontSize: 12.5, color: N.inkFaint, textAlign: "right" }}>
          {bio.length} / {BIO_LIMIT}
        </div>
      </div>

      {/* Rate slider */}
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
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
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
            ${rate}
            <span style={{ fontFamily: "inherit", fontSize: 16, color: N.inkMute, fontWeight: 400 }}>
              /hr
            </span>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 12, color: N.inkFaint }}>
          <span>$15</span><span>$75</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button style={btnPrimary}>Save changes</button>
        <button style={btnGhost}>Preview public profile</button>
      </div>
    </div>
  );
}
