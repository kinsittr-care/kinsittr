package reviews

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/kinsittr/kinsittr-api/models"
)

var ErrReviewAlreadyExists = errors.New("review_already_exists")

type ReviewTarget string

const (
	NannyReviewTarget  ReviewTarget = "nanny"
	ParentReviewTarget ReviewTarget = "parent"
)

type ListReviewsFilter struct {
	Page       int
	Limit      int
	Search     string
	Flagged    *bool
	Visible    *bool
	NannyID    uuid.UUID
	ParentID   uuid.UUID
	Rating     int
	DateFrom   *time.Time
	DateTo     *time.Time
	AdminScope bool
}

type ReviewRecord struct {
	ID                uuid.UUID
	BookingID         uuid.UUID
	NannyProfileID    uuid.UUID
	ParentProfileID   uuid.UUID
	Rating            int
	Comment           string
	IsVisible         bool
	FlaggedAt         *time.Time
	FlaggedBy         *uuid.UUID
	FlagReason        *string
	ReviewedByAdmin   bool
	CreatedAt         time.Time
	UpdatedAt         time.Time
	Target            ReviewTarget
	NannyDisplayName  string
	NannyCity         string
	NannyProvince     string
	ParentDisplayName string
	ParentCity        string
	ParentProvince    string
	ParentEmail       string
	BookingDate       time.Time
	BookingStartTime  time.Time
	BookingStatus     models.BookingStatus
}

type AdminReviewActionRecord struct {
	models.AdminReviewAction
	AdminEmail *string
}

type CreateReviewParams struct {
	ID              uuid.UUID
	BookingID       uuid.UUID
	NannyProfileID  uuid.UUID
	ParentProfileID uuid.UUID
	Rating          int
	Comment         string
}

type AdminReviewActionParams struct {
	ReviewID    uuid.UUID
	AdminUserID uuid.UUID
	Reason      string
}

type ReviewsRepository interface {
	CreateReview(ctx context.Context, params CreateReviewParams) (ReviewRecord, error)
	CreateParentReview(ctx context.Context, params CreateReviewParams) (ReviewRecord, error)
	GetReviewByID(ctx context.Context, reviewID uuid.UUID, adminScope bool) (ReviewRecord, error)
	GetParentReviewByID(ctx context.Context, reviewID uuid.UUID, adminScope bool) (ReviewRecord, error)
	ListReviews(ctx context.Context, filter ListReviewsFilter) ([]ReviewRecord, int, error)
	ListParentReviews(ctx context.Context, filter ListReviewsFilter) ([]ReviewRecord, int, error)
	ListPublicNannyReviews(ctx context.Context, nannyProfileID uuid.UUID, page, limit int) ([]ReviewRecord, int, error)
	FlagReview(ctx context.Context, params AdminReviewActionParams) (ReviewRecord, error)
	UnflagReview(ctx context.Context, params AdminReviewActionParams) (ReviewRecord, error)
	FlagParentReview(ctx context.Context, params AdminReviewActionParams) (ReviewRecord, error)
	UnflagParentReview(ctx context.Context, params AdminReviewActionParams) (ReviewRecord, error)
	ListReviewActions(ctx context.Context, reviewID uuid.UUID, page, limit int) ([]AdminReviewActionRecord, int, error)
	ListParentReviewActions(ctx context.Context, reviewID uuid.UUID, page, limit int) ([]AdminReviewActionRecord, int, error)
}

var ReviewsRepo ReviewsRepository

func InitReviewsRepo(db *pgxpool.Pool) {
	ReviewsRepo = newPgRepository(db)
}
