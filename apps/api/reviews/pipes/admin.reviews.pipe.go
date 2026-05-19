package pipes

import (
	"context"
	"strings"

	"github.com/google/uuid"
	reviewrepo "github.com/kinsittr/kinsittr-api/repositories/reviews"
	"github.com/kinsittr/kinsittr-api/reviews/dtos"
	"github.com/kinsittr/kinsittr-api/reviews/messages"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *ReviewsPipe) ListAdminReviews(ctx context.Context, dto dtos.ListReviewsQueryDTO) *shared.PipeRes[ReviewListData] {
	page, limit := normalizePageLimit(dto.Page, dto.Limit)
	target, ok := parseReviewTarget(dto.Target)
	if !ok {
		return pipeError[ReviewListData](messages.Invalid_Review_Target)
	}
	nannyID, ok := parseOptionalUUID(dto.NannyID)
	if !ok {
		return pipeError[ReviewListData](messages.Invalid_Review_Request)
	}
	parentID, ok := parseOptionalUUID(dto.ParentID)
	if !ok {
		return pipeError[ReviewListData](messages.Invalid_Review_Request)
	}
	dateFrom, ok := parseOptionalDate(dto.DateFrom)
	if !ok {
		return pipeError[ReviewListData](messages.Invalid_Review_Request)
	}
	dateTo, ok := parseOptionalDate(dto.DateTo)
	if !ok {
		return pipeError[ReviewListData](messages.Invalid_Review_Request)
	}
	if dateTo != nil {
		nextDay := dateTo.AddDate(0, 0, 1)
		dateTo = &nextDay
	}
	if dto.Rating < 0 || dto.Rating > 5 {
		return pipeError[ReviewListData](messages.Invalid_Review_Request)
	}

	filter := reviewrepo.ListReviewsFilter{
		Page:       page,
		Limit:      limit,
		Search:     dto.Search,
		Flagged:    dto.Flagged,
		Visible:    dto.Visible,
		NannyID:    nannyID,
		ParentID:   parentID,
		Rating:     dto.Rating,
		DateFrom:   dateFrom,
		DateTo:     dateTo,
		AdminScope: true,
	}
	var (
		records []reviewrepo.ReviewRecord
		total   int
		err     error
	)
	if target == reviewrepo.ParentReviewTarget {
		records, total, err = p.repo.ListParentReviews(ctx, filter)
	} else {
		records, total, err = p.repo.ListReviews(ctx, filter)
	}
	if err != nil {
		return pipeError[ReviewListData](messages.Invalid_Review_Request)
	}
	data := toReviewListData(records, page, limit, total, true)
	return pipeSuccess(messages.Reviews_Listed, &data)
}

func (p *ReviewsPipe) GetAdminReview(ctx context.Context, reviewID uuid.UUID, targetValue string) *shared.PipeRes[ReviewData] {
	target, ok := parseReviewTarget(targetValue)
	if !ok {
		return pipeError[ReviewData](messages.Invalid_Review_Target)
	}
	var (
		record reviewrepo.ReviewRecord
		err    error
	)
	if target == reviewrepo.ParentReviewTarget {
		record, err = p.repo.GetParentReviewByID(ctx, reviewID, true)
	} else {
		record, err = p.repo.GetReviewByID(ctx, reviewID, true)
	}
	if err != nil {
		return pipeError[ReviewData](messages.Invalid_Review_Request)
	}
	if record.ID == uuid.Nil {
		return pipeError[ReviewData](messages.Review_Not_Found)
	}
	data := toReviewData(record, true)
	return pipeSuccess(messages.Review_Fetched, &data)
}

func (p *ReviewsPipe) FlagReview(ctx context.Context, adminUserID, reviewID uuid.UUID, targetValue string, dto dtos.AdminReviewActionDTO) *shared.PipeRes[ReviewData] {
	return p.reviewModerationAction(ctx, adminUserID, reviewID, targetValue, dto, true)
}

func (p *ReviewsPipe) UnflagReview(ctx context.Context, adminUserID, reviewID uuid.UUID, targetValue string, dto dtos.AdminReviewActionDTO) *shared.PipeRes[ReviewData] {
	return p.reviewModerationAction(ctx, adminUserID, reviewID, targetValue, dto, false)
}

func (p *ReviewsPipe) reviewModerationAction(ctx context.Context, adminUserID, reviewID uuid.UUID, targetValue string, dto dtos.AdminReviewActionDTO, flag bool) *shared.PipeRes[ReviewData] {
	target, ok := parseReviewTarget(targetValue)
	if !ok {
		return pipeError[ReviewData](messages.Invalid_Review_Target)
	}
	reason := strings.TrimSpace(dto.Reason)
	if reason == "" || len(reason) > 500 {
		return pipeError[ReviewData](messages.Invalid_Review_Request)
	}

	var (
		record reviewrepo.ReviewRecord
		err    error
	)
	params := reviewrepo.AdminReviewActionParams{ReviewID: reviewID, AdminUserID: adminUserID, Reason: reason}
	if flag {
		if target == reviewrepo.ParentReviewTarget {
			record, err = p.repo.FlagParentReview(ctx, params)
		} else {
			record, err = p.repo.FlagReview(ctx, params)
		}
	} else {
		if target == reviewrepo.ParentReviewTarget {
			record, err = p.repo.UnflagParentReview(ctx, params)
		} else {
			record, err = p.repo.UnflagReview(ctx, params)
		}
	}
	if err != nil {
		return pipeError[ReviewData](messages.Invalid_Review_Request)
	}
	if record.ID == uuid.Nil {
		return pipeError[ReviewData](messages.Review_Not_Found)
	}
	data := toReviewData(record, true)
	if flag {
		return pipeSuccess(messages.Review_Flagged, &data)
	}
	return pipeSuccess(messages.Review_Unflagged, &data)
}

func (p *ReviewsPipe) ListReviewActions(ctx context.Context, reviewID uuid.UUID, targetValue string, page, limit int) *shared.PipeRes[AdminReviewActionListData] {
	target, ok := parseReviewTarget(targetValue)
	if !ok {
		return pipeError[AdminReviewActionListData](messages.Invalid_Review_Target)
	}
	page, limit = normalizePageLimit(page, limit)
	var (
		review reviewrepo.ReviewRecord
		err    error
	)
	if target == reviewrepo.ParentReviewTarget {
		review, err = p.repo.GetParentReviewByID(ctx, reviewID, true)
	} else {
		review, err = p.repo.GetReviewByID(ctx, reviewID, true)
	}
	if err != nil {
		return pipeError[AdminReviewActionListData](messages.Invalid_Review_Request)
	}
	if review.ID == uuid.Nil {
		return pipeError[AdminReviewActionListData](messages.Review_Not_Found)
	}

	var (
		records []reviewrepo.AdminReviewActionRecord
		total   int
	)
	if target == reviewrepo.ParentReviewTarget {
		records, total, err = p.repo.ListParentReviewActions(ctx, reviewID, page, limit)
	} else {
		records, total, err = p.repo.ListReviewActions(ctx, reviewID, page, limit)
	}
	if err != nil {
		return pipeError[AdminReviewActionListData](messages.Invalid_Review_Request)
	}
	items := make([]AdminReviewActionData, 0, len(records))
	for _, record := range records {
		items = append(items, toAdminReviewActionData(record))
	}
	data := AdminReviewActionListData{Items: items, Page: page, Limit: limit, Total: total}
	return pipeSuccess(messages.Review_Actions_Listed, &data)
}
