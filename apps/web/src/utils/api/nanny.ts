import type {
  ListPublicNanniesParams,
  NannyDocument,
  NannyDocumentListData,
  NannyProfile,
  PublicNannyListData,
  PublicNannyProfile,
  UpdateNannyProfilePayload,
} from "@/src/types/api/api";
import { ApiRequestError, type ApiResponse, apiRequest } from "@/src/utils/api/api";

function buildListPublicNanniesQuery(params: ListPublicNanniesParams) {
  const query = new URLSearchParams();

  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.city) query.set("city", params.city);
  if (params.province) query.set("province", params.province);
  for (const specialty of params.specialties ?? []) {
    query.append("specialty", specialty);
  }
  if (typeof params.min_rate === "number") query.set("min_rate", String(params.min_rate));
  if (typeof params.max_rate === "number") query.set("max_rate", String(params.max_rate));
  if (params.service_type) query.set("service_type", params.service_type);
  if (params.sort) query.set("sort", params.sort);

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

export function publicNanniesQueryKey(params: ListPublicNanniesParams) {
  return ["public-nannies", params] as const;
}

export function ownNannyProfileQueryKey() {
  return ["nanny-profile"] as const;
}

export const nannyDocumentsQueryKey = ["nanny-documents"] as const;

export async function listPublicNannies(params: ListPublicNanniesParams) {
  const queryString = buildListPublicNanniesQuery(params);
  return apiRequest<PublicNannyListData>(`/api/v1/nannies${queryString}`);
}

export function publicNannyProfileQueryKey(nannyId: string) {
  return ["public-nanny-profile", nannyId] as const;
}

export async function getPublicNannyProfile(nannyId: string) {
  return apiRequest<PublicNannyProfile>(`/api/v1/nannies/${encodeURIComponent(nannyId)}`);
}

export async function getOwnNannyProfile() {
  return apiRequest<NannyProfile>("/api/v1/nanny/profile", undefined, {
    requiresAuth: true,
  });
}

export async function updateOwnNannyProfile(payload: UpdateNannyProfilePayload) {
  return apiRequest<NannyProfile>(
    "/api/v1/nanny/profile",
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
    {
      requiresAuth: true,
    },
  );
}

export async function uploadNannyAvatar(file: File): Promise<ApiResponse<NannyProfile>> {
  const formData = new FormData();
  formData.append("avatar", file);

  try {
    return await apiRequest<NannyProfile>(
      "/api/v1/nanny/avatar",
      {
        method: "POST",
        body: formData,
      },
      {
        requiresAuth: true,
      },
    );
  } catch (error) {
    if (error instanceof ApiRequestError) {
      throw error;
    }
    throw new ApiRequestError("Upload failed");
  }
}

export async function deleteNannyAvatar(): Promise<ApiResponse<NannyProfile>> {
  return apiRequest<NannyProfile>(
    "/api/v1/nanny/avatar",
    {
      method: "DELETE",
    },
    {
      requiresAuth: true,
    },
  );
}

export async function listNannyDocuments() {
  return apiRequest<NannyDocumentListData>("/api/v1/nanny/documents", undefined, {
    requiresAuth: true,
  });
}

export async function uploadNannyDocument(file: File): Promise<ApiResponse<NannyDocument>> {
  const formData = new FormData();
  formData.append("document", file);

  try {
    return await apiRequest<NannyDocument>(
      "/api/v1/nanny/documents",
      {
        method: "POST",
        body: formData,
      },
      {
        requiresAuth: true,
      },
    );
  } catch (error) {
    if (error instanceof ApiRequestError) {
      throw error;
    }
    throw new ApiRequestError("Upload failed");
  }
}

export async function deleteNannyDocument(documentId: string): Promise<ApiResponse<unknown>> {
  return apiRequest<unknown>(
    `/api/v1/nanny/documents/${encodeURIComponent(documentId)}`,
    {
      method: "DELETE",
    },
    {
      requiresAuth: true,
    },
  );
}
