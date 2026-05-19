package pipes

import (
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/models"
	"github.com/kinsittr/kinsittr-api/repositories/bookings"
	"github.com/kinsittr/kinsittr-api/repositories/profile"
	reviewrepo "github.com/kinsittr/kinsittr-api/repositories/reviews"
	"github.com/kinsittr/kinsittr-api/reviews/messages"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

type ReviewsPipe struct {
	repo        reviewrepo.ReviewsRepository
	bookingRepo bookings.BookingsRepository
	profileRepo profile.ProfileRepository
}

type ReviewData struct {
	Target            string               `json:"target"`
	ID                string               `json:"id"`
	BookingID         string               `json:"booking_id"`
	NannyProfileID    string               `json:"nanny_profile_id"`
	ParentProfileID   string               `json:"parent_profile_id"`
	NannyDisplayName  string               `json:"nanny_display_name"`
	NannyCity         string               `json:"nanny_city"`
	NannyProvince     string               `json:"nanny_province"`
	ParentDisplayName string               `json:"parent_display_name"`
	ParentCity        string               `json:"parent_city"`
	ParentProvince    string               `json:"parent_province"`
	ParentEmail       string               `json:"parent_email,omitempty"`
	BookingDate       string               `json:"booking_date"`
	BookingStartTime  string               `json:"booking_start_time"`
	BookingStatus     models.BookingStatus `json:"booking_status"`
	Rating            int                  `json:"rating"`
	Comment           string               `json:"comment"`
	IsVisible         bool                 `json:"is_visible"`
	FlaggedAt         *time.Time           `json:"flagged_at,omitempty"`
	FlaggedBy         *string              `json:"flagged_by,omitempty"`
	FlagReason        *string              `json:"flag_reason,omitempty"`
	ReviewedByAdmin   bool                 `json:"reviewed_by_admin"`
	CreatedAt         time.Time            `json:"created_at"`
	UpdatedAt         time.Time            `json:"updated_at"`
}

type ReviewListData struct {
	Items []ReviewData `json:"items"`
	Page  int          `json:"page"`
	Limit int          `json:"limit"`
	Total int          `json:"total"`
}

type AdminReviewActionData struct {
	ID          string    `json:"id"`
	ReviewID    string    `json:"review_id"`
	AdminUserID *string   `json:"admin_user_id,omitempty"`
	AdminEmail  *string   `json:"admin_email,omitempty"`
	Action      string    `json:"action"`
	Reason      string    `json:"reason"`
	CreatedAt   time.Time `json:"created_at"`
}

type AdminReviewActionListData struct {
	Items []AdminReviewActionData `json:"items"`
	Page  int                     `json:"page"`
	Limit int                     `json:"limit"`
	Total int                     `json:"total"`
}

func NewReviewsPipe(repo reviewrepo.ReviewsRepository, bookingRepo bookings.BookingsRepository, profileRepo profile.ProfileRepository) *ReviewsPipe {
	return &ReviewsPipe{repo: repo, bookingRepo: bookingRepo, profileRepo: profileRepo}
}

func pipeError[T any](message string) *shared.PipeRes[T] {
	return &shared.PipeRes[T]{Success: false, Message: shared.CreatePipeMessage(message)}
}

func pipeSuccess[T any](message string, data *T) *shared.PipeRes[T] {
	return &shared.PipeRes[T]{Success: true, Message: shared.CreatePipeMessage(message), Data: data}
}

func normalizePageLimit(page, limit int) (int, int) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}
	return page, limit
}

func parseOptionalDate(value string) (*time.Time, bool) {
	if strings.TrimSpace(value) == "" {
		return nil, true
	}
	parsed, err := time.Parse("2006-01-02", value)
	if err != nil {
		return nil, false
	}
	return &parsed, true
}

func parseReviewTarget(value string) (reviewrepo.ReviewTarget, bool) {
	switch reviewrepo.ReviewTarget(strings.TrimSpace(value)) {
	case "", reviewrepo.NannyReviewTarget:
		return reviewrepo.NannyReviewTarget, true
	case reviewrepo.ParentReviewTarget:
		return reviewrepo.ParentReviewTarget, true
	default:
		return "", false
	}
}

func parseOptionalUUID(value string) (uuid.UUID, bool) {
	if strings.TrimSpace(value) == "" {
		return uuid.Nil, true
	}
	parsed, err := uuid.Parse(value)
	if err != nil {
		return uuid.Nil, false
	}
	return parsed, true
}

func toReviewData(record reviewrepo.ReviewRecord, includeAdminFields bool) ReviewData {
	data := ReviewData{
		Target:            string(record.Target),
		ID:                record.ID.String(),
		BookingID:         record.BookingID.String(),
		NannyProfileID:    record.NannyProfileID.String(),
		ParentProfileID:   record.ParentProfileID.String(),
		NannyDisplayName:  record.NannyDisplayName,
		NannyCity:         record.NannyCity,
		NannyProvince:     record.NannyProvince,
		ParentDisplayName: record.ParentDisplayName,
		ParentCity:        record.ParentCity,
		ParentProvince:    record.ParentProvince,
		BookingDate:       record.BookingDate.Format("2006-01-02"),
		BookingStartTime:  record.BookingStartTime.Format("15:04"),
		BookingStatus:     record.BookingStatus,
		Rating:            record.Rating,
		Comment:           record.Comment,
		IsVisible:         record.IsVisible,
		CreatedAt:         record.CreatedAt,
		UpdatedAt:         record.UpdatedAt,
	}
	if includeAdminFields {
		data.ParentEmail = record.ParentEmail
		data.FlaggedAt = record.FlaggedAt
		data.FlagReason = record.FlagReason
		data.ReviewedByAdmin = record.ReviewedByAdmin
		if record.FlaggedBy != nil {
			value := record.FlaggedBy.String()
			data.FlaggedBy = &value
		}
	}
	return data
}

func toReviewListData(records []reviewrepo.ReviewRecord, page, limit, total int, includeAdminFields bool) ReviewListData {
	items := make([]ReviewData, 0, len(records))
	for _, record := range records {
		items = append(items, toReviewData(record, includeAdminFields))
	}
	return ReviewListData{Items: items, Page: page, Limit: limit, Total: total}
}

func toAdminReviewActionData(record reviewrepo.AdminReviewActionRecord) AdminReviewActionData {
	data := AdminReviewActionData{
		ID:         record.ID.String(),
		ReviewID:   record.ReviewID.String(),
		Action:     string(record.Action),
		Reason:     record.Reason,
		CreatedAt:  record.CreatedAt,
		AdminEmail: record.AdminEmail,
	}
	if record.AdminUserID != nil {
		value := record.AdminUserID.String()
		data.AdminUserID = &value
	}
	return data
}

func mapReviewCreateError[T any](err error) *shared.PipeRes[T] {
	if errors.Is(err, reviewrepo.ErrReviewAlreadyExists) {
		return pipeError[T](messages.Review_Already_Exists)
	}
	return pipeError[T](messages.Invalid_Review_Request)
}
