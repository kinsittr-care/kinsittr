import { N } from "./tokens";
import DashboardStatCards from "./dashboard/DashboardStatCards";
import DashboardUpcoming from "./dashboard/DashboardUpcoming";
import DashboardChecklist from "./dashboard/DashboardChecklist";

export default function NannyDashboardView() {
  const today = new Intl.DateTimeFormat("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div style={{ padding: "40px 48px 80px" }}>
      {/* Greeting */}
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontFamily: "DM Serif Display, var(--font-dm-serif), serif",
            fontSize: 36,
            fontWeight: 400,
            color: N.greenDk,
            lineHeight: 1.1,
            letterSpacing: "-.01em",
          }}
        >
          Good morning, Amara
        </h1>
        <p style={{ marginTop: 8, fontSize: 14.5, color: N.inkMute }}>{today}</p>
      </div>

      <DashboardStatCards />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 1fr",
          gap: 18,
          marginTop: 24,
        }}
      >
        <DashboardUpcoming />
        <DashboardChecklist />
      </div>
    </div>
  );
}
