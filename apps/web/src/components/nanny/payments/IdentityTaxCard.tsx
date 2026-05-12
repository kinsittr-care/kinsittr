import { N } from "../tokens";
import { inputStyle, labelStyle } from "../nanny-styles";

export default function IdentityTaxCard() {
  return (
    <div
      style={{
        background: N.card,
        border: `1px solid ${N.border}`,
        borderRadius: 18,
        padding: "24px 28px",
        boxShadow: N.shadow,
      }}
    >
      <h2
        style={{
          fontFamily: "DM Serif Display, var(--font-dm-serif), serif",
          fontSize: 20,
          fontWeight: 400,
          color: N.greenDk,
          marginBottom: 20,
        }}
      >
        Identity &amp; tax info
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px" }}>
        <div>
          <label style={labelStyle}>Legal first name</label>
          <input style={inputStyle} defaultValue="Amara" />
        </div>
        <div>
          <label style={labelStyle}>Legal last name</label>
          <input style={inputStyle} defaultValue="Kofi" />
        </div>
        <div>
          <label style={labelStyle}>SIN (last 4 digits only)</label>
          <input style={inputStyle} defaultValue="···· 8821" readOnly />
        </div>
        <div>
          <label style={labelStyle}>Date of birth</label>
          <input style={inputStyle} type="date" defaultValue="1997-03-14" />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>Address</label>
          <input style={inputStyle} defaultValue="42 Maple Street, Toronto, ON M4B 1Z3" />
        </div>
      </div>
    </div>
  );
}
