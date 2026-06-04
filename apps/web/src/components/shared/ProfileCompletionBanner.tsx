"use client";

import Link from "next/link";
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
      ? {
          title: "Complete your family profile",
          body: "Add your phone, location, and child details so nannies have enough context before bookings.",
          href: "/parent/profile",
          cta: "Complete parent profile",
        }
      : {
          title: "Complete your caregiver profile",
          body: "Add your phone, location, bio, specialties, and rate so parents can confidently book you.",
          href: "/nanny/profile",
          cta: "Complete nanny profile",
        };

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-amber-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold">{copy.title}</p>
          <p className="text-sm text-amber-800">{copy.body}</p>
        </div>
        <Link
          href={copy.href}
          className="inline-flex w-fit rounded-full bg-amber-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-900"
        >
          {copy.cta}
        </Link>
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
