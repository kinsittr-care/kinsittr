"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { A } from "./tokens";
import AdminPageHeader from "./compositions/AdminPageHeader";
import AdminReasonDialog, { type AdminReasonDialogState } from "./AdminReasonDialog";
import FlaggedReviewDetailPanel from "./compositions/FlaggedReviewDetailPanel";
import FlaggedReviewFilters, { type ReviewStatusFilter } from "./compositions/FlaggedReviewFilters";
import FlaggedReviewList from "./compositions/FlaggedReviewList";
import type { ListAdminReviewActionsParams, ListAdminReviewsParams, ReviewTarget } from "@/src/types/api/admin";
import {
  adminReviewActionsQueryKey,
  adminReviewQueryKey,
  adminReviewsQueryKey,
  flagAdminReview,
  getAdminReview,
  listAdminReviewActions,
  listAdminReviews,
  unflagAdminReview,
} from "@/src/utils/api/admin/reviews";

const PAGE_SIZE = 20;

function paramsForStatus(status: ReviewStatusFilter): Pick<ListAdminReviewsParams, "flagged" | "visible"> {
  if (status === "flagged") return { flagged: true };
  if (status === "visible") return { visible: true };
  if (status === "hidden") return { visible: false };
  return {};
}

export default function FlaggedReviewsView() {
  const queryClient = useQueryClient();
  const [target, setTarget] = useState<ReviewTarget | "">("");
  const [status, setStatus] = useState<ReviewStatusFilter>("flagged");
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [rating, setRating] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [nannyId, setNannyId] = useState("");
  const [parentId, setParentId] = useState("");
  const [page, setPage] = useState(1);
  const [selectedReview, setSelectedReview] = useState<{ id: string; target: ReviewTarget } | null>(null);
  const [reasonAction, setReasonAction] = useState<AdminReasonDialogState | null>(null);

  const params = useMemo<ListAdminReviewsParams>(
    () => ({
      page,
      limit: PAGE_SIZE,
      target: target || undefined,
      search: submittedSearch || undefined,
      rating: rating ? Number(rating) : undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      nanny_id: nannyId.trim() || undefined,
      parent_id: parentId.trim() || undefined,
      ...paramsForStatus(status),
    }),
    [dateFrom, dateTo, nannyId, page, parentId, rating, status, submittedSearch, target],
  );
  const actionParams = useMemo<ListAdminReviewActionsParams>(() => ({ page: 1, limit: 20 }), []);

  const reviewsQuery = useQuery({
    queryKey: adminReviewsQueryKey(params),
    queryFn: () => listAdminReviews(params),
  });
  const reviews = reviewsQuery.data?.data?.items ?? [];
  const total = reviewsQuery.data?.data?.total ?? 0;
  const fallbackSelected = reviews.find(
    (review) => review.id === selectedReview?.id && review.target === selectedReview.target,
  );

  const detailQuery = useQuery({
    queryKey: selectedReview
      ? adminReviewQueryKey(selectedReview.id, selectedReview.target)
      : ["admin", "review", "none"],
    queryFn: () => getAdminReview(selectedReview?.id as string, selectedReview?.target as ReviewTarget),
    enabled: Boolean(selectedReview),
  });
  const currentReview = detailQuery.data?.data ?? fallbackSelected ?? null;

  const actionsQuery = useQuery({
    queryKey: selectedReview
      ? adminReviewActionsQueryKey(selectedReview.id, selectedReview.target, actionParams)
      : ["admin", "review-actions", "none"],
    queryFn: () =>
      listAdminReviewActions(
        selectedReview?.id as string,
        selectedReview?.target as ReviewTarget,
        actionParams,
      ),
    enabled: Boolean(selectedReview),
  });
  const actions = actionsQuery.data?.data?.items ?? [];

  const invalidateReview = async (reviewId: string, reviewTarget: ReviewTarget) => {
    await queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
    await queryClient.invalidateQueries({ queryKey: adminReviewQueryKey(reviewId, reviewTarget) });
    await queryClient.invalidateQueries({ queryKey: ["admin", "review-actions", reviewId, reviewTarget] });
  };

  const flagMutation = useMutation({
    mutationFn: ({ id, reviewTarget, reason }: { id: string; reviewTarget: ReviewTarget; reason: string }) =>
      flagAdminReview(id, reviewTarget, { reason }),
    onSuccess: async (_data, variables) => invalidateReview(variables.id, variables.reviewTarget),
  });

  const unflagMutation = useMutation({
    mutationFn: ({ id, reviewTarget, reason }: { id: string; reviewTarget: ReviewTarget; reason: string }) =>
      unflagAdminReview(id, reviewTarget, { reason }),
    onSuccess: async (_data, variables) => invalidateReview(variables.id, variables.reviewTarget),
  });

  const actionError =
    reviewsQuery.error || detailQuery.error || actionsQuery.error || flagMutation.error || unflagMutation.error;
  const currentIsBusy =
    currentReview &&
    ((flagMutation.isPending && flagMutation.variables?.id === currentReview.id) ||
      (unflagMutation.isPending && unflagMutation.variables?.id === currentReview.id));

  return (
    <>
      <AdminPageHeader
        title="Flagged Reviews"
        subtitle={`${total} reviews found`}
        right={
          <FlaggedReviewFilters
            dateFrom={dateFrom}
            dateTo={dateTo}
            nannyId={nannyId}
            parentId={parentId}
            rating={rating}
            search={search}
            status={status}
            target={target}
            onDateFromChange={(value) => {
              setPage(1);
              setDateFrom(value);
              setSelectedReview(null);
            }}
            onDateToChange={(value) => {
              setPage(1);
              setDateTo(value);
              setSelectedReview(null);
            }}
            onNannyIdChange={(value) => {
              setPage(1);
              setNannyId(value);
              setSelectedReview(null);
            }}
            onParentIdChange={(value) => {
              setPage(1);
              setParentId(value);
              setSelectedReview(null);
            }}
            onRatingChange={(value) => {
              setPage(1);
              setRating(value);
              setSelectedReview(null);
            }}
            onSearchChange={setSearch}
            onSearchSubmit={() => {
              setPage(1);
              setSubmittedSearch(search.trim());
              setSelectedReview(null);
            }}
            onStatusChange={(value) => {
              setPage(1);
              setStatus(value);
              setSelectedReview(null);
            }}
            onTargetChange={(value) => {
              setPage(1);
              setTarget(value);
              setSelectedReview(null);
            }}
          />
        }
      />
      <div
        style={{
          padding: "24px 40px 40px",
          display: "grid",
          gridTemplateColumns: currentReview ? "1fr 360px" : "1fr",
          gap: 18,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {actionError && (
            <p style={{ color: A.red, fontSize: 14, margin: 0 }}>
              {actionError instanceof Error ? actionError.message : "Unable to update review moderation."}
            </p>
          )}

          <FlaggedReviewList
            reviews={reviews}
            isLoading={reviewsQuery.isLoading}
            selectedReview={selectedReview}
            page={page}
            total={total}
            limit={PAGE_SIZE}
            onSelect={setSelectedReview}
            onPageChange={setPage}
          />
        </div>

        {currentReview && (
          <FlaggedReviewDetailPanel
            review={currentReview}
            actions={actions}
            isLoadingActions={actionsQuery.isLoading}
            isBusy={Boolean(currentIsBusy)}
            onHide={() => {
              setReasonAction({
                title: "Hide review",
                description: "Hide this review from public surfaces. A reason is required for the admin audit trail.",
                submitLabel: "Hide review",
                tone: "danger",
                onSubmit: (reason) => {
                  flagMutation.mutate({ id: currentReview.id, reviewTarget: currentReview.target, reason });
                  setReasonAction(null);
                },
              });
            }}
            onRestore={() => {
              setReasonAction({
                title: "Restore review",
                description: "Restore this review to public visibility. A reason is required for the admin audit trail.",
                submitLabel: "Restore review",
                tone: "approve",
                onSubmit: (reason) => {
                  unflagMutation.mutate({ id: currentReview.id, reviewTarget: currentReview.target, reason });
                  setReasonAction(null);
                },
              });
            }}
          />
        )}
      </div>
      <AdminReasonDialog
        action={reasonAction}
        isSubmitting={flagMutation.isPending || unflagMutation.isPending}
        onClose={() => setReasonAction(null)}
      />
    </>
  );
}
