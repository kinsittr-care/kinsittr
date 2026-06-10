package pipes

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/bookings/dtos"
	"github.com/kinsittr/kinsittr-api/bookings/messages"
	"github.com/kinsittr/kinsittr-api/models"
	bookingsrepo "github.com/kinsittr/kinsittr-api/repositories/bookings"
)

func TestCreateChangeRequest(t *testing.T) {
	ctx := context.Background()
	userID, bookingID := uuid.New(), uuid.New()
	nannyProfileID := uuid.New()
	withParent := &mockProfileRepo{parentProfile: validParentProfile()}
	approvedBooking := bookingsrepo.BookingRecord{
		Booking: models.Booking{ID: bookingID, NannyProfileID: nannyProfileID, Status: models.ApprovedBookingStatus},
	}

	t.Run("reason is required", func(t *testing.T) {
		p := newBookingsPipe(&mockBookingsRepo{parentBooking: approvedBooking}, withParent, &mockNannyRepo{})
		res := p.CreateChangeRequest(ctx, userID, models.ParentUserRole, bookingID, dtos.CreateBookingChangeRequestDTO{
			Type:   string(models.CancelBookingChangeRequestType),
			Reason: "   ",
		})
		if res.Success || string(res.Message) != messages.Invalid_Booking_Request {
			t.Errorf("expected %s, got %s", messages.Invalid_Booking_Request, res.Message)
		}
	})

	t.Run("cancel requires approved booking", func(t *testing.T) {
		pending := approvedBooking
		pending.Status = models.PendingBookingStatus
		p := newBookingsPipe(&mockBookingsRepo{parentBooking: pending}, withParent, &mockNannyRepo{})
		res := p.CreateChangeRequest(ctx, userID, models.ParentUserRole, bookingID, dtos.CreateBookingChangeRequestDTO{
			Type:   string(models.CancelBookingChangeRequestType),
			Reason: "Schedule changed",
		})
		if res.Success || string(res.Message) != messages.Cannot_Create_Booking_Change_Request {
			t.Errorf("expected %s, got %s", messages.Cannot_Create_Booking_Change_Request, res.Message)
		}
	})

	t.Run("reschedule requires proposed slot", func(t *testing.T) {
		p := newBookingsPipe(&mockBookingsRepo{parentBooking: approvedBooking}, withParent, &mockNannyRepo{})
		res := p.CreateChangeRequest(ctx, userID, models.ParentUserRole, bookingID, dtos.CreateBookingChangeRequestDTO{
			Type:   string(models.RescheduleBookingChangeRequestType),
			Reason: "Need a later time",
		})
		if res.Success || string(res.Message) != messages.Invalid_Booking_Request {
			t.Errorf("expected %s, got %s", messages.Invalid_Booking_Request, res.Message)
		}
	})

	t.Run("success", func(t *testing.T) {
		p := newBookingsPipe(&mockBookingsRepo{parentBooking: approvedBooking}, withParent, &mockNannyRepo{})
		res := p.CreateChangeRequest(ctx, userID, models.ParentUserRole, bookingID, dtos.CreateBookingChangeRequestDTO{
			Type:      string(models.RescheduleBookingChangeRequestType),
			Date:      futureDate(),
			StartTime: "09:00",
			Duration:  3,
			Reason:    "Need a later time",
		})
		if !res.Success || string(res.Message) != messages.Booking_Change_Request_Created {
			t.Fatalf("expected success %s, got success=%v msg=%s", messages.Booking_Change_Request_Created, res.Success, res.Message)
		}
		if res.Data == nil || res.Data.Reason != "Need a later time" {
			t.Fatalf("expected trimmed reason in response, got %#v", res.Data)
		}
	})
}

func TestAcceptChangeRequest(t *testing.T) {
	ctx := context.Background()
	userID, requesterID := uuid.New(), uuid.New()
	bookingID, requestID, nannyProfileID := uuid.New(), uuid.New(), uuid.New()
	withParent := &mockProfileRepo{parentProfile: validParentProfile()}
	booking := bookingsrepo.BookingRecord{Booking: models.Booking{
		ID: bookingID, NannyProfileID: nannyProfileID, Status: models.ApprovedBookingStatus,
	}}
	request := models.BookingChangeRequest{
		ID: requestID, BookingID: bookingID, RequestedByUserID: requesterID,
		RequestedByRole: models.NannyUserRole, Type: models.CancelBookingChangeRequestType,
		Status: models.PendingBookingChangeRequestStatus, Reason: "Cannot make it",
	}

	t.Run("cannot accept own request", func(t *testing.T) {
		ownRequest := request
		ownRequest.RequestedByUserID = userID
		p := newBookingsPipe(&mockBookingsRepo{parentBooking: booking, changeRequest: ownRequest}, withParent, &mockNannyRepo{})
		res := p.AcceptChangeRequest(ctx, userID, models.ParentUserRole, bookingID, requestID, dtos.ResolveBookingChangeRequestDTO{})
		if res.Success || string(res.Message) != messages.Cannot_Resolve_Own_Change_Request {
			t.Errorf("expected %s, got %s", messages.Cannot_Resolve_Own_Change_Request, res.Message)
		}
	})

	t.Run("success", func(t *testing.T) {
		acceptedRequest := request
		acceptedRequest.Status = models.AcceptedBookingChangeRequestStatus
		cancelledBooking := booking
		cancelledBooking.Status = models.CancelledBookingStatus
		p := newBookingsPipe(&mockBookingsRepo{
			parentBooking: booking, changeRequest: request,
			acceptedBooking: cancelledBooking, acceptedChangeReq: acceptedRequest,
		}, withParent, &mockNannyRepo{})
		res := p.AcceptChangeRequest(ctx, userID, models.ParentUserRole, bookingID, requestID, dtos.ResolveBookingChangeRequestDTO{})
		if !res.Success || string(res.Message) != messages.Booking_Change_Request_Accepted {
			t.Fatalf("expected success %s, got success=%v msg=%s", messages.Booking_Change_Request_Accepted, res.Success, res.Message)
		}
		if res.Data == nil || res.Data.Booking.Status != models.CancelledBookingStatus {
			t.Fatalf("expected cancelled booking, got %#v", res.Data)
		}
	})
}

func TestComplete(t *testing.T) {
	ctx := context.Background()
	userID, bookingID := uuid.New(), uuid.New()
	withNanny := &mockProfileRepo{nannyProfile: models.NannyProfile{ID: uuid.New()}}

	t.Run("cannot complete future booking", func(t *testing.T) {
		booking := bookingsrepo.BookingRecord{Booking: models.Booking{
			ID: bookingID, Status: models.ApprovedBookingStatus,
			StartTime: time.Now().UTC().Add(time.Hour), Duration: 2,
		}}
		p := newBookingsPipe(&mockBookingsRepo{nannyBooking: booking}, withNanny, &mockNannyRepo{})
		res := p.Complete(ctx, userID, bookingID)
		if res.Success || string(res.Message) != messages.Cannot_Complete_Booking {
			t.Errorf("expected %s, got %s", messages.Cannot_Complete_Booking, res.Message)
		}
	})

	t.Run("success", func(t *testing.T) {
		booking := bookingsrepo.BookingRecord{Booking: models.Booking{
			ID: bookingID, Status: models.ApprovedBookingStatus,
			StartTime: time.Now().UTC().Add(-3 * time.Hour), Duration: 2,
		}}
		completed := booking
		completed.Status = models.CompletedBookingStatus
		p := newBookingsPipe(&mockBookingsRepo{nannyBooking: booking, completedBooking: completed}, withNanny, &mockNannyRepo{})
		res := p.Complete(ctx, userID, bookingID)
		if !res.Success || string(res.Message) != messages.Booking_Completed {
			t.Fatalf("expected success %s, got success=%v msg=%s", messages.Booking_Completed, res.Success, res.Message)
		}
		if res.Data == nil || res.Data.Status != models.CompletedBookingStatus {
			t.Fatalf("expected completed booking, got %#v", res.Data)
		}
	})
}
