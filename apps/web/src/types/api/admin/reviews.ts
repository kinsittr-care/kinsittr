import type { Review, ReviewListData, ReviewTarget } from "../reviews";
import type { AdminReasonPayload } from "./shared";

export type { ReviewTarget };

export type AdminReview = Review;

export type AdminReviewListData = ReviewListData;

export interface ListAdminReviewsParams {
  page?: number;
  limit?: number;
  target?: ReviewTarget;
  search?: string;
  flagged?: boolean;
  visible?: boolean;
  nanny_id?: string;
  parent_id?: string;
  rating?: number;
  date_from?: string;
  date_to?: string;
}

export interface ListAdminReviewActionsParams {
  page?: number;
  limit?: number;
}

export type AdminReviewActionPayload = AdminReasonPayload;

export interface AdminReviewAction {
  id: string;
  review_id: string;
  admin_user_id?: string | null;
  admin_email?: string | null;
  action: string;
  reason: string;
  created_at: string;
}

export interface AdminReviewActionListData {
  items: AdminReviewAction[];
  page: number;
  limit: number;
  total: number;
}
