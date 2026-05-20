import type {
  CreateReviewPayload,
  ListReviewsParams,
  Review,
  ReviewListData,
} from "@/src/types/api/api";
import { apiRequest } from "@/src/utils/api/api";

function buildReviewsQuery(params: ListReviewsParams = {}) {
  const query = new URLSearchParams();

  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.target) query.set("target", params.target);
  if (params.rating) query.set("rating", String(params.rating));
  if (typeof params.flagged === "boolean") query.set("flagged", String(params.flagged));
  if (typeof params.visible === "boolean") query.set("visible", String(params.visible));
  if (params.nanny_id) query.set("nanny_id", params.nanny_id);
  if (params.parent_id) query.set("parent_id", params.parent_id);
  if (params.date_from) query.set("date_from", params.date_from);
  if (params.date_to) query.set("date_to", params.date_to);
  if (params.search) query.set("search", params.search);

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

export function parentReviewsQueryKey(params: ListReviewsParams = {}) {
  return ["parent-reviews", params] as const;
}

export function nannyReviewsQueryKey(params: ListReviewsParams = {}) {
  return ["nanny-reviews", params] as const;
}

export function publicNannyReviewsQueryKey(nannyId: string, params: ListReviewsParams = {}) {
  return ["public-nanny-reviews", nannyId, params] as const;
}

export async function createParentReview(bookingId: string, payload: CreateReviewPayload) {
  return apiRequest<Review>(
    `/api/v1/bookings/${bookingId}/review`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    { requiresAuth: true },
  );
}

export async function createNannyReview(bookingId: string, payload: CreateReviewPayload) {
  return apiRequest<Review>(
    `/api/v1/nanny/bookings/${bookingId}/review`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    { requiresAuth: true },
  );
}

export async function listParentReviews(params: ListReviewsParams = {}) {
  return apiRequest<ReviewListData>(
    `/api/v1/reviews${buildReviewsQuery(params)}`,
    undefined,
    { requiresAuth: true },
  );
}

export async function listNannyReviews(params: ListReviewsParams = {}) {
  return apiRequest<ReviewListData>(
    `/api/v1/nanny/reviews${buildReviewsQuery(params)}`,
    undefined,
    { requiresAuth: true },
  );
}

export async function listPublicNannyReviews(nannyId: string, params: ListReviewsParams = {}) {
  return apiRequest<ReviewListData>(
    `/api/v1/nannies/${nannyId}/reviews${buildReviewsQuery(params)}`,
  );
}

async function findReviewedBookingIds(
  bookingIds: string[],
  listReviews: (params: ListReviewsParams) => Promise<{ data?: ReviewListData }>,
) {
  const targets = new Set(bookingIds);
  const found = new Set<string>();
  if (targets.size === 0) return found;

  const limit = 100;
  let page = 1;
  let total = 0;

  do {
    const response = await listReviews({ page, limit });
    const data = response.data;
    for (const review of data?.items ?? []) {
      if (targets.has(review.booking_id)) {
        found.add(review.booking_id);
      }
    }
    total = data?.total ?? 0;
    if (found.size === targets.size) break;
    page += 1;
  } while ((page - 1) * limit < total);

  return found;
}

export function parentReviewedBookingIdsQueryKey(bookingIds: string[]) {
  return ["parent-reviewed-booking-ids", [...bookingIds].sort()] as const;
}

export function nannyReviewedBookingIdsQueryKey(bookingIds: string[]) {
  return ["nanny-reviewed-booking-ids", [...bookingIds].sort()] as const;
}

export async function findParentReviewedBookingIds(bookingIds: string[]) {
  return findReviewedBookingIds(bookingIds, listParentReviews);
}

export async function findNannyReviewedBookingIds(bookingIds: string[]) {
  return findReviewedBookingIds(bookingIds, listNannyReviews);
}
