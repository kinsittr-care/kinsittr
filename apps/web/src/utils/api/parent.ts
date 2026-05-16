import type {
  ParentProfile,
  ParentSettings,
  UpdateParentProfilePayload,
  UpdateParentSettingsPayload,
} from "@/src/types/api/api";
import { apiRequest } from "@/src/utils/api/api";

export function parentProfileQueryKey() {
  return ["parent-profile"] as const;
}

export function parentSettingsQueryKey() {
  return ["parent-settings"] as const;
}

export async function getParentProfile() {
  return apiRequest<ParentProfile>("/api/v1/parent/profile", undefined, {
    requiresAuth: true,
  });
}

export async function updateParentProfile(payload: UpdateParentProfilePayload) {
  return apiRequest<ParentProfile>(
    "/api/v1/parent/profile",
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
    {
      requiresAuth: true,
    },
  );
}

export async function getParentSettings() {
  return apiRequest<ParentSettings>("/api/v1/parent/settings", undefined, {
    requiresAuth: true,
  });
}

export async function updateParentSettings(payload: UpdateParentSettingsPayload) {
  return apiRequest<ParentSettings>(
    "/api/v1/parent/settings",
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
    {
      requiresAuth: true,
    },
  );
}
