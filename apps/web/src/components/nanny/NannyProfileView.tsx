"use client";

import { useQuery } from "@tanstack/react-query";
import { getOwnNannyProfile, ownNannyProfileQueryKey } from "@/src/utils/api/nanny";
import NannyProfileForm from "./profile/NannyProfileForm";

export default function NannyProfileView() {
  const profileQuery = useQuery({
    queryKey: ownNannyProfileQueryKey(),
    queryFn: getOwnNannyProfile,
  });

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[900px] mx-auto px-4 pt-6 pb-16 md:px-12 md:pt-10 md:pb-20">
      <div className="mb-7 md:mb-8">
        <h1 className="font-display text-[36px] font-normal text-nanny-green-dk leading-[1.1]">
          Your Profile
        </h1>
        <p className="mt-2 text-[14.5px] text-nanny-ink-faint">
          Keep your profile up to date to attract more families.
        </p>
      </div>

      {profileQuery.isLoading && <div className="text-nanny-ink-faint text-[15px]">Loading profile...</div>}

      {profileQuery.isError && (
        <div className="text-nanny-rose text-[15px]">
          {profileQuery.error instanceof Error ? profileQuery.error.message : "Unable to load profile."}
        </div>
      )}

      {profileQuery.data?.data && <NannyProfileForm key={profileQuery.data.data.id} profile={profileQuery.data.data} />}
      </div>
    </div>
  );
}
