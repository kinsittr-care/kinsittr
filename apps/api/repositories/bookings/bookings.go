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
	ErrBookingAlreadyExists       = errors.New("booking_already_exists")
	ErrNannyTimeUnavailable       = errors.New("nanny_time_unavailable")
	ErrPendingChangeRequestExists = errors.New("pending_change_request_exists")
)

type BookingRecord struct {
	models.Booking
	ConversationID        string `json:"conversation_id,omitempty"`
	NannyDisplayName      string `json:"nanny_display_name"`
	NannyCity             string `json:"nanny_city"`
	NannyProvince         string `json:"nanny_province"`
	ParentDisplayName     string `json:"parent_display_name"`
	ParentCity            string `json:"parent_city"`
	ParentProvince        string `json:"parent_province"`
	PaymentStatus         string `json:"payment_status,omitempty"`
	PaymentFailureMessage string `json:"payment_failure_message,omitempty"`
	StripePaymentIntentID string `json:"stripe_payment_intent_id,omitempty"`
	StripeChargeID        string `json:"stripe_charge_id,omitempty"`
	StripeRefundID        string `json:"stripe_refund_id,omitempty"`
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
	HasNannyApprovedBookingConflictExcluding(ctx context.Context, nannyProfileID uuid.UUID, startTime time.Time, duration int, excludeBookingID uuid.UUID) (bool, error)
	CreateBooking(ctx context.Context, booking models.Booking) (models.Booking, error)
	ListParentBookings(ctx context.Context, parentProfileID uuid.UUID, filter ListBookingsFilter) ([]BookingRecord, int, error)
	GetParentBookingByID(ctx context.Context, parentProfileID, bookingID uuid.UUID) (BookingRecord, error)
	CancelParentBooking(ctx context.Context, parentProfileID, bookingID uuid.UUID) (BookingRecord, error)
	ListNannyBookings(ctx context.Context, nannyProfileID uuid.UUID, filter ListBookingsFilter) ([]BookingRecord, int, error)
	GetNannyBookingByID(ctx context.Context, nannyProfileID, bookingID uuid.UUID) (BookingRecord, error)
	ApproveNannyBooking(ctx context.Context, nannyProfileID, bookingID uuid.UUID) (BookingRecord, error)
	ApproveNannyBookingWithConversation(ctx context.Context, nannyProfileID, bookingID uuid.UUID) (BookingRecord, error)
	DeclineNannyBooking(ctx context.Context, nannyProfileID, bookingID uuid.UUID) (BookingRecord, error)
	CreateBookingChangeRequest(ctx context.Context, request models.BookingChangeRequest) (models.BookingChangeRequest, error)
	ListBookingChangeRequests(ctx context.Context, bookingID uuid.UUID) ([]models.BookingChangeRequest, error)
	GetBookingChangeRequestByID(ctx context.Context, bookingID, requestID uuid.UUID) (models.BookingChangeRequest, error)
	AcceptBookingChangeRequest(ctx context.Context, bookingID, requestID uuid.UUID, responseNote string) (BookingRecord, models.BookingChangeRequest, error)
	DeclineBookingChangeRequest(ctx context.Context, bookingID, requestID uuid.UUID, responseNote string) (models.BookingChangeRequest, error)
	CompleteNannyBooking(ctx context.Context, nannyProfileID, bookingID uuid.UUID) (BookingRecord, error)
}

var BookingsRepo BookingsRepository

func InitBookingsRepo(db *pgxpool.Pool) {
	BookingsRepo = newPgRepository(db)
}
