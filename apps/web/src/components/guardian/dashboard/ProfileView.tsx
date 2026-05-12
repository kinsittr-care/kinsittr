"use client";

import ProfileDetailsSection from "../profile/ProfileDetailsSection";
import ChildrenSection from "../profile/ChildrenSection";
import BookingHistorySection from "../profile/BookingHistorySection";
import { useIsMobile } from "./useIsMobile";

export default function ProfileView() {
  const isMobile = useIsMobile();
  return (
    <div
      style={{
        maxWidth: 660,
        margin: "0 auto",
        padding: isMobile ? "20px 16px 40px" : "40px 36px 60px",
        overflowY: "auto",
        height: "100%",
      }}
    >
      <div style={{ marginBottom: 36 }}>
        <h1 className="font-display" style={{ fontWeight: 400, fontSize: 30, marginBottom: 4 }}>
          My Profile
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>
          Manage your profile, family details, and booking history
        </p>
      </div>

      <ProfileDetailsSection />
      <ChildrenSection />
      <BookingHistorySection />
    </div>
  );
}
