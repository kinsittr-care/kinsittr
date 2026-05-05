"use client";

import { useState } from "react";
import { useIsMobile } from "./useIsMobile";

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#fdfaf5",
        border: "1px solid var(--border)",
        borderRadius: 16, padding: 24, marginBottom: 20,
        boxShadow: "0 2px 12px rgba(40,30,20,.07)",
      }}
    >
      <h3
        style={{
          fontSize: 11.5, fontWeight: 600, color: "var(--faint)",
          textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 18,
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function ToggleRow({
  label, sub, on, onToggle, last = false,
}: {
  label: string; sub: string; on: boolean; onToggle: () => void; last?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        padding: "13px 0",
        borderBottom: last ? "none" : "1px solid var(--border)",
      }}
    >
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 12.5, color: "var(--faint)" }}>{sub}</div>
      </div>
      <div
        onClick={onToggle}
        style={{
          width: 46, height: 26, borderRadius: 13,
          background: on ? "var(--teal)" : "#ddd8d0",
          cursor: "pointer", position: "relative",
          transition: "background .2s", flexShrink: 0,
          boxShadow: on ? "0 2px 8px rgba(58,90,90,.28)" : "none",
        }}
        role="switch"
        aria-checked={on}
      >
        <div
          style={{
            width: 20, height: 20, borderRadius: "50%",
            background: "#fff", position: "absolute",
            top: 3, left: on ? 23 : 3,
            transition: "left .2s",
            boxShadow: "0 1px 4px rgba(0,0,0,.2)",
          }}
        />
      </div>
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  width: "100%", border: "1.5px solid var(--border)", borderRadius: 9,
  padding: "11px 14px", fontSize: 14, background: "var(--bg-warm)",
  color: "var(--brand-text)", cursor: "pointer", outline: "none",
  appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  paddingRight: 32,
  marginBottom: 16,
};

const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 500, color: "var(--muted)",
  display: "block", marginBottom: 6,
  textTransform: "uppercase", letterSpacing: "0.06em",
};

export default function SettingsView() {
  const isMobile = useIsMobile();
  const [notif, setNotif] = useState({ messages: true, bookings: true, reminders: false, weekly: true });
  const [priv, setPriv] = useState({ showProfile: true, shareReviews: true, analytics: false });

  return (
    <div
      style={{
        maxWidth: 620, margin: "0 auto",
        padding: isMobile ? "20px 16px 40px" : "40px 36px 60px",
        overflowY: "auto", height: "100%",
      }}
    >
      <div style={{ marginBottom: 36 }}>
        <h1 className="font-display" style={{ fontWeight: 400, fontSize: 30, marginBottom: 4 }}>
          Settings
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>
          Manage your preferences and account settings
        </p>
      </div>

      <SectionCard title="Notifications">
        <ToggleRow label="New messages" sub="Get notified when a nanny replies" on={notif.messages} onToggle={() => setNotif((p) => ({ ...p, messages: !p.messages }))} />
        <ToggleRow label="Booking updates" sub="Confirmations, reminders, and changes" on={notif.bookings} onToggle={() => setNotif((p) => ({ ...p, bookings: !p.bookings }))} />
        <ToggleRow label="24h reminders" sub="Alert before each booking starts" on={notif.reminders} onToggle={() => setNotif((p) => ({ ...p, reminders: !p.reminders }))} />
        <ToggleRow label="Weekly digest" sub="Summary of bookings and activity" on={notif.weekly} onToggle={() => setNotif((p) => ({ ...p, weekly: !p.weekly }))} last />
      </SectionCard>

      <SectionCard title="Privacy">
        <ToggleRow label="Show profile to nannies" sub="Nannies can view your family profile before accepting" on={priv.showProfile} onToggle={() => setPriv((p) => ({ ...p, showProfile: !p.showProfile }))} />
        <ToggleRow label="Share reviews publicly" sub="Your reviews appear on nanny profiles" on={priv.shareReviews} onToggle={() => setPriv((p) => ({ ...p, shareReviews: !p.shareReviews }))} />
        <ToggleRow label="Analytics & improvements" sub="Help us improve with anonymous usage data" on={priv.analytics} onToggle={() => setPriv((p) => ({ ...p, analytics: !p.analytics }))} last />
      </SectionCard>

      <SectionCard title="App Preferences">
        <div>
          <label style={labelStyle}>Language</label>
          <select defaultValue="English (Canada)" style={selectStyle}>
            <option>English (Canada)</option>
            <option>French (Canada)</option>
            <option>Spanish</option>
            <option>Mandarin</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Currency</label>
          <select defaultValue="CAD — Canadian Dollar" style={selectStyle}>
            <option>CAD — Canadian Dollar</option>
            <option>USD — US Dollar</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Timezone</label>
          <select defaultValue="Eastern Time (ET)" style={{ ...selectStyle, marginBottom: 4 }}>
            <option>Eastern Time (ET)</option>
            <option>Pacific Time (PT)</option>
            <option>Mountain Time (MT)</option>
          </select>
        </div>
      </SectionCard>

      <SectionCard title="Security">
        <div className="flex flex-col gap-[10px]">
          <button className="btn-outline" style={{ justifyContent: "flex-start", gap: 10, fontSize: 14 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="3" y="7" width="10" height="8" rx="2" stroke="var(--muted)" strokeWidth="1.5" />
              <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Change password
          </button>
          <button className="btn-outline" style={{ justifyContent: "flex-start", gap: 10, fontSize: 14 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 2v9M4 8l4 4 4-4M2 14h12" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Download my data
          </button>
          <button
            style={{
              display: "flex", alignItems: "center", justifyContent: "flex-start",
              gap: 10, padding: "10px 20px", fontSize: 14, borderRadius: 12,
              background: "#fff", color: "#c0392b",
              border: "1.5px solid #f0d0d0", cursor: "pointer", fontFamily: "inherit",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-9" stroke="#c0392b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Delete account
          </button>
        </div>
      </SectionCard>
    </div>
  );
}
