"use client";

import { useQuery } from "@tanstack/react-query";
import { getOwnNannyProfile, ownNannyProfileQueryKey } from "@/src/utils/api/nanny";
import { N } from "./tokens";
import NannyProfileForm from "./profile/NannyProfileForm";

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

      {profileQuery.isLoading && <div style={{ color: N.inkFaint, fontSize: 15 }}>Loading profile...</div>}

      {profileQuery.isError && (
        <div style={{ color: N.rose, fontSize: 15 }}>
          {profileQuery.error instanceof Error ? profileQuery.error.message : "Unable to load profile."}
        </div>
      )}

      {profileQuery.data?.data && <NannyProfileForm key={profileQuery.data.data.id} profile={profileQuery.data.data} />}
    </div>
  );
}
