"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { A } from "./tokens";
import AdminPageHeader from "./AdminPageHeader";
import AdminPagination from "./AdminPagination";
import AdminPill from "./AdminPill";
import AdminStars from "./AdminStars";
import { btnApprove, btnDanger, btnGhost, card } from "./admin-styles";
import type {
  AdminReview,
  ListAdminReviewActionsParams,
  ListAdminReviewsParams,
  ReviewTarget,
} from "@/src/types/api/admin";
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
import { formatShortDate, formatShortDateTime } from "@/src/utils/format";

type ReviewStatusFilter = "flagged" | "visible" | "hidden" | "all";

const targetFilters: Array<{ label: string; value: ReviewTarget | "" }> = [
  { label: "All targets", value: "" },
  { label: "Nanny reviews", value: "nanny" },
  { label: "Parent reviews", value: "parent" },
];

const statusFilters: Array<{ label: string; value: ReviewStatusFilter }> = [
  { label: "Flagged", value: "flagged" },
  { label: "Visible", value: "visible" },
  { label: "Hidden", value: "hidden" },
  { label: "All", value: "all" },
];

const PAGE_SIZE = 20;

const filterInputStyle: React.CSSProperties = {
  padding: "10px 14px",
  background: A.card,
  border: `1px solid ${A.border}`,
  borderRadius: 10,
  color: A.ink,
  minWidth: 140,
};

function paramsForStatus(status: ReviewStatusFilter): Pick<ListAdminReviewsParams, "flagged" | "visible"> {
  if (status === "flagged") return { flagged: true };
  if (status === "visible") return { visible: true };
  if (status === "hidden") return { visible: false };
  return {};
}

function reviewerName(review: AdminReview) {
  return review.target === "nanny" ? review.parent_display_name : review.nanny_display_name;
}

function targetName(review: AdminReview) {
  return review.target === "nanny" ? review.nanny_display_name : review.parent_display_name;
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

  const askReason = (action: string) => window.prompt(`Reason for ${action} this review?`)?.trim();
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
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setPage(1);
              setSubmittedSearch(search.trim());
              setSelectedReview(null);
            }}
            style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end", maxWidth: 900 }}
          >
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search reviews..."
              style={filterInputStyle}
            />
            <select
              value={rating}
              onChange={(event) => {
                setPage(1);
                setRating(event.target.value);
                setSelectedReview(null);
              }}
              style={filterInputStyle}
              aria-label="Review rating"
            >
              <option value="">All ratings</option>
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>{value} star</option>
              ))}
            </select>
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => {
                setPage(1);
                setDateFrom(event.target.value);
                setSelectedReview(null);
              }}
              style={filterInputStyle}
              aria-label="Review date from"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(event) => {
                setPage(1);
                setDateTo(event.target.value);
                setSelectedReview(null);
              }}
              style={filterInputStyle}
              aria-label="Review date to"
            />
            <input
              value={nannyId}
              onChange={(event) => {
                setPage(1);
                setNannyId(event.target.value);
                setSelectedReview(null);
              }}
              placeholder="Nanny ID"
              style={filterInputStyle}
            />
            <input
              value={parentId}
              onChange={(event) => {
                setPage(1);
                setParentId(event.target.value);
                setSelectedReview(null);
              }}
              placeholder="Parent ID"
              style={filterInputStyle}
            />
            <button type="submit" style={btnGhost}>Search</button>
            {targetFilters.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setPage(1);
                  setTarget(item.value);
                  setSelectedReview(null);
                }}
                style={{
                  ...btnGhost,
                  borderColor: target === item.value ? A.clay : A.border,
                  color: target === item.value ? A.clay : A.inkMid,
                }}
              >
                {item.label}
              </button>
            ))}
            {statusFilters.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  setPage(1);
                  setStatus(item.value);
                  setSelectedReview(null);
                }}
                style={{
                  ...btnGhost,
                  borderColor: status === item.value ? A.clay : A.border,
                  color: status === item.value ? A.clay : A.inkMid,
                }}
              >
                {item.label}
              </button>
            ))}
          </form>
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

          {reviewsQuery.isLoading ? (
            <div style={card}>
              <p style={{ margin: 0, color: A.inkSoft }}>Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div style={card}>
              <p style={{ margin: 0, color: A.inkSoft }}>No reviews found.</p>
            </div>
          ) : (
            reviews.map((review) => (
              <button
                key={`${review.target}-${review.id}`}
                onClick={() => setSelectedReview({ id: review.id, target: review.target })}
                style={{
                  ...card,
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  cursor: "pointer",
                  background:
                    selectedReview?.id === review.id && selectedReview.target === review.target
                      ? A.cardWarm
                      : A.card,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  <div style={{ fontSize: 15.5, color: A.ink }}>
                    <span style={{ fontWeight: 700 }}>{reviewerName(review)}</span>
                    <span style={{ color: A.inkSoft, margin: "0 8px" }}>review of</span>
                    <span style={{ fontWeight: 700 }}>{targetName(review)}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <AdminPill tone={review.is_visible ? "green" : "red"}>
                      {review.is_visible ? "Visible" : "Hidden"}
                    </AdminPill>
                    <AdminPill tone={review.reviewed_by_admin ? "clay" : "amber"}>
                      {review.reviewed_by_admin ? "Reviewed" : "Needs review"}
                    </AdminPill>
                    <span style={{ fontSize: 13, color: A.inkSoft }}>{formatShortDate(review.created_at)}</span>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 16,
                    padding: "18px 20px",
                    background: A.bgSoft,
                    border: `1px solid ${A.borderSoft}`,
                    borderRadius: 12,
                  }}
                >
                  <AdminStars value={review.rating} />
                  <p
                    style={{
                      marginTop: 12,
                      fontFamily: "var(--font-dm-serif), serif",
                      fontStyle: "italic",
                      fontSize: 17,
                      color: A.ink,
                      lineHeight: 1.4,
                    }}
                  >
                    &ldquo;{review.comment}&rdquo;
                  </p>
                  {review.flag_reason && (
                    <p style={{ margin: "10px 0 0", color: A.red, fontSize: 13 }}>
                      Flag reason: {review.flag_reason}
                    </p>
                  )}
                </div>
              </button>
            ))
          )}
          <AdminPagination page={page} total={total} limit={PAGE_SIZE} onPageChange={setPage} />
        </div>

        {currentReview && (
          <aside
            style={{
              background: A.card,
              border: `1px solid ${A.border}`,
              borderRadius: 16,
              boxShadow: A.shadow,
              padding: 22,
              alignSelf: "start",
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: A.inkSoft, fontFamily: "monospace" }}>
                {currentReview.id}
              </div>
              <h2 style={{ margin: "8px 0 0", fontFamily: "var(--font-dm-serif), serif", fontSize: 24, color: A.ink }}>
                Review details
              </h2>
              <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <AdminPill tone="clay">{currentReview.target} review</AdminPill>
                <AdminPill tone={currentReview.is_visible ? "green" : "red"}>
                  {currentReview.is_visible ? "Visible" : "Hidden"}
                </AdminPill>
              </div>
            </div>

            <div style={{ display: "grid", gap: 10, fontSize: 14, color: A.inkMid }}>
              <div><strong style={{ color: A.ink }}>Reviewer:</strong> {reviewerName(currentReview)}</div>
              <div><strong style={{ color: A.ink }}>Target:</strong> {targetName(currentReview)}</div>
              <div><strong style={{ color: A.ink }}>Booking:</strong> {currentReview.booking_date} at {currentReview.booking_start_time}</div>
              <div><strong style={{ color: A.ink }}>Rating:</strong> {currentReview.rating}/5</div>
              {currentReview.flag_reason && (
                <div><strong style={{ color: A.ink }}>Flag reason:</strong> {currentReview.flag_reason}</div>
              )}
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                disabled={!currentReview.is_visible || Boolean(currentIsBusy)}
                onClick={() => {
                  const reason = askReason("hiding");
                  if (reason) flagMutation.mutate({ id: currentReview.id, reviewTarget: currentReview.target, reason });
                }}
                style={{ ...btnDanger, opacity: currentReview.is_visible && !currentIsBusy ? 1 : 0.55 }}
              >
                Hide review
              </button>
              <button
                disabled={currentReview.is_visible || Boolean(currentIsBusy)}
                onClick={() => {
                  const reason = askReason("restoring");
                  if (reason) unflagMutation.mutate({ id: currentReview.id, reviewTarget: currentReview.target, reason });
                }}
                style={{ ...btnApprove, opacity: !currentReview.is_visible && !currentIsBusy ? 1 : 0.55 }}
              >
                Restore
              </button>
            </div>

            <div>
              <h3 style={{ margin: "0 0 10px", fontSize: 13, letterSpacing: ".12em", textTransform: "uppercase", color: A.inkSoft }}>
                Action history
              </h3>
              {actionsQuery.isLoading ? (
                <p style={{ margin: 0, color: A.inkSoft, fontSize: 14 }}>Loading actions...</p>
              ) : actions.length === 0 ? (
                <p style={{ margin: 0, color: A.inkSoft, fontSize: 14 }}>No admin actions yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {actions.map((action) => (
                    <div key={action.id} style={{ borderTop: `1px solid ${A.borderSoft}`, paddingTop: 10 }}>
                      <div style={{ fontSize: 13.5, color: A.ink, fontWeight: 600 }}>{action.action}</div>
                      <div style={{ fontSize: 12.5, color: A.inkSoft, marginTop: 3 }}>
                        {formatShortDateTime(action.created_at)}
                      </div>
                      <div style={{ fontSize: 13, color: A.inkMid, marginTop: 5 }}>{action.reason}</div>
                      {action.admin_email && (
                        <div style={{ fontSize: 12, color: A.inkSoft, marginTop: 4 }}>{action.admin_email}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </>
  );
}
