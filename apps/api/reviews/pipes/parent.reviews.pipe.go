package pipes

import (
	"context"
	"strings"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/models"
	reviewrepo "github.com/kinsittr/kinsittr-api/repositories/reviews"
	"github.com/kinsittr/kinsittr-api/reviews/dtos"
	"github.com/kinsittr/kinsittr-api/reviews/messages"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *ReviewsPipe) CreateParentReview(ctx context.Context, userID, bookingID uuid.UUID, dto dtos.CreateReviewDTO) *shared.PipeRes[ReviewData] {
	parentProfile, err := p.profileRepo.GetParentProfileByUserID(ctx, userID)
	if err != nil {
		return pipeError[ReviewData](messages.Invalid_Review_Request)
	}
	if parentProfile.ID == uuid.Nil {
		return pipeError[ReviewData](messages.Parent_Profile_Not_Found)
	}

	booking, err := p.bookingRepo.GetParentBookingByID(ctx, parentProfile.ID, bookingID)
	if err != nil {
		return pipeError[ReviewData](messages.Invalid_Review_Request)
	}
	if booking.ID == uuid.Nil {
		return pipeError[ReviewData](messages.Booking_Not_Found)
	}
	if booking.Status != models.CompletedBookingStatus {
		return pipeError[ReviewData](messages.Cannot_Review_Booking)
	}

	comment := strings.TrimSpace(dto.Comment)
	if dto.Rating < 1 || dto.Rating > 5 || comment == "" || len(comment) > 1000 {
		return pipeError[ReviewData](messages.Invalid_Review_Request)
	}

	record, err := p.repo.CreateReview(ctx, reviewrepo.CreateReviewParams{
		ID:              uuid.New(),
		BookingID:       booking.ID,
		NannyProfileID:  booking.NannyProfileID,
		ParentProfileID: parentProfile.ID,
		Rating:          dto.Rating,
		Comment:         comment,
	})
	if err != nil {
		return mapReviewCreateError[ReviewData](err)
	}
	data := toReviewData(record, false)
	return pipeSuccess(messages.Review_Created, &data)
}

func (p *ReviewsPipe) ListParentReviews(ctx context.Context, userID uuid.UUID, dto dtos.ListReviewsQueryDTO) *shared.PipeRes[ReviewListData] {
	parentProfile, err := p.profileRepo.GetParentProfileByUserID(ctx, userID)
	if err != nil {
		return pipeError[ReviewListData](messages.Invalid_Review_Request)
	}
	if parentProfile.ID == uuid.Nil {
		return pipeError[ReviewListData](messages.Parent_Profile_Not_Found)
	}

	page, limit := normalizePageLimit(dto.Page, dto.Limit)
	records, total, err := p.repo.ListReviews(ctx, reviewrepo.ListReviewsFilter{
		Page:       page,
		Limit:      limit,
		ParentID:   parentProfile.ID,
		AdminScope: true,
	})
	if err != nil {
		return pipeError[ReviewListData](messages.Invalid_Review_Request)
	}
	data := toReviewListData(records, page, limit, total, false)
	return pipeSuccess(messages.Reviews_Listed, &data)
}

func (p *ReviewsPipe) ListPublicNannyReviews(ctx context.Context, nannyID uuid.UUID, dto dtos.ListReviewsQueryDTO) *shared.PipeRes[ReviewListData] {
	page, limit := normalizePageLimit(dto.Page, dto.Limit)
	records, total, err := p.repo.ListPublicNannyReviews(ctx, nannyID, page, limit)
	if err != nil {
		return pipeError[ReviewListData](messages.Invalid_Review_Request)
	}
	data := toReviewListData(records, page, limit, total, false)
	return pipeSuccess(messages.Reviews_Listed, &data)
}

func (p *ReviewsPipe) CreateNannyReview(ctx context.Context, userID, bookingID uuid.UUID, dto dtos.CreateReviewDTO) *shared.PipeRes[ReviewData] {
	nannyProfile, err := p.profileRepo.GetNannyProfileByUserID(ctx, userID)
	if err != nil {
		return pipeError[ReviewData](messages.Invalid_Review_Request)
	}
	if nannyProfile.ID == uuid.Nil {
		return pipeError[ReviewData](messages.Nanny_Profile_Not_Found)
	}

	booking, err := p.bookingRepo.GetNannyBookingByID(ctx, nannyProfile.ID, bookingID)
	if err != nil {
		return pipeError[ReviewData](messages.Invalid_Review_Request)
	}
	if booking.ID == uuid.Nil {
		return pipeError[ReviewData](messages.Booking_Not_Found)
	}
	if booking.Status != models.CompletedBookingStatus {
		return pipeError[ReviewData](messages.Cannot_Review_Booking)
	}

	comment := strings.TrimSpace(dto.Comment)
	if dto.Rating < 1 || dto.Rating > 5 || comment == "" || len(comment) > 1000 {
		return pipeError[ReviewData](messages.Invalid_Review_Request)
	}

	record, err := p.repo.CreateParentReview(ctx, reviewrepo.CreateReviewParams{
		ID:              uuid.New(),
		BookingID:       booking.ID,
		NannyProfileID:  nannyProfile.ID,
		ParentProfileID: booking.ParentProfileID,
		Rating:          dto.Rating,
		Comment:         comment,
	})
	if err != nil {
		return mapReviewCreateError[ReviewData](err)
	}
	data := toReviewData(record, false)
	return pipeSuccess(messages.Review_Created, &data)
}

func (p *ReviewsPipe) ListNannyReviews(ctx context.Context, userID uuid.UUID, dto dtos.ListReviewsQueryDTO) *shared.PipeRes[ReviewListData] {
	nannyProfile, err := p.profileRepo.GetNannyProfileByUserID(ctx, userID)
	if err != nil {
		return pipeError[ReviewListData](messages.Invalid_Review_Request)
	}
	if nannyProfile.ID == uuid.Nil {
		return pipeError[ReviewListData](messages.Nanny_Profile_Not_Found)
	}

	page, limit := normalizePageLimit(dto.Page, dto.Limit)
	records, total, err := p.repo.ListParentReviews(ctx, reviewrepo.ListReviewsFilter{
		Page:       page,
		Limit:      limit,
		NannyID:    nannyProfile.ID,
		AdminScope: true,
	})
	if err != nil {
		return pipeError[ReviewListData](messages.Invalid_Review_Request)
	}
	data := toReviewListData(records, page, limit, total, false)
	return pipeSuccess(messages.Reviews_Listed, &data)
}
