"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ProfileDetailsSection from "../profile/ProfileDetailsSection";
import ChildrenSection from "../profile/ChildrenSection";
import BookingHistorySection from "../profile/BookingHistorySection";
import { useIsMobile } from "./useIsMobile";
import type { ParentProfile, UpdateParentProfilePayload } from "@/src/types/api/api";
import {
  getParentProfile,
  parentProfileQueryKey,
  updateParentProfile,
} from "@/src/utils/api/parent";

export default function ProfileView() {
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const profileQuery = useQuery({
    queryKey: parentProfileQueryKey(),
    queryFn: getParentProfile,
  });
  const updateMutation = useMutation({
    mutationFn: updateParentProfile,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: parentProfileQueryKey() });
      await queryClient.invalidateQueries({ queryKey: ["auth-me"] });
    },
  });

  const profile = profileQuery.data?.data;

  const saveProfile = async (payload: UpdateParentProfilePayload) => {
    const response = await updateMutation.mutateAsync(payload);
    return response.data;
  };

  return (
    <div
      className="max-w-[660px] mx-auto overflow-y-auto h-full"
      style={{ padding: isMobile ? "20px 16px 40px" : "40px 36px 60px" }}
    >
      <div className="mb-9">
        <h1 className="font-display font-normal text-[30px] mb-1">
          My Profile
        </h1>
        <p className="text-[var(--faint)] text-[14px]">
          Manage your profile, family details, and booking history
        </p>
      </div>

      {profileQuery.isLoading && (
        <div className="text-brand-faint text-[14px]">Loading profile...</div>
      )}

      {profileQuery.isError && (
        <div className="text-[#c0392b] text-[14px]">
          {profileQuery.error instanceof Error ? profileQuery.error.message : "Unable to load profile."}
        </div>
      )}

      {profile && (
        <>
          <ProfileDetailsSection
            profile={profile}
            isSaving={updateMutation.isPending}
            errorMessage={updateMutation.error instanceof Error ? updateMutation.error.message : null}
            onSave={saveProfile}
          />
          {hasParentProfileDetails(profile) && (
            <ChildrenSection
              key={`${profile.id}-${profile.updated_at}`}
              profile={profile}
              isSaving={updateMutation.isPending}
              onSave={async (childrenAges: number[]) => {
                const nextProfile = await saveProfile(profilePayload(profile, {
                  num_children: childrenAges.length,
                  children_ages: childrenAges,
                }));
                return nextProfile;
              }}
            />
          )}
        </>
      )}
      <BookingHistorySection />
    </div>
  );
}

function hasParentProfileDetails(profile: ParentProfile) {
  return Boolean(
    profile.display_name.trim() &&
      profile.phone.trim() &&
      profile.city.trim() &&
      profile.province.trim(),
  );
}

function profilePayload(
  profile: ParentProfile,
  overrides: Partial<UpdateParentProfilePayload> = {},
): UpdateParentProfilePayload {
  return {
    display_name: profile.display_name,
    phone: profile.phone,
    num_children: profile.num_children,
    children_ages: Array.isArray(profile.children_ages) ? profile.children_ages : [],
    city: profile.city,
    province: profile.province,
    ...overrides,
  };
}
