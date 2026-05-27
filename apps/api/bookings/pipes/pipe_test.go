package pipes

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/models"
	bookingsrepo "github.com/kinsittr/kinsittr-api/repositories/bookings"
	nannyrepo "github.com/kinsittr/kinsittr-api/repositories/nanny"
)

// ── mock repos ────────────────────────────────────────────────────────────────

type mockBookingsRepo struct {
	hasParentActive     bool
	hasParentActiveErr  error
	hasNannyConflict    bool
	hasNannyConflictErr error
	createdBooking      models.Booking
	createBookingErr    error
	parentBookings      []bookingsrepo.BookingRecord
	parentBookingsTotal int
	parentBookingsErr   error
	parentBooking       bookingsrepo.BookingRecord
	parentBookingErr    error
	cancelledBooking    bookingsrepo.BookingRecord
	cancelBookingErr    error
	nannyBookings       []bookingsrepo.BookingRecord
	nannyBookingsTotal  int
	nannyBookingsErr    error
	nannyBooking        bookingsrepo.BookingRecord
	nannyBookingErr     error
	approvedBooking     bookingsrepo.BookingRecord
	approveBookingErr   error
	approveCalls        int
	declinedBooking     bookingsrepo.BookingRecord
	declineBookingErr   error
	changeRequests      []models.BookingChangeRequest
	changeRequestsErr   error
	changeRequest       models.BookingChangeRequest
	changeRequestErr    error
	createdChangeReq    models.BookingChangeRequest
	createChangeReqErr  error
	acceptedBooking     bookingsrepo.BookingRecord
	acceptedChangeReq   models.BookingChangeRequest
	acceptChangeReqErr  error
	declinedChangeReq   models.BookingChangeRequest
	declineChangeReqErr error
	completedBooking    bookingsrepo.BookingRecord
	completeBookingErr  error
	completeCalls       int
}

func (m *mockBookingsRepo) HasParentActiveBookingWithNanny(_ context.Context, _, _ uuid.UUID, _ time.Time, _ int) (bool, error) {
	return m.hasParentActive, m.hasParentActiveErr
}
func (m *mockBookingsRepo) HasNannyApprovedBookingConflict(_ context.Context, _ uuid.UUID, _ time.Time, _ int) (bool, error) {
	return m.hasNannyConflict, m.hasNannyConflictErr
}
func (m *mockBookingsRepo) HasNannyApprovedBookingConflictExcluding(_ context.Context, _ uuid.UUID, _ time.Time, _ int, _ uuid.UUID) (bool, error) {
	return m.hasNannyConflict, m.hasNannyConflictErr
}
func (m *mockBookingsRepo) CreateBooking(_ context.Context, _ models.Booking) (models.Booking, error) {
	return m.createdBooking, m.createBookingErr
}
func (m *mockBookingsRepo) ListParentBookings(_ context.Context, _ uuid.UUID, _ bookingsrepo.ListBookingsFilter) ([]bookingsrepo.BookingRecord, int, error) {
	return m.parentBookings, m.parentBookingsTotal, m.parentBookingsErr
}
func (m *mockBookingsRepo) GetParentBookingByID(_ context.Context, _, _ uuid.UUID) (bookingsrepo.BookingRecord, error) {
	return m.parentBooking, m.parentBookingErr
}
func (m *mockBookingsRepo) CancelParentBooking(_ context.Context, _, _ uuid.UUID) (bookingsrepo.BookingRecord, error) {
	return m.cancelledBooking, m.cancelBookingErr
}
func (m *mockBookingsRepo) ListNannyBookings(_ context.Context, _ uuid.UUID, _ bookingsrepo.ListBookingsFilter) ([]bookingsrepo.BookingRecord, int, error) {
	return m.nannyBookings, m.nannyBookingsTotal, m.nannyBookingsErr
}
func (m *mockBookingsRepo) GetNannyBookingByID(_ context.Context, _, _ uuid.UUID) (bookingsrepo.BookingRecord, error) {
	return m.nannyBooking, m.nannyBookingErr
}
func (m *mockBookingsRepo) ApproveNannyBooking(_ context.Context, _, _ uuid.UUID) (bookingsrepo.BookingRecord, error) {
	m.approveCalls++
	return m.approvedBooking, m.approveBookingErr
}
func (m *mockBookingsRepo) ApproveNannyBookingWithConversation(_ context.Context, _, _ uuid.UUID) (bookingsrepo.BookingRecord, error) {
	m.approveCalls++
	return m.approvedBooking, m.approveBookingErr
}
func (m *mockBookingsRepo) DeclineNannyBooking(_ context.Context, _, _ uuid.UUID) (bookingsrepo.BookingRecord, error) {
	return m.declinedBooking, m.declineBookingErr
}
func (m *mockBookingsRepo) CreateBookingChangeRequest(_ context.Context, request models.BookingChangeRequest) (models.BookingChangeRequest, error) {
	if m.createdChangeReq.ID != uuid.Nil || m.createChangeReqErr != nil {
		return m.createdChangeReq, m.createChangeReqErr
	}
	return request, nil
}
func (m *mockBookingsRepo) ListBookingChangeRequests(_ context.Context, _ uuid.UUID) ([]models.BookingChangeRequest, error) {
	return m.changeRequests, m.changeRequestsErr
}
func (m *mockBookingsRepo) GetBookingChangeRequestByID(_ context.Context, _, _ uuid.UUID) (models.BookingChangeRequest, error) {
	return m.changeRequest, m.changeRequestErr
}
func (m *mockBookingsRepo) AcceptBookingChangeRequest(_ context.Context, _, _ uuid.UUID, _ string) (bookingsrepo.BookingRecord, models.BookingChangeRequest, error) {
	return m.acceptedBooking, m.acceptedChangeReq, m.acceptChangeReqErr
}
func (m *mockBookingsRepo) DeclineBookingChangeRequest(_ context.Context, _, _ uuid.UUID, _ string) (models.BookingChangeRequest, error) {
	return m.declinedChangeReq, m.declineChangeReqErr
}
func (m *mockBookingsRepo) CompleteNannyBooking(_ context.Context, _, _ uuid.UUID) (bookingsrepo.BookingRecord, error) {
	m.completeCalls++
	return m.completedBooking, m.completeBookingErr
}

type mockProfileRepo struct {
	parentProfile    models.ParentProfile
	parentProfileErr error
	nannyProfile     models.NannyProfile
	nannyProfileErr  error
	updatedNanny     models.NannyProfile
	updateNannyErr   error
}

func (m *mockProfileRepo) GetParentProfileByUserID(_ context.Context, _ uuid.UUID) (models.ParentProfile, error) {
	return m.parentProfile, m.parentProfileErr
}
func (m *mockProfileRepo) GetNannyProfileByUserID(_ context.Context, _ uuid.UUID) (models.NannyProfile, error) {
	return m.nannyProfile, m.nannyProfileErr
}
func (m *mockProfileRepo) CreateNannyProfile(_ context.Context, p models.NannyProfile) (models.NannyProfile, error) {
	return p, nil
}
func (m *mockProfileRepo) CreateParentProfile(_ context.Context, p models.ParentProfile) (models.ParentProfile, error) {
	return p, nil
}
func (m *mockProfileRepo) UpdateNannyProfile(_ context.Context, _ models.NannyProfile) (models.NannyProfile, error) {
	return m.updatedNanny, m.updateNannyErr
}
func (m *mockProfileRepo) UpdateNannyAvatarURL(_ context.Context, _ uuid.UUID, _ string) (models.NannyProfile, error) {
	return models.NannyProfile{}, nil
}
func (m *mockProfileRepo) UpdateParentProfile(_ context.Context, p models.ParentProfile) (models.ParentProfile, error) {
	return p, nil
}
func (m *mockProfileRepo) GetOrCreateParentSettings(_ context.Context, userID uuid.UUID) (models.ParentSettings, error) {
	return models.ParentSettings{ID: uuid.New(), UserID: userID}, nil
}
func (m *mockProfileRepo) UpdateParentSettings(_ context.Context, settings models.ParentSettings) (models.ParentSettings, error) {
	if settings.ID == uuid.Nil {
		settings.ID = uuid.New()
	}
	return settings, nil
}
func (m *mockProfileRepo) DeleteNannyProfile(_ context.Context, _ uuid.UUID) error  { return nil }
func (m *mockProfileRepo) DeleteParentProfile(_ context.Context, _ uuid.UUID) error { return nil }

type mockNannyRepo struct {
	nanny        models.NannyProfile
	nannyErr     error
	nannies      []models.NannyProfile
	nanniesTotal int
	nanniesErr   error
}

func (m *mockNannyRepo) GetVerifiedNannyByID(_ context.Context, _ uuid.UUID) (models.NannyProfile, error) {
	return m.nanny, m.nannyErr
}
func (m *mockNannyRepo) ListVerifiedNannies(_ context.Context, _ nannyrepo.ListVerifiedNanniesFilter) ([]models.NannyProfile, int, error) {
	return m.nannies, m.nanniesTotal, m.nanniesErr
}

// ── helpers ───────────────────────────────────────────────────────────────────

func newBookingsPipe(b bookingsrepo.BookingsRepository, pr *mockProfileRepo, nr *mockNannyRepo) *BookingsPipe {
	return NewBookingsPipe(b, pr, nr)
}

func futureDate() string { return time.Now().UTC().AddDate(0, 0, 2).Format("2006-01-02") }
func pastDate() string   { return time.Now().UTC().AddDate(0, 0, -2).Format("2006-01-02") }

func validParentProfile() models.ParentProfile { return models.ParentProfile{ID: uuid.New()} }
func validNannyProfile() models.NannyProfile {
	return models.NannyProfile{ID: uuid.New(), RatePerHour: 25.0}
}

// ── parseBookingDateTime ──────────────────────────────────────────────────────

func TestParseBookingDateTime(t *testing.T) {
	t.Run("valid UTC booking", func(t *testing.T) {
		dateOnly, start, err := parseBookingDateTime("2026-08-15", "09:30", 0)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if dateOnly.Hour() != 0 || dateOnly.Minute() != 0 {
			t.Errorf("dateOnly should be midnight UTC, got %v", dateOnly)
		}
		if start.UTC().Hour() != 9 || start.UTC().Minute() != 30 {
			t.Errorf("expected 09:30 UTC, got %v", start.UTC())
		}
	})

	t.Run("negative offset shifts start earlier in UTC", func(t *testing.T) {
		// UTC+5 (Date#getTimezoneOffset() = -300): local 10:00 = UTC 05:00
		_, start, err := parseBookingDateTime("2026-08-15", "10:00", -300)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if start.UTC().Hour() != 5 {
			t.Errorf("expected UTC hour 5, got %d", start.UTC().Hour())
		}
	})

	t.Run("positive offset shifts start later in UTC", func(t *testing.T) {
		// UTC-5 (Date#getTimezoneOffset() = +300): local 10:00 = UTC 15:00
		_, start, err := parseBookingDateTime("2026-08-15", "10:00", 300)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if start.UTC().Hour() != 15 {
			t.Errorf("expected UTC hour 15, got %d", start.UTC().Hour())
		}
	})

	t.Run("invalid date format returns error", func(t *testing.T) {
		if _, _, err := parseBookingDateTime("15-08-2026", "10:00", 0); err == nil {
			t.Error("expected error for invalid date format")
		}
	})

	t.Run("invalid time format returns error", func(t *testing.T) {
		if _, _, err := parseBookingDateTime("2026-08-15", "10:60", 0); err == nil {
			t.Error("expected error for invalid time format")
		}
	})
}

// ── parseDateBoundary ─────────────────────────────────────────────────────────

func TestParseDateBoundary(t *testing.T) {
	t.Run("empty string returns nil no error", func(t *testing.T) {
		v, err := parseDateBoundary("", false)
		if err != nil || v != nil {
			t.Errorf("expected nil, nil; got %v, %v", v, err)
		}
	})

	t.Run("start of day is midnight", func(t *testing.T) {
		v, err := parseDateBoundary("2026-06-01", false)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if v.Hour() != 0 || v.Minute() != 0 || v.Second() != 0 {
			t.Errorf("expected midnight, got %v", v)
		}
	})

	t.Run("end of day is 23:59:59", func(t *testing.T) {
		v, err := parseDateBoundary("2026-06-01", true)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if v.Hour() != 23 || v.Minute() != 59 || v.Second() != 59 {
			t.Errorf("expected 23:59:59, got %v", v)
		}
	})

	t.Run("invalid date returns error", func(t *testing.T) {
		if _, err := parseDateBoundary("not-a-date", false); err == nil {
			t.Error("expected error for invalid date")
		}
	})
}

// ── parseBookingListStatus ────────────────────────────────────────────────────

func TestParseBookingListStatus(t *testing.T) {
	valid := []string{"", "pending", "approved", "declined", "cancelled"}
	for _, s := range valid {
		status, ok := parseBookingListStatus(s)
		if !ok {
			t.Errorf("%q should be valid", s)
		}
		if string(status) != s {
			t.Errorf("expected %q, got %q", s, status)
		}
	}

	if _, ok := parseBookingListStatus("unknown"); ok {
		t.Error("expected \"unknown\" to be invalid")
	}
}

// ── toBookingData ─────────────────────────────────────────────────────────────

func TestToBookingData(t *testing.T) {
	id, parentID, nannyID := uuid.New(), uuid.New(), uuid.New()
	now := time.Now().UTC().Truncate(time.Second)

	b := models.Booking{
		ID: id, ParentProfileID: parentID, NannyProfileID: nannyID,
		Date: now, StartTime: now, Duration: 4, TotalAmount: 100.0,
		Status: models.PendingBookingStatus, CreatedAt: now, UpdatedAt: now,
	}
	d := toBookingData(b)

	if d.ID != id.String() {
		t.Errorf("ID: got %s, want %s", d.ID, id)
	}
	if d.ParentProfileID != parentID.String() {
		t.Errorf("ParentProfileID mismatch")
	}
	if d.NannyProfileID != nannyID.String() {
		t.Errorf("NannyProfileID mismatch")
	}
	if d.Duration != 4 {
		t.Errorf("Duration: got %d, want 4", d.Duration)
	}
	if d.TotalAmount != 100.0 {
		t.Errorf("TotalAmount: got %f, want 100.0", d.TotalAmount)
	}
	if d.Status != models.PendingBookingStatus {
		t.Errorf("Status: got %s, want %s", d.Status, models.PendingBookingStatus)
	}
}
