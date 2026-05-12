package bookings

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/kinsittr/kinsittr-api/models"
)

var (
	ErrBookingAlreadyExists = errors.New("booking_already_exists")
	ErrNannyTimeUnavailable = errors.New("nanny_time_unavailable")
)

type BookingRecord struct {
	models.Booking
	NannyDisplayName  string `json:"nanny_display_name"`
	NannyCity         string `json:"nanny_city"`
	NannyProvince     string `json:"nanny_province"`
	ParentDisplayName string `json:"parent_display_name"`
	ParentCity        string `json:"parent_city"`
	ParentProvince    string `json:"parent_province"`
}

type ListBookingsFilter struct {
	Page     int
	Limit    int
	Status   models.BookingStatus
	DateFrom *time.Time
	DateTo   *time.Time
}

type BookingsRepository interface {
	HasParentActiveBookingWithNanny(ctx context.Context, parentProfileID, nannyProfileID uuid.UUID, startTime time.Time, duration int) (bool, error)
	HasNannyApprovedBookingConflict(ctx context.Context, nannyProfileID uuid.UUID, startTime time.Time, duration int) (bool, error)
	CreateBooking(ctx context.Context, booking models.Booking) (models.Booking, error)
	ListParentBookings(ctx context.Context, parentProfileID uuid.UUID, filter ListBookingsFilter) ([]BookingRecord, int, error)
	GetParentBookingByID(ctx context.Context, parentProfileID, bookingID uuid.UUID) (BookingRecord, error)
	CancelParentBooking(ctx context.Context, parentProfileID, bookingID uuid.UUID) (BookingRecord, error)
	ListNannyBookings(ctx context.Context, nannyProfileID uuid.UUID, filter ListBookingsFilter) ([]BookingRecord, int, error)
	GetNannyBookingByID(ctx context.Context, nannyProfileID, bookingID uuid.UUID) (BookingRecord, error)
	ApproveNannyBooking(ctx context.Context, nannyProfileID, bookingID uuid.UUID) (BookingRecord, error)
	DeclineNannyBooking(ctx context.Context, nannyProfileID, bookingID uuid.UUID) (BookingRecord, error)
}

var BookingsRepo BookingsRepository

func InitBookingsRepo(db *pgxpool.Pool) {
	BookingsRepo = newPgRepository(db)
}
