import AdminPageHeader from "./AdminPageHeader";
import AnalyticsMetricTiles from "./analytics/AnalyticsMetricTiles";
import AnalyticsCityBars from "./analytics/AnalyticsCityBars";
import AnalyticsKeyMetrics from "./analytics/AnalyticsKeyMetrics";
import { btnGhost } from "./admin-styles";

export default function AnalyticsView() {
  return (
    <>
      <AdminPageHeader
        title="Analytics"
        subtitle="April 2026 · Canada"
        right={
          <div style={{ display: "flex", gap: 10 }}>
            <button style={btnGhost}>Last 30 days</button>
            <button style={btnGhost}>Export report</button>
          </div>
        }
      />
      <div
        style={{
          padding: "24px 40px 40px",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <AnalyticsMetricTiles />
        <div style={{ display: "grid", gridTemplateColumns: "1.05fr 1fr", gap: 18 }}>
          <AnalyticsCityBars />
          <AnalyticsKeyMetrics />
        </div>
      </div>
    </>
  );
}
