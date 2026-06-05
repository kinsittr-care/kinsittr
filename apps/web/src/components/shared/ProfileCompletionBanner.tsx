"use client";

import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { AuthSessionPayload, NannyProfile, ParentProfile } from "@/src/types/api/api";
import { getCurrentSession } from "@/src/utils/api/auth";

type ProfileRole = "parent" | "nanny";

export default function ProfileCompletionBanner({ role }: { role: ProfileRole }) {
  const pathname = usePathname();
  const sessionQuery = useQuery({
    queryKey: ["auth-me"],
    queryFn: getCurrentSession,
    staleTime: 60_000,
  });
  const session = sessionQuery.data?.data;

  if (!session || pathname === `/${role}/profile` || isProfileComplete(role, session)) {
    return null;
  }

  const copy =
    role === "parent"
      ? { title: "Complete your family profile to get started" }
      : { title: "Complete your nanny profile to get started" };

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-amber-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold">{copy.title}</p>
        </div>        
      </div>
    </div>
  );
}

function isProfileComplete(role: ProfileRole, session: AuthSessionPayload) {
  if (role === "parent") {
    return isParentProfileComplete(session.parent_profile, session.user.phone);
  }

  return isNannyProfileComplete(session.nanny_profile, session.user.phone);
}

function isParentProfileComplete(profile: ParentProfile | undefined, phone: string) {
  return Boolean(
    profile &&
      text(profile.display_name) &&
      text(profile.phone || phone) &&
      text(profile.city) &&
      text(profile.province) &&
      profile.num_children > 0 &&
      profile.children_ages.length > 0,
  );
}

function isNannyProfileComplete(profile: NannyProfile | undefined, phone: string) {
  return Boolean(
    profile &&
      text(profile.display_name) &&
      text(profile.phone || phone) &&
      text(profile.bio) &&
      text(profile.city) &&
      text(profile.province) &&
      profile.rate_per_hour > 0 &&
      profile.specialties.length > 0,
  );
}

function text(value: string | undefined | null) {
  return Boolean(value?.trim());
}
