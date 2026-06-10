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

func TestApprove(t *testing.T) {
	ctx := context.Background()
	userID, bookingID := uuid.New(), uuid.New()
	withNanny := &mockProfileRepo{nannyProfile: models.NannyProfile{ID: uuid.New()}}

	t.Run("nanny not found", func(t *testing.T) {
		p := newBookingsPipe(&mockBookingsRepo{}, &mockProfileRepo{}, &mockNannyRepo{})
		res := p.Approve(ctx, userID, bookingID)
		if res.Success || string(res.Message) != messages.Nanny_Profile_Not_Found {
			t.Errorf("expected %s, got %s", messages.Nanny_Profile_Not_Found, res.Message)
		}
	})

	t.Run("nanny time unavailable on approve", func(t *testing.T) {
		p := newBookingsPipe(&mockBookingsRepo{approveBookingErr: bookingsrepo.ErrNannyTimeUnavailable}, withNanny, &mockNannyRepo{})
		res := p.Approve(ctx, userID, bookingID)
		if res.Success || string(res.Message) != messages.Nanny_Time_Unavailable {
			t.Errorf("expected %s, got %s", messages.Nanny_Time_Unavailable, res.Message)
		}
	})

	t.Run("generic repo error", func(t *testing.T) {
		p := newBookingsPipe(&mockBookingsRepo{approveBookingErr: errors.New("db")}, withNanny, &mockNannyRepo{})
		res := p.Approve(ctx, userID, bookingID)
		if res.Success || string(res.Message) != messages.Cannot_Approve_Booking {
			t.Errorf("expected %s, got %s", messages.Cannot_Approve_Booking, res.Message)
		}
	})

	t.Run("success", func(t *testing.T) {
		record := bookingsrepo.BookingRecord{Booking: models.Booking{ID: uuid.New(), Status: models.ApprovedBookingStatus}}
		p := newBookingsPipe(&mockBookingsRepo{approvedBooking: record}, withNanny, &mockNannyRepo{})
		res := p.Approve(ctx, userID, bookingID)
		if !res.Success || string(res.Message) != messages.Booking_Approved {
			t.Errorf("expected success %s, got success=%v msg=%s", messages.Booking_Approved, res.Success, res.Message)
		}
	})
}

func TestDecline(t *testing.T) {
	ctx := context.Background()
	userID, bookingID := uuid.New(), uuid.New()
	withNanny := &mockProfileRepo{nannyProfile: models.NannyProfile{ID: uuid.New()}}

	t.Run("nanny not found", func(t *testing.T) {
		p := newBookingsPipe(&mockBookingsRepo{}, &mockProfileRepo{}, &mockNannyRepo{})
		res := p.Decline(ctx, userID, bookingID)
		if res.Success || string(res.Message) != messages.Nanny_Profile_Not_Found {
			t.Errorf("expected %s, got %s", messages.Nanny_Profile_Not_Found, res.Message)
		}
	})

	t.Run("repo error", func(t *testing.T) {
		p := newBookingsPipe(&mockBookingsRepo{declineBookingErr: errors.New("db")}, withNanny, &mockNannyRepo{})
		res := p.Decline(ctx, userID, bookingID)
		if res.Success || string(res.Message) != messages.Cannot_Decline_Booking {
			t.Errorf("expected %s, got %s", messages.Cannot_Decline_Booking, res.Message)
		}
	})

	t.Run("success", func(t *testing.T) {
		record := bookingsrepo.BookingRecord{Booking: models.Booking{ID: uuid.New(), Status: models.DeclinedBookingStatus}}
		p := newBookingsPipe(&mockBookingsRepo{declinedBooking: record}, withNanny, &mockNannyRepo{})
		res := p.Decline(ctx, userID, bookingID)
		if !res.Success || string(res.Message) != messages.Booking_Declined {
			t.Errorf("expected success %s, got success=%v msg=%s", messages.Booking_Declined, res.Success, res.Message)
		}
	})
}

func TestGetForNannyByID(t *testing.T) {
	ctx := context.Background()
	userID, bookingID := uuid.New(), uuid.New()
	withNanny := &mockProfileRepo{nannyProfile: models.NannyProfile{ID: uuid.New()}}

	t.Run("nanny not found", func(t *testing.T) {
		p := newBookingsPipe(&mockBookingsRepo{}, &mockProfileRepo{}, &mockNannyRepo{})
		res := p.GetForNannyByID(ctx, userID, bookingID)
		if res.Success || string(res.Message) != messages.Nanny_Profile_Not_Found {
			t.Errorf("expected %s, got %s", messages.Nanny_Profile_Not_Found, res.Message)
		}
	})

	t.Run("success", func(t *testing.T) {
		record := bookingsrepo.BookingRecord{Booking: models.Booking{ID: uuid.New()}, ParentDisplayName: "Alice"}
		p := newBookingsPipe(&mockBookingsRepo{nannyBooking: record}, withNanny, &mockNannyRepo{})
		res := p.GetForNannyByID(ctx, userID, bookingID)
		if !res.Success || string(res.Message) != messages.Booking_Found || res.Data.ParentDisplayName != "Alice" {
			t.Errorf("expected found Alice booking, got success=%v msg=%s data=%+v", res.Success, res.Message, res.Data)
		}
	})
}

func TestListForNanny(t *testing.T) {
	ctx := context.Background()
	userID := uuid.New()
	withNanny := &mockProfileRepo{nannyProfile: models.NannyProfile{ID: uuid.New()}}

	t.Run("nanny not found", func(t *testing.T) {
		p := newBookingsPipe(&mockBookingsRepo{}, &mockProfileRepo{}, &mockNannyRepo{})
		res := p.ListForNanny(ctx, userID, dtos.ListBookingsQueryDTO{})
		if res.Success || string(res.Message) != messages.Nanny_Profile_Not_Found {
			t.Errorf("expected %s, got %s", messages.Nanny_Profile_Not_Found, res.Message)
		}
	})

	t.Run("normalises pagination", func(t *testing.T) {
		p := newBookingsPipe(&mockBookingsRepo{}, withNanny, &mockNannyRepo{})
		res := p.ListForNanny(ctx, userID, dtos.ListBookingsQueryDTO{Page: -5, Limit: 999})
		if !res.Success || res.Data.Page != 1 || res.Data.Limit != 100 {
			t.Fatalf("expected page=1 limit=100, got data=%+v msg=%s", res.Data, res.Message)
		}
	})

	t.Run("success", func(t *testing.T) {
		records := []bookingsrepo.BookingRecord{{Booking: models.Booking{ID: uuid.New()}, ParentDisplayName: "Alice"}}
		p := newBookingsPipe(&mockBookingsRepo{nannyBookings: records, nannyBookingsTotal: 1}, withNanny, &mockNannyRepo{})
		res := p.ListForNanny(ctx, userID, dtos.ListBookingsQueryDTO{Page: 1, Limit: 10})
		if !res.Success || res.Data.Total != 1 || len(res.Data.Items) != 1 {
			t.Errorf("expected 1 item, got %d total=%d success=%v", len(res.Data.Items), res.Data.Total, res.Success)
		}
	})
}
