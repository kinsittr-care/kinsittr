package pipes

import (
	"context"
	"errors"
	"testing"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/bookings/dtos"
	"github.com/kinsittr/kinsittr-api/bookings/messages"
	"github.com/kinsittr/kinsittr-api/models"
	bookingsrepo "github.com/kinsittr/kinsittr-api/repositories/bookings"
)

func TestCreate(t *testing.T) {
	ctx := context.Background()
	userID := uuid.New()
	nannyID := uuid.New()

	validDTO := dtos.CreateBookingDTO{
		NannyID:               nannyID.String(),
		Date:                  futureDate(),
		StartTime:             "10:00",
		TimezoneOffsetMinutes: 0,
		Duration:              3,
	}

	t.Run("parent profile repo error", func(t *testing.T) {
		p := newBookingsPipe(&mockBookingsRepo{}, &mockProfileRepo{parentProfileErr: errors.New("db")}, &mockNannyRepo{})
		res := p.Create(ctx, userID, validDTO)
		if res.Success || string(res.Message) != messages.Invalid_Booking_Request {
			t.Errorf("expected %s; got success=%v msg=%s", messages.Invalid_Booking_Request, res.Success, res.Message)
		}
	})

	t.Run("parent profile not found", func(t *testing.T) {
		p := newBookingsPipe(&mockBookingsRepo{}, &mockProfileRepo{}, &mockNannyRepo{})
		res := p.Create(ctx, userID, validDTO)
		if res.Success || string(res.Message) != messages.Parent_Profile_Not_Found {
			t.Errorf("expected %s, got %s", messages.Parent_Profile_Not_Found, res.Message)
		}
	})

	t.Run("invalid nanny uuid", func(t *testing.T) {
		dto := validDTO
		dto.NannyID = "not-a-uuid"
		p := newBookingsPipe(&mockBookingsRepo{}, &mockProfileRepo{parentProfile: validParentProfile()}, &mockNannyRepo{})
		res := p.Create(ctx, userID, dto)
		if res.Success || string(res.Message) != messages.Invalid_Booking_Request {
			t.Errorf("expected %s, got %s", messages.Invalid_Booking_Request, res.Message)
		}
	})

	t.Run("nanny repo error", func(t *testing.T) {
		p := newBookingsPipe(&mockBookingsRepo{}, &mockProfileRepo{parentProfile: validParentProfile()}, &mockNannyRepo{nannyErr: errors.New("db")})
		res := p.Create(ctx, userID, validDTO)
		if res.Success || string(res.Message) != messages.Invalid_Booking_Request {
			t.Errorf("expected %s, got %s", messages.Invalid_Booking_Request, res.Message)
		}
	})

	t.Run("nanny not found", func(t *testing.T) {
		p := newBookingsPipe(&mockBookingsRepo{}, &mockProfileRepo{parentProfile: validParentProfile()}, &mockNannyRepo{})
		res := p.Create(ctx, userID, validDTO)
		if res.Success || string(res.Message) != messages.Nanny_Profile_Not_Found {
			t.Errorf("expected %s, got %s", messages.Nanny_Profile_Not_Found, res.Message)
		}
	})

	t.Run("start time in the past", func(t *testing.T) {
		dto := validDTO
		dto.Date = pastDate()
		p := newBookingsPipe(&mockBookingsRepo{}, &mockProfileRepo{parentProfile: validParentProfile()}, &mockNannyRepo{nanny: validNannyProfile()})
		res := p.Create(ctx, userID, dto)
		if res.Success || string(res.Message) != messages.Booking_Start_In_Past {
			t.Errorf("expected %s, got %s", messages.Booking_Start_In_Past, res.Message)
		}
	})

	t.Run("duplicate booking conflict", func(t *testing.T) {
		p := newBookingsPipe(&mockBookingsRepo{hasParentActive: true}, &mockProfileRepo{parentProfile: validParentProfile()}, &mockNannyRepo{nanny: validNannyProfile()})
		res := p.Create(ctx, userID, validDTO)
		if res.Success || string(res.Message) != messages.Booking_Already_Exists {
			t.Errorf("expected %s, got %s", messages.Booking_Already_Exists, res.Message)
		}
	})

	t.Run("nanny time conflict", func(t *testing.T) {
		p := newBookingsPipe(&mockBookingsRepo{hasNannyConflict: true}, &mockProfileRepo{parentProfile: validParentProfile()}, &mockNannyRepo{nanny: validNannyProfile()})
		res := p.Create(ctx, userID, validDTO)
		if res.Success || string(res.Message) != messages.Nanny_Time_Unavailable {
			t.Errorf("expected %s, got %s", messages.Nanny_Time_Unavailable, res.Message)
		}
	})

	t.Run("create returns ErrBookingAlreadyExists", func(t *testing.T) {
		p := newBookingsPipe(&mockBookingsRepo{createBookingErr: bookingsrepo.ErrBookingAlreadyExists}, &mockProfileRepo{parentProfile: validParentProfile()}, &mockNannyRepo{nanny: validNannyProfile()})
		res := p.Create(ctx, userID, validDTO)
		if res.Success || string(res.Message) != messages.Booking_Already_Exists {
			t.Errorf("expected %s, got %s", messages.Booking_Already_Exists, res.Message)
		}
	})

	t.Run("create returns ErrNannyTimeUnavailable", func(t *testing.T) {
		p := newBookingsPipe(&mockBookingsRepo{createBookingErr: bookingsrepo.ErrNannyTimeUnavailable}, &mockProfileRepo{parentProfile: validParentProfile()}, &mockNannyRepo{nanny: validNannyProfile()})
		res := p.Create(ctx, userID, validDTO)
		if res.Success || string(res.Message) != messages.Nanny_Time_Unavailable {
			t.Errorf("expected %s, got %s", messages.Nanny_Time_Unavailable, res.Message)
		}
	})

	t.Run("create generic repo error", func(t *testing.T) {
		p := newBookingsPipe(&mockBookingsRepo{createBookingErr: errors.New("db")}, &mockProfileRepo{parentProfile: validParentProfile()}, &mockNannyRepo{nanny: validNannyProfile()})
		res := p.Create(ctx, userID, validDTO)
		if res.Success || string(res.Message) != messages.Invalid_Booking_Request {
			t.Errorf("expected %s, got %s", messages.Invalid_Booking_Request, res.Message)
		}
	})

	t.Run("success", func(t *testing.T) {
		nanny := validNannyProfile()
		nanny.DisplayName = "Jane Doe"
		nanny.City = "Toronto"
		nanny.Province = "ON"
		nanny.RatePerHour = 30.0

		created := models.Booking{ID: uuid.New(), Duration: 3, TotalAmount: 90.0, Status: models.PendingBookingStatus}
		p := newBookingsPipe(&mockBookingsRepo{createdBooking: created}, &mockProfileRepo{parentProfile: validParentProfile()}, &mockNannyRepo{nanny: nanny})
		res := p.Create(ctx, userID, validDTO)
		if !res.Success || string(res.Message) != messages.Booking_Created {
			t.Fatalf("expected success %s, got success=%v msg=%s", messages.Booking_Created, res.Success, res.Message)
		}
		if res.Data == nil || res.Data.NannyDisplayName != "Jane Doe" || res.Data.TotalAmount != 90.0 {
			t.Fatalf("unexpected data: %+v", res.Data)
		}
	})
}

func TestList(t *testing.T) {
	ctx := context.Background()
	userID := uuid.New()
	withParent := &mockProfileRepo{parentProfile: validParentProfile()}

	t.Run("parent not found", func(t *testing.T) {
		p := newBookingsPipe(&mockBookingsRepo{}, &mockProfileRepo{}, &mockNannyRepo{})
		res := p.List(ctx, userID, dtos.ListBookingsQueryDTO{})
		if res.Success || string(res.Message) != messages.Parent_Profile_Not_Found {
			t.Errorf("expected %s, got %s", messages.Parent_Profile_Not_Found, res.Message)
		}
	})

	t.Run("invalid status", func(t *testing.T) {
		p := newBookingsPipe(&mockBookingsRepo{}, withParent, &mockNannyRepo{})
		res := p.List(ctx, userID, dtos.ListBookingsQueryDTO{Status: "bogus"})
		if res.Success || string(res.Message) != messages.Invalid_Booking_Request {
			t.Errorf("expected %s, got %s", messages.Invalid_Booking_Request, res.Message)
		}
	})

	t.Run("invalid date range", func(t *testing.T) {
		p := newBookingsPipe(&mockBookingsRepo{}, withParent, &mockNannyRepo{})
		res := p.List(ctx, userID, dtos.ListBookingsQueryDTO{DateFrom: "2026-06-10", DateTo: "2026-06-01"})
		if res.Success || string(res.Message) != messages.Invalid_Booking_Request {
			t.Errorf("expected %s, got %s", messages.Invalid_Booking_Request, res.Message)
		}
	})

	t.Run("normalises pagination", func(t *testing.T) {
		p := newBookingsPipe(&mockBookingsRepo{}, withParent, &mockNannyRepo{})
		res := p.List(ctx, userID, dtos.ListBookingsQueryDTO{Page: 0, Limit: 500})
		if !res.Success || res.Data.Page != 1 || res.Data.Limit != 100 {
			t.Fatalf("expected page=1 limit=100, got data=%+v msg=%s", res.Data, res.Message)
		}
	})

	t.Run("success returns items and total", func(t *testing.T) {
		records := []bookingsrepo.BookingRecord{{Booking: models.Booking{ID: uuid.New(), Status: models.PendingBookingStatus}, NannyDisplayName: "Jane"}}
		p := newBookingsPipe(&mockBookingsRepo{parentBookings: records, parentBookingsTotal: 1}, withParent, &mockNannyRepo{})
		res := p.List(ctx, userID, dtos.ListBookingsQueryDTO{Page: 1, Limit: 10})
		if !res.Success || string(res.Message) != messages.Booking_Listed || res.Data.Total != 1 || len(res.Data.Items) != 1 {
			t.Fatalf("expected one listed booking, got success=%v msg=%s data=%+v", res.Success, res.Message, res.Data)
		}
	})
}

func TestCancel(t *testing.T) {
	ctx := context.Background()
	userID := uuid.New()
	bookingID := uuid.New()
	withParent := &mockProfileRepo{parentProfile: validParentProfile()}
	pendingRecord := func() bookingsrepo.BookingRecord {
		return bookingsrepo.BookingRecord{Booking: models.Booking{ID: uuid.New(), Status: models.PendingBookingStatus}}
	}

	t.Run("parent not found", func(t *testing.T) {
		p := newBookingsPipe(&mockBookingsRepo{}, &mockProfileRepo{}, &mockNannyRepo{})
		res := p.Cancel(ctx, userID, bookingID)
		if res.Success || string(res.Message) != messages.Parent_Profile_Not_Found {
			t.Errorf("expected %s, got %s", messages.Parent_Profile_Not_Found, res.Message)
		}
	})

	t.Run("booking not found", func(t *testing.T) {
		p := newBookingsPipe(&mockBookingsRepo{}, withParent, &mockNannyRepo{})
		res := p.Cancel(ctx, userID, bookingID)
		if res.Success || string(res.Message) != messages.Booking_Not_Found {
			t.Errorf("expected %s, got %s", messages.Booking_Not_Found, res.Message)
		}
	})

	t.Run("approved cannot be cancelled directly", func(t *testing.T) {
		approved := bookingsrepo.BookingRecord{Booking: models.Booking{ID: uuid.New(), Status: models.ApprovedBookingStatus}}
		p := newBookingsPipe(&mockBookingsRepo{parentBooking: approved}, withParent, &mockNannyRepo{})
		res := p.Cancel(ctx, userID, bookingID)
		if res.Success || string(res.Message) != messages.Booking_Already_Approved {
			t.Errorf("expected %s, got %s", messages.Booking_Already_Approved, res.Message)
		}
	})

	t.Run("success", func(t *testing.T) {
		cancelled := bookingsrepo.BookingRecord{Booking: models.Booking{ID: uuid.New(), Status: models.CancelledBookingStatus}}
		p := newBookingsPipe(&mockBookingsRepo{parentBooking: pendingRecord(), cancelledBooking: cancelled}, withParent, &mockNannyRepo{})
		res := p.Cancel(ctx, userID, bookingID)
		if !res.Success || string(res.Message) != messages.Booking_Cancelled {
			t.Errorf("expected success %s, got success=%v msg=%s", messages.Booking_Cancelled, res.Success, res.Message)
		}
	})
}

func TestGetByID(t *testing.T) {
	ctx := context.Background()
	userID, bookingID := uuid.New(), uuid.New()
	withParent := &mockProfileRepo{parentProfile: validParentProfile()}

	t.Run("parent not found", func(t *testing.T) {
		p := newBookingsPipe(&mockBookingsRepo{}, &mockProfileRepo{}, &mockNannyRepo{})
		res := p.GetByID(ctx, userID, bookingID)
		if res.Success || string(res.Message) != messages.Parent_Profile_Not_Found {
			t.Errorf("expected %s, got %s", messages.Parent_Profile_Not_Found, res.Message)
		}
	})

	t.Run("success", func(t *testing.T) {
		record := bookingsrepo.BookingRecord{Booking: models.Booking{ID: uuid.New()}, NannyDisplayName: "Jane"}
		p := newBookingsPipe(&mockBookingsRepo{parentBooking: record}, withParent, &mockNannyRepo{})
		res := p.GetByID(ctx, userID, bookingID)
		if !res.Success || string(res.Message) != messages.Booking_Found || res.Data.NannyDisplayName != "Jane" {
			t.Errorf("expected found Jane booking, got success=%v msg=%s data=%+v", res.Success, res.Message, res.Data)
		}
	})
}
