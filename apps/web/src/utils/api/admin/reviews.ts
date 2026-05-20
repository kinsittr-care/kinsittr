import type {
  AdminReview,
  AdminReviewActionListData,
  AdminReviewActionPayload,
  AdminReviewListData,
  ListAdminReviewActionsParams,
  ListAdminReviewsParams,
  ReviewTarget,
} from "@/src/types/api/admin";
import { adminApiRequest } from "./client";

export const adminReviewsQueryKey = (params: ListAdminReviewsParams = {}) => [
  "admin",
  "reviews",
  params,
];

export const adminReviewQueryKey = (reviewId: string, target: ReviewTarget) => [
  "admin",
  "review",
  reviewId,
  target,
];

export const adminReviewActionsQueryKey = (
  reviewId: string,
  target: ReviewTarget,
  params: ListAdminReviewActionsParams = {},
) => ["admin", "review-actions", reviewId, target, params];

function buildReviewQuery(params: ListAdminReviewsParams | ListAdminReviewActionsParams) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if ("target" in params && params.target) query.set("target", params.target);
  if ("search" in params && params.search) query.set("search", params.search);
  if ("flagged" in params && typeof params.flagged === "boolean") query.set("flagged", String(params.flagged));
  if ("visible" in params && typeof params.visible === "boolean") query.set("visible", String(params.visible));
  if ("nanny_id" in params && params.nanny_id) query.set("nanny_id", params.nanny_id);
  if ("parent_id" in params && params.parent_id) query.set("parent_id", params.parent_id);
  if ("rating" in params && params.rating) query.set("rating", String(params.rating));
  if ("date_from" in params && params.date_from) query.set("date_from", params.date_from);
  if ("date_to" in params && params.date_to) query.set("date_to", params.date_to);

  const value = query.toString();
  return value ? `?${value}` : "";
}

function targetQuery(target: ReviewTarget) {
  return `?target=${encodeURIComponent(target)}`;
}

export async function listAdminReviews(params: ListAdminReviewsParams = {}) {
  return adminApiRequest<AdminReviewListData>(`/api/v1/admin/reviews${buildReviewQuery(params)}`);
}

export async function getAdminReview(reviewId: string, target: ReviewTarget) {
  return adminApiRequest<AdminReview>(`/api/v1/admin/reviews/${reviewId}${targetQuery(target)}`);
}

export async function listAdminReviewActions(
  reviewId: string,
  target: ReviewTarget,
  params: ListAdminReviewActionsParams = {},
) {
  return adminApiRequest<AdminReviewActionListData>(
    `/api/v1/admin/reviews/${reviewId}/actions${buildReviewQuery({ ...params, target })}`,
  );
}

export async function flagAdminReview(
  reviewId: string,
  target: ReviewTarget,
  payload: AdminReviewActionPayload,
) {
  return adminApiRequest<AdminReview>(`/api/v1/admin/reviews/${reviewId}/flag${targetQuery(target)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function unflagAdminReview(
  reviewId: string,
  target: ReviewTarget,
  payload: AdminReviewActionPayload,
) {
  return adminApiRequest<AdminReview>(`/api/v1/admin/reviews/${reviewId}/unflag${targetQuery(target)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
