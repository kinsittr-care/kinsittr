package controllers

import (
	"context"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/bookings/messages"
	"github.com/kinsittr/kinsittr-api/bookings/pipes"
	"github.com/kinsittr/kinsittr-api/models"
	bookingsrepo "github.com/kinsittr/kinsittr-api/repositories/bookings"
	nannyrepo "github.com/kinsittr/kinsittr-api/repositories/nanny"
)

type mockBookingsRepo struct {
	booking        bookingsrepo.BookingRecord
	createdBooking models.Booking
}

func (m *mockBookingsRepo) HasParentActiveBookingWithNanny(context.Context, uuid.UUID, uuid.UUID, time.Time, int) (bool, error) {
	return false, nil
}
func (m *mockBookingsRepo) HasNannyApprovedBookingConflict(context.Context, uuid.UUID, time.Time, int) (bool, error) {
	return false, nil
}
func (m *mockBookingsRepo) HasNannyApprovedBookingConflictExcluding(context.Context, uuid.UUID, time.Time, int, uuid.UUID) (bool, error) {
	return false, nil
}
func (m *mockBookingsRepo) CreateBooking(context.Context, models.Booking) (models.Booking, error) {
	return m.createdBooking, nil
}
func (m *mockBookingsRepo) ListParentBookings(context.Context, uuid.UUID, bookingsrepo.ListBookingsFilter) ([]bookingsrepo.BookingRecord, int, error) {
	return []bookingsrepo.BookingRecord{m.booking}, 1, nil
}
func (m *mockBookingsRepo) GetParentBookingByID(context.Context, uuid.UUID, uuid.UUID) (bookingsrepo.BookingRecord, error) {
	return m.booking, nil
}
func (m *mockBookingsRepo) CancelParentBooking(context.Context, uuid.UUID, uuid.UUID) (bookingsrepo.BookingRecord, error) {
	return m.booking, nil
}
func (m *mockBookingsRepo) ListNannyBookings(context.Context, uuid.UUID, bookingsrepo.ListBookingsFilter) ([]bookingsrepo.BookingRecord, int, error) {
	return []bookingsrepo.BookingRecord{m.booking}, 1, nil
}
func (m *mockBookingsRepo) GetNannyBookingByID(context.Context, uuid.UUID, uuid.UUID) (bookingsrepo.BookingRecord, error) {
	return m.booking, nil
}
func (m *mockBookingsRepo) ApproveNannyBooking(context.Context, uuid.UUID, uuid.UUID) (bookingsrepo.BookingRecord, error) {
	return m.booking, nil
}
func (m *mockBookingsRepo) ApproveNannyBookingWithConversation(context.Context, uuid.UUID, uuid.UUID) (bookingsrepo.BookingRecord, error) {
	return m.booking, nil
}
func (m *mockBookingsRepo) DeclineNannyBooking(context.Context, uuid.UUID, uuid.UUID) (bookingsrepo.BookingRecord, error) {
	return m.booking, nil
}
func (m *mockBookingsRepo) CreateBookingChangeRequest(context.Context, models.BookingChangeRequest) (models.BookingChangeRequest, error) {
	return models.BookingChangeRequest{}, nil
}
func (m *mockBookingsRepo) ListBookingChangeRequests(context.Context, uuid.UUID) ([]models.BookingChangeRequest, error) {
	return nil, nil
}
func (m *mockBookingsRepo) GetBookingChangeRequestByID(context.Context, uuid.UUID, uuid.UUID) (models.BookingChangeRequest, error) {
	return models.BookingChangeRequest{}, nil
}
func (m *mockBookingsRepo) AcceptBookingChangeRequest(context.Context, uuid.UUID, uuid.UUID, string) (bookingsrepo.BookingRecord, models.BookingChangeRequest, error) {
	return m.booking, models.BookingChangeRequest{ID: uuid.New()}, nil
}
func (m *mockBookingsRepo) DeclineBookingChangeRequest(context.Context, uuid.UUID, uuid.UUID, string) (models.BookingChangeRequest, error) {
	return models.BookingChangeRequest{ID: uuid.New()}, nil
}
func (m *mockBookingsRepo) CompleteNannyBooking(context.Context, uuid.UUID, uuid.UUID) (bookingsrepo.BookingRecord, error) {
	completed := m.booking
	completed.Status = models.CompletedBookingStatus
	return completed, nil
}

type mockProfileRepo struct {
	parent models.ParentProfile
	nanny  models.NannyProfile
}

func (m *mockProfileRepo) CreateNannyProfile(_ context.Context, p models.NannyProfile) (models.NannyProfile, error) {
	return p, nil
}
func (m *mockProfileRepo) CreateParentProfile(_ context.Context, p models.ParentProfile) (models.ParentProfile, error) {
	return p, nil
}
func (m *mockProfileRepo) GetNannyProfileByUserID(context.Context, uuid.UUID) (models.NannyProfile, error) {
	return m.nanny, nil
}
func (m *mockProfileRepo) GetParentProfileByUserID(context.Context, uuid.UUID) (models.ParentProfile, error) {
	return m.parent, nil
}
func (m *mockProfileRepo) UpdateNannyProfile(_ context.Context, p models.NannyProfile) (models.NannyProfile, error) {
	return p, nil
}
func (m *mockProfileRepo) UpdateNannyAvatar(_ context.Context, _ uuid.UUID, _ string, _ string) (models.NannyProfile, error) {
	return models.NannyProfile{}, nil
}
func (m *mockProfileRepo) UpdateParentProfile(_ context.Context, p models.ParentProfile) (models.ParentProfile, error) {
	return p, nil
}
func (m *mockProfileRepo) GetOrCreateParentSettings(context.Context, uuid.UUID) (models.ParentSettings, error) {
	return models.ParentSettings{ID: uuid.New()}, nil
}
func (m *mockProfileRepo) UpdateParentSettings(_ context.Context, s models.ParentSettings) (models.ParentSettings, error) {
	return s, nil
}
func (m *mockProfileRepo) DeleteNannyProfile(context.Context, uuid.UUID) error  { return nil }
func (m *mockProfileRepo) DeleteParentProfile(context.Context, uuid.UUID) error { return nil }

type mockNannyRepo struct {
	nanny models.NannyProfile
}

func (m *mockNannyRepo) GetVerifiedNannyByID(context.Context, uuid.UUID) (models.NannyProfile, error) {
	return m.nanny, nil
}
func (m *mockNannyRepo) ListVerifiedNannies(context.Context, nannyrepo.ListVerifiedNanniesFilter) ([]models.NannyProfile, int, error) {
	return []models.NannyProfile{m.nanny}, 1, nil
}

func bookingTestController() *BookingsController {
	parentID, nannyID, bookingID := uuid.New(), uuid.New(), uuid.New()
	booking := bookingsrepo.BookingRecord{Booking: models.Booking{
		ID: bookingID, ParentProfileID: parentID, NannyProfileID: nannyID,
		Status: models.ApprovedBookingStatus, StartTime: time.Now().UTC().Add(-3 * time.Hour), Duration: 2,
	}}
	repo := &mockBookingsRepo{booking: booking, createdBooking: models.Booking{ID: uuid.New(), Status: models.PendingBookingStatus}}
	profileRepo := &mockProfileRepo{parent: models.ParentProfile{ID: parentID}, nanny: models.NannyProfile{ID: nannyID}}
	nannyRepo := &mockNannyRepo{nanny: models.NannyProfile{ID: nannyID, RatePerHour: 30, VerificationStatus: models.VerifiedVerificationStatus}}
	return NewBookingsController(pipes.NewBookingsPipe(repo, profileRepo, nannyRepo))
}

func bookingTestApp(controller *BookingsController, role models.UserRole) *fiber.App {
	app := fiber.New()
	app.Use(func(c *fiber.Ctx) error {
		c.Locals("auth.user_id", uuid.New())
		c.Locals("auth.role", role)
		return c.Next()
	})
	app.Post("/bookings", controller.Create)
	app.Get("/bookings", controller.List)
	app.Patch("/bookings/:id/complete", controller.Complete)
	return app
}

func TestBookingControllerCreateValidation(t *testing.T) {
	req := httptest.NewRequest(fiber.MethodPost, "/bookings", strings.NewReader(`{"nanny_id":"bad"}`))
	req.Header.Set("Content-Type", "application/json")
	resp, err := bookingTestApp(bookingTestController(), models.ParentUserRole).Test(req)
	if err != nil {
		t.Fatal(err)
	}
	if resp.StatusCode != fiber.StatusBadRequest {
		t.Fatalf("expected 400, got %d", resp.StatusCode)
	}
}

func TestBookingControllerRoleGuards(t *testing.T) {
	resp, err := bookingTestApp(bookingTestController(), models.NannyUserRole).Test(httptest.NewRequest(fiber.MethodPost, "/bookings", nil))
	if err != nil {
		t.Fatal(err)
	}
	if resp.StatusCode != fiber.StatusForbidden {
		t.Fatalf("expected 403 %s, got %d", messages.Forbidden_Booking_Access, resp.StatusCode)
	}

	resp, err = bookingTestApp(bookingTestController(), models.ParentUserRole).Test(httptest.NewRequest(fiber.MethodPatch, "/bookings/"+uuid.NewString()+"/complete", nil))
	if err != nil {
		t.Fatal(err)
	}
	if resp.StatusCode != fiber.StatusForbidden {
		t.Fatalf("expected 403 %s, got %d", messages.Forbidden_Booking_Access, resp.StatusCode)
	}
}

func TestBookingControllerListSuccess(t *testing.T) {
	resp, err := bookingTestApp(bookingTestController(), models.ParentUserRole).Test(httptest.NewRequest(fiber.MethodGet, "/bookings", nil))
	if err != nil {
		t.Fatal(err)
	}
	if resp.StatusCode != fiber.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}
}
