package pipes

import (
	"time"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/models"
	"github.com/kinsittr/kinsittr-api/repositories/bookings"
	"github.com/kinsittr/kinsittr-api/repositories/nanny"
	"github.com/kinsittr/kinsittr-api/repositories/profile"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

type BookingData struct {
	ID               string               `json:"id"`
	ParentProfileID  string               `json:"parent_profile_id"`
	NannyProfileID   string               `json:"nanny_profile_id"`
	ParentDisplayName string              `json:"parent_display_name,omitempty"`
	ParentCity        string              `json:"parent_city,omitempty"`
	ParentProvince    string              `json:"parent_province,omitempty"`
	NannyDisplayName string               `json:"nanny_display_name,omitempty"`
	NannyCity        string               `json:"nanny_city,omitempty"`
	NannyProvince    string               `json:"nanny_province,omitempty"`
	Date             string               `json:"date"`
	StartTime        string               `json:"start_time"`
	Duration         int                  `json:"duration"`
	TotalAmount      float64              `json:"total_amount"`
	Status           models.BookingStatus `json:"status"`
	CreatedAt        time.Time            `json:"created_at"`
	UpdatedAt        time.Time            `json:"updated_at"`
}

type BookingListData struct {
	Items []BookingData `json:"items"`
	Page  int           `json:"page"`
	Limit int           `json:"limit"`
	Total int           `json:"total"`
}

type BookingsPipe struct {
	repo        bookings.BookingsRepository
	profileRepo profile.ProfileRepository
	nannyRepo   nanny.NannyRepository
}

func NewBookingsPipe(repo bookings.BookingsRepository, profileRepo profile.ProfileRepository, nannyRepo nanny.NannyRepository) *BookingsPipe {
	return &BookingsPipe{
		repo:        repo,
		profileRepo: profileRepo,
		nannyRepo:   nannyRepo,
	}
}

func toBookingData(booking models.Booking) BookingData {
	return BookingData{
		ID:              booking.ID.String(),
		ParentProfileID: booking.ParentProfileID.String(),
		NannyProfileID:  booking.NannyProfileID.String(),
		Date:            booking.Date.Format("2006-01-02"),
		StartTime:       booking.StartTime.Format("15:04"),
		Duration:        booking.Duration,
		TotalAmount:     booking.TotalAmount,
		Status:          booking.Status,
		CreatedAt:       booking.CreatedAt,
		UpdatedAt:       booking.UpdatedAt,
	}
}

func toBookingRecordData(booking bookings.BookingRecord) BookingData {
	data := toBookingData(booking.Booking)
	data.ParentDisplayName = booking.ParentDisplayName
	data.ParentCity = booking.ParentCity
	data.ParentProvince = booking.ParentProvince
	data.NannyDisplayName = booking.NannyDisplayName
	data.NannyCity = booking.NannyCity
	data.NannyProvince = booking.NannyProvince
	return data
}

func pipeError[T any](message string) *shared.PipeRes[T] {
	return &shared.PipeRes[T]{
		Success: false,
		Message: shared.CreatePipeMessage(message),
	}
}

func pipeSuccess[T any](message string, data *T) *shared.PipeRes[T] {
	return &shared.PipeRes[T]{
		Success: true,
		Message: shared.CreatePipeMessage(message),
		Data:    data,
	}
}

func parseBookingDateTime(dateValue, timeValue string) (time.Time, time.Time, error) {
	date, err := time.Parse("2006-01-02", dateValue)
	if err != nil {
		return time.Time{}, time.Time{}, err
	}

	parsedTime, err := time.Parse("15:04", timeValue)
	if err != nil {
		return time.Time{}, time.Time{}, err
	}

	startDateTime := time.Date(
		date.Year(),
		date.Month(),
		date.Day(),
		parsedTime.Hour(),
		parsedTime.Minute(),
		0,
		0,
		time.UTC,
	)

	dateOnly := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, time.UTC)
	return dateOnly, startDateTime, nil
}

func parseUUID(value string) (uuid.UUID, error) {
	return uuid.Parse(value)
}

func parseBookingListStatus(value string) (models.BookingStatus, bool) {
	switch models.BookingStatus(value) {
	case "":
		return "", true
	case models.PendingBookingStatus, models.ApprovedBookingStatus, models.DeclinedBookingStatus, models.CancelledBookingStatus:
		return models.BookingStatus(value), true
	default:
		return "", false
	}
}

func parseDateBoundary(value string, endOfDay bool) (*time.Time, error) {
	if value == "" {
		return nil, nil
	}

	parsed, err := time.Parse("2006-01-02", value)
	if err != nil {
		return nil, err
	}

	if endOfDay {
		parsed = time.Date(parsed.Year(), parsed.Month(), parsed.Day(), 23, 59, 59, 0, time.UTC)
	} else {
		parsed = time.Date(parsed.Year(), parsed.Month(), parsed.Day(), 0, 0, 0, 0, time.UTC)
	}

	return &parsed, nil
}
