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
    <div className="flex-1 overflow-y-auto px-4 pt-6 pb-16 md:px-12 md:pt-10 md:pb-20">
      <div className="mb-7 md:mb-8">
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
