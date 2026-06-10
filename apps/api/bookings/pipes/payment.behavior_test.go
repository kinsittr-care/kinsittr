package pipes

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/bookings/messages"
	"github.com/kinsittr/kinsittr-api/models"
	bookingsrepo "github.com/kinsittr/kinsittr-api/repositories/bookings"
)

type mockBookingPaymentProcessor struct {
	readyErr    error
	chargeErr   error
	readyCalls  int
	chargeCalls int
}

func (m *mockBookingPaymentProcessor) EnsureBookingPaymentReady(context.Context, uuid.UUID, uuid.UUID) error {
	m.readyCalls++
	return m.readyErr
}

func (m *mockBookingPaymentProcessor) ChargeCompletedBooking(context.Context, uuid.UUID, uuid.UUID) error {
	m.chargeCalls++
	return m.chargeErr
}

func (m *mockBookingPaymentProcessor) RefundBooking(context.Context, uuid.UUID) error {
	return nil
}

func TestApproveRequiresPaymentReadiness(t *testing.T) {
	ctx := context.Background()
	userID, bookingID := uuid.New(), uuid.New()
	nannyProfile := models.NannyProfile{ID: uuid.New()}
	repo := &mockBookingsRepo{approvedBooking: bookingsrepo.BookingRecord{Booking: models.Booking{ID: bookingID, Status: models.ApprovedBookingStatus}}}
	processor := &mockBookingPaymentProcessor{readyErr: errors.New(messages.Booking_Payment_Setup_Missing)}
	pipe := newBookingsPipe(repo, &mockProfileRepo{nannyProfile: nannyProfile}, &mockNannyRepo{})
	pipe.SetPaymentProcessor(processor)

	res := pipe.Approve(ctx, userID, bookingID)
	if res.Success || string(res.Message) != messages.Booking_Payment_Setup_Missing {
		t.Fatalf("expected payment setup error, got success=%v message=%s", res.Success, res.Message)
	}
	if processor.readyCalls != 1 {
		t.Fatalf("expected payment readiness check once, got %d", processor.readyCalls)
	}
	if repo.approveCalls != 0 {
		t.Fatalf("booking should not be approved when payment readiness fails")
	}
}

func TestCompleteDoesNotMarkCompletedWhenPaymentFails(t *testing.T) {
	ctx := context.Background()
	userID, bookingID := uuid.New(), uuid.New()
	nannyProfile := models.NannyProfile{ID: uuid.New()}
	approved := bookingsrepo.BookingRecord{Booking: models.Booking{
		ID: bookingID, Status: models.ApprovedBookingStatus,
		StartTime: time.Now().UTC().Add(-3 * time.Hour), Duration: 2,
	}}
	repo := &mockBookingsRepo{nannyBooking: approved}
	processor := &mockBookingPaymentProcessor{chargeErr: errors.New(messages.Booking_Payment_Failed)}
	pipe := newBookingsPipe(repo, &mockProfileRepo{nannyProfile: nannyProfile}, &mockNannyRepo{})
	pipe.SetPaymentProcessor(processor)

	res := pipe.Complete(ctx, userID, bookingID)
	if res.Success || string(res.Message) != messages.Booking_Payment_Failed {
		t.Fatalf("expected payment failure, got success=%v message=%s", res.Success, res.Message)
	}
	if processor.chargeCalls != 1 {
		t.Fatalf("expected charge attempt once, got %d", processor.chargeCalls)
	}
	if repo.completeCalls != 0 {
		t.Fatalf("booking should not be completed when payment fails")
	}
}
