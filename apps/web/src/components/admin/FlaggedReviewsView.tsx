import { A } from "./tokens";
import AdminPageHeader from "./AdminPageHeader";
import AdminPill from "./AdminPill";
import AdminStars from "./AdminStars";
import { btnApprove, btnDanger, btnGhost, card } from "./admin-styles";

const FLAGS = [
  {
    id: 1,
    who: "Anonymous Parent",
    target: "Mark B.",
    flag: "Unverifiable claim",
    date: "Apr 7",
    stars: 1,
    text: "Completely irresponsible, left my child alone!",
  },
  {
    id: 2,
    who: "User #2241",
    target: "Clara N.",
    flag: "Profanity detected",
    date: "Apr 6",
    stars: 2,
    text: "Used inappropriate language multiple times.",
  },
];

export default function FlaggedReviewsView() {
  return (
    <>
      <AdminPageHeader
        title="Flagged Reviews"
        subtitle="2 reviews require moderation"
      />
      <div
        style={{
          padding: "24px 40px 40px",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        {FLAGS.map((f) => (
          <div key={f.id} style={card}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div style={{ fontSize: 15.5, color: A.ink }}>
                <span style={{ fontWeight: 700 }}>{f.who}</span>
                <span style={{ color: A.inkSoft, margin: "0 8px" }}>→ review of</span>
                <span style={{ fontWeight: 700 }}>{f.target}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <AdminPill tone="red">Flag: {f.flag}</AdminPill>
                <span style={{ fontSize: 13, color: A.inkSoft }}>{f.date}</span>
              </div>
            </div>

            <div
              style={{
                marginTop: 16,
                padding: "18px 20px",
                background: A.bgSoft,
                border: `1px solid ${A.borderSoft}`,
                borderRadius: 12,
              }}
            >
              <AdminStars value={f.stars} />
              <p
                style={{
                  marginTop: 12,
                  fontFamily: "var(--font-dm-serif), serif",
                  fontStyle: "italic",
                  fontSize: 17,
                  color: A.ink,
                  lineHeight: 1.4,
                }}
              >
                &ldquo;{f.text}&rdquo;
              </p>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
              <button style={btnApprove}>Approve &amp; Publish</button>
              <button style={btnDanger}>Remove Review</button>
              <button style={btnGhost}>Contact Parent</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
