"use client";

import { A } from "./tokens";
import AdminPageHeader from "./AdminPageHeader";
import AdminAvatar from "./AdminAvatar";
import AdminPill from "./AdminPill";
import AdminStars from "./AdminStars";
import { SearchIcon } from "./admin-icons";
import { btnGhost, btnGhostSm } from "./admin-styles";

const NANNIES = [
  { id: 1, name: "Sarah Okonkwo",         initials: "SO", city: "Toronto, ON",   rate: 28, rating: 4.9, status: "Verified" },
  { id: 2, name: "Marie-Claire Beaumont", initials: "MB", city: "Vancouver, BC", rate: 32, rating: 4.8, status: "Verified" },
  { id: 3, name: "Priya Sharma",          initials: "PS", city: "Toronto, ON",   rate: 25, rating: 4.7, status: "Verified" },
  { id: 4, name: "Aisha Mensah",          initials: "AM", city: "Calgary, AB",   rate: 30, rating: 5.0, status: "Verified" },
  { id: 5, name: "Tanya Volkov",          initials: "TV", city: "Ottawa, ON",    rate: 22, rating: 4.6, status: "Pending"  },
  { id: 6, name: "Jennifer Walsh",        initials: "JW", city: "Montreal, QC",  rate: 27, rating: 4.8, status: "Verified" },
  { id: 7, name: "Mei Tanaka",            initials: "MT", city: "Vancouver, BC", rate: 34, rating: 4.9, status: "Verified" },
  { id: 8, name: "Olivia Brennan",        initials: "OB", city: "Halifax, NS",   rate: 24, rating: 4.5, status: "Verified" },
];

const colTemplate = "2.2fr 1.4fr .9fr 1.2fr 1fr .8fr";

export default function AllNanniesView() {
  return (
    <>
      <AdminPageHeader
        title="All Nannies"
        subtitle="42 verified caregivers · 5 pending review"
        right={
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "9px 14px",
                background: A.card,
                border: `1px solid ${A.border}`,
                borderRadius: 10,
                color: A.inkSoft,
                fontSize: 13.5,
                minWidth: 240,
              }}
            >
              <span style={{ display: "flex" }}>
                <SearchIcon />
              </span>
              <span>Search by name, city or rate…</span>
            </div>
            <button style={btnGhost}>Filter</button>
          </div>
        }
      />
      <div style={{ padding: "24px 40px 40px" }}>
        <div
          style={{
            background: A.card,
            border: `1px solid ${A.border}`,
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: A.shadow,
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: colTemplate,
              padding: "14px 24px",
              borderBottom: `1px solid ${A.divider}`,
              background: A.cardWarm,
              fontSize: 11.5,
              fontWeight: 600,
              letterSpacing: ".14em",
              textTransform: "uppercase" as const,
              color: A.inkSoft,
            }}
          >
            <div>Nanny</div>
            <div>City</div>
            <div>Rate</div>
            <div>Rating</div>
            <div>Status</div>
            <div style={{ textAlign: "right" }}>Action</div>
          </div>

          {/* Rows */}
          {NANNIES.map((n, i) => (
            <div
              key={n.id}
              style={{
                display: "grid",
                gridTemplateColumns: colTemplate,
                alignItems: "center",
                padding: "16px 24px",
                gap: 12,
                borderBottom: i < NANNIES.length - 1 ? `1px solid ${A.borderSoft}` : "none",
                transition: "background .15s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = A.cardWarm)}
              onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "transparent")}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <AdminAvatar
                  initials={n.initials}
                  size={40}
                  tone={n.status === "Pending" ? "muted" : "clay"}
                />
                <div style={{ fontSize: 15, fontWeight: 600, color: A.ink }}>{n.name}</div>
              </div>
              <div style={{ fontSize: 14, color: A.inkMid }}>{n.city}</div>
              <div>
                <span style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 18, color: A.ink }}>
                  ${n.rate}
                </span>
                <span style={{ fontSize: 13, color: A.inkSoft, fontWeight: 400 }}>/hr</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <AdminStars value={Math.round(n.rating)} />
                <span style={{ fontSize: 13.5, color: A.inkMid, fontWeight: 500 }}>{n.rating}</span>
              </div>
              <div>
                <AdminPill tone={n.status === "Verified" ? "green" : "amber"}>{n.status}</AdminPill>
              </div>
              <div style={{ textAlign: "right" }}>
                <button style={btnGhostSm}>View</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
