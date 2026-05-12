package pipes

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/bookings/dtos"
	"github.com/kinsittr/kinsittr-api/bookings/messages"
	"github.com/kinsittr/kinsittr-api/models"
	bookingsrepo "github.com/kinsittr/kinsittr-api/repositories/bookings"
	messagesrepo "github.com/kinsittr/kinsittr-api/repositories/messages"
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
	declinedBooking     bookingsrepo.BookingRecord
	declineBookingErr   error
}

func (m *mockBookingsRepo) HasParentActiveBookingWithNanny(_ context.Context, _, _ uuid.UUID, _ time.Time, _ int) (bool, error) {
	return m.hasParentActive, m.hasParentActiveErr
}
func (m *mockBookingsRepo) HasNannyApprovedBookingConflict(_ context.Context, _ uuid.UUID, _ time.Time, _ int) (bool, error) {
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
	return m.approvedBooking, m.approveBookingErr
}
func (m *mockBookingsRepo) DeclineNannyBooking(_ context.Context, _, _ uuid.UUID) (bookingsrepo.BookingRecord, error) {
	return m.declinedBooking, m.declineBookingErr
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
func (m *mockProfileRepo) UpdateParentProfile(_ context.Context, p models.ParentProfile) (models.ParentProfile, error) {
	return p, nil
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

type mockMessagesRepo struct {
	conversation models.Conversation
}

func (m *mockMessagesRepo) GetConversationByBookingID(_ context.Context, _ uuid.UUID) (models.Conversation, error) {
	return m.conversation, nil
}
func (m *mockMessagesRepo) CreateConversation(_ context.Context, conversation models.Conversation) (models.Conversation, error) {
	m.conversation = conversation
	return conversation, nil
}
func (m *mockMessagesRepo) ListParentConversations(_ context.Context, _ uuid.UUID, _ messagesrepo.ConversationListFilter) ([]messagesrepo.ConversationRecord, int, error) {
	return nil, 0, nil
}
func (m *mockMessagesRepo) ListNannyConversations(_ context.Context, _ uuid.UUID, _ messagesrepo.ConversationListFilter) ([]messagesrepo.ConversationRecord, int, error) {
	return nil, 0, nil
}
func (m *mockMessagesRepo) GetParentConversationByID(_ context.Context, _, _ uuid.UUID) (messagesrepo.ConversationRecord, error) {
	return messagesrepo.ConversationRecord{}, nil
}
func (m *mockMessagesRepo) GetNannyConversationByID(_ context.Context, _, _ uuid.UUID) (messagesrepo.ConversationRecord, error) {
	return messagesrepo.ConversationRecord{}, nil
}
func (m *mockMessagesRepo) ListMessages(_ context.Context, _ uuid.UUID, _ messagesrepo.MessageListFilter) ([]models.Message, int, error) {
	return nil, 0, nil
}
func (m *mockMessagesRepo) CreateMessage(_ context.Context, message models.Message) (models.Message, error) {
	return message, nil
}

// ── helpers ───────────────────────────────────────────────────────────────────

func newBookingsPipe(b bookingsrepo.BookingsRepository, pr *mockProfileRepo, nr *mockNannyRepo) *BookingsPipe {
	return NewBookingsPipe(b, &mockMessagesRepo{}, pr, nr)
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

// ── Create ────────────────────────────────────────────────────────────────────

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
		p := newBookingsPipe(
			&mockBookingsRepo{hasParentActive: true},
			&mockProfileRepo{parentProfile: validParentProfile()},
			&mockNannyRepo{nanny: validNannyProfile()},
		)
		res := p.Create(ctx, userID, validDTO)
		if res.Success || string(res.Message) != messages.Booking_Already_Exists {
			t.Errorf("expected %s, got %s", messages.Booking_Already_Exists, res.Message)
		}
	})

	t.Run("nanny time conflict", func(t *testing.T) {
		p := newBookingsPipe(
			&mockBookingsRepo{hasNannyConflict: true},
			&mockProfileRepo{parentProfile: validParentProfile()},
			&mockNannyRepo{nanny: validNannyProfile()},
		)
		res := p.Create(ctx, userID, validDTO)
		if res.Success || string(res.Message) != messages.Nanny_Time_Unavailable {
			t.Errorf("expected %s, got %s", messages.Nanny_Time_Unavailable, res.Message)
		}
	})

	t.Run("create returns ErrBookingAlreadyExists", func(t *testing.T) {
		p := newBookingsPipe(
			&mockBookingsRepo{createBookingErr: bookingsrepo.ErrBookingAlreadyExists},
			&mockProfileRepo{parentProfile: validParentProfile()},
			&mockNannyRepo{nanny: validNannyProfile()},
		)
		res := p.Create(ctx, userID, validDTO)
		if res.Success || string(res.Message) != messages.Booking_Already_Exists {
			t.Errorf("expected %s, got %s", messages.Booking_Already_Exists, res.Message)
		}
	})

	t.Run("create returns ErrNannyTimeUnavailable", func(t *testing.T) {
		p := newBookingsPipe(
			&mockBookingsRepo{createBookingErr: bookingsrepo.ErrNannyTimeUnavailable},
			&mockProfileRepo{parentProfile: validParentProfile()},
			&mockNannyRepo{nanny: validNannyProfile()},
		)
		res := p.Create(ctx, userID, validDTO)
		if res.Success || string(res.Message) != messages.Nanny_Time_Unavailable {
			t.Errorf("expected %s, got %s", messages.Nanny_Time_Unavailable, res.Message)
		}
	})

	t.Run("create generic repo error", func(t *testing.T) {
		p := newBookingsPipe(
			&mockBookingsRepo{createBookingErr: errors.New("db")},
			&mockProfileRepo{parentProfile: validParentProfile()},
			&mockNannyRepo{nanny: validNannyProfile()},
		)
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

		created := models.Booking{
			ID: uuid.New(), Duration: 3, TotalAmount: 90.0,
			Status: models.PendingBookingStatus,
		}
		p := newBookingsPipe(
			&mockBookingsRepo{createdBooking: created},
			&mockProfileRepo{parentProfile: validParentProfile()},
			&mockNannyRepo{nanny: nanny},
		)
		res := p.Create(ctx, userID, validDTO)
		if !res.Success || string(res.Message) != messages.Booking_Created {
			t.Fatalf("expected success %s, got success=%v msg=%s", messages.Booking_Created, res.Success, res.Message)
		}
		if res.Data == nil {
			t.Fatal("expected data, got nil")
		}
		if res.Data.NannyDisplayName != "Jane Doe" {
			t.Errorf("NannyDisplayName: got %q, want %q", res.Data.NannyDisplayName, "Jane Doe")
		}
		if res.Data.TotalAmount != 90.0 {
			t.Errorf("TotalAmount: got %f, want 90.0", res.Data.TotalAmount)
		}
	})
}

// ── List ──────────────────────────────────────────────────────────────────────

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

	t.Run("invalid date_from", func(t *testing.T) {
		p := newBookingsPipe(&mockBookingsRepo{}, withParent, &mockNannyRepo{})
		res := p.List(ctx, userID, dtos.ListBookingsQueryDTO{DateFrom: "not-a-date"})
		if res.Success || string(res.Message) != messages.Invalid_Booking_Request {
			t.Errorf("expected %s, got %s", messages.Invalid_Booking_Request, res.Message)
		}
	})

	t.Run("invalid date_to", func(t *testing.T) {
		p := newBookingsPipe(&mockBookingsRepo{}, withParent, &mockNannyRepo{})
		res := p.List(ctx, userID, dtos.ListBookingsQueryDTO{DateTo: "not-a-date"})
		if res.Success || string(res.Message) != messages.Invalid_Booking_Request {
			t.Errorf("expected %s, got %s", messages.Invalid_Booking_Request, res.Message)
		}
	})

	t.Run("date_from after date_to", func(t *testing.T) {
		p := newBookingsPipe(&mockBookingsRepo{}, withParent, &mockNannyRepo{})
		res := p.List(ctx, userID, dtos.ListBookingsQueryDTO{DateFrom: "2026-06-10", DateTo: "2026-06-01"})
		if res.Success || string(res.Message) != messages.Invalid_Booking_Request {
			t.Errorf("expected %s, got %s", messages.Invalid_Booking_Request, res.Message)
		}
	})

	t.Run("page < 1 normalised to 1", func(t *testing.T) {
		p := newBookingsPipe(&mockBookingsRepo{}, withParent, &mockNannyRepo{})
		res := p.List(ctx, userID, dtos.ListBookingsQueryDTO{Page: 0, Limit: 10})
		if !res.Success {
			t.Fatalf("expected success, got %s", res.Message)
		}
		if res.Data.Page != 1 {
			t.Errorf("expected page 1, got %d", res.Data.Page)
		}
	})

	t.Run("limit < 1 defaults to 20", func(t *testing.T) {
		p := newBookingsPipe(&mockBookingsRepo{}, withParent, &mockNannyRepo{})
		res := p.List(ctx, userID, dtos.ListBookingsQueryDTO{Page: 1, Limit: 0})
		if !res.Success {
			t.Fatalf("expected success, got %s", res.Message)
		}
		if res.Data.Limit != 20 {
			t.Errorf("expected limit 20, got %d", res.Data.Limit)
		}
	})

	t.Run("limit > 100 clamped to 100", func(t *testing.T) {
		p := newBookingsPipe(&mockBookingsRepo{}, withParent, &mockNannyRepo{})
		res := p.List(ctx, userID, dtos.ListBookingsQueryDTO{Page: 1, Limit: 500})
		if !res.Success {
			t.Fatalf("expected success, got %s", res.Message)
		}
		if res.Data.Limit != 100 {
			t.Errorf("expected limit 100, got %d", res.Data.Limit)
		}
	})

	t.Run("success returns items and total", func(t *testing.T) {
		records := []bookingsrepo.BookingRecord{
			{Booking: models.Booking{ID: uuid.New(), Status: models.PendingBookingStatus}, NannyDisplayName: "Jane"},
		}
		bRepo := &mockBookingsRepo{parentBookings: records, parentBookingsTotal: 1}
		p := newBookingsPipe(bRepo, withParent, &mockNannyRepo{})
		res := p.List(ctx, userID, dtos.ListBookingsQueryDTO{Page: 1, Limit: 10})
		if !res.Success || string(res.Message) != messages.Booking_Listed {
			t.Fatalf("expected success %s, got %s", messages.Booking_Listed, res.Message)
		}
		if res.Data.Total != 1 || len(res.Data.Items) != 1 {
			t.Errorf("expected 1 item, got %d (total=%d)", len(res.Data.Items), res.Data.Total)
		}
		if res.Data.Items[0].NannyDisplayName != "Jane" {
			t.Errorf("NannyDisplayName mismatch")
		}
	})
}

// ── Cancel ────────────────────────────────────────────────────────────────────

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

	t.Run("get booking repo error", func(t *testing.T) {
		p := newBookingsPipe(&mockBookingsRepo{parentBookingErr: errors.New("db")}, withParent, &mockNannyRepo{})
		res := p.Cancel(ctx, userID, bookingID)
		if res.Success || string(res.Message) != messages.Cannot_Cancel_Booking {
			t.Errorf("expected %s, got %s", messages.Cannot_Cancel_Booking, res.Message)
		}
	})

	t.Run("booking not found", func(t *testing.T) {
		p := newBookingsPipe(&mockBookingsRepo{}, withParent, &mockNannyRepo{})
		res := p.Cancel(ctx, userID, bookingID)
		if res.Success || string(res.Message) != messages.Booking_Not_Found {
			t.Errorf("expected %s, got %s", messages.Booking_Not_Found, res.Message)
		}
	})

	t.Run("already approved cannot be cancelled", func(t *testing.T) {
		approved := bookingsrepo.BookingRecord{Booking: models.Booking{ID: uuid.New(), Status: models.ApprovedBookingStatus}}
		p := newBookingsPipe(&mockBookingsRepo{parentBooking: approved}, withParent, &mockNannyRepo{})
		res := p.Cancel(ctx, userID, bookingID)
		if res.Success || string(res.Message) != messages.Booking_Already_Approved {
			t.Errorf("expected %s, got %s", messages.Booking_Already_Approved, res.Message)
		}
	})

	t.Run("declined booking cannot be cancelled", func(t *testing.T) {
		declined := bookingsrepo.BookingRecord{Booking: models.Booking{ID: uuid.New(), Status: models.DeclinedBookingStatus}}
		p := newBookingsPipe(&mockBookingsRepo{parentBooking: declined}, withParent, &mockNannyRepo{})
		res := p.Cancel(ctx, userID, bookingID)
		if res.Success || string(res.Message) != messages.Cannot_Cancel_Booking {
			t.Errorf("expected %s, got %s", messages.Cannot_Cancel_Booking, res.Message)
		}
	})

	t.Run("cancel repo error", func(t *testing.T) {
		pending := pendingRecord()
		p := newBookingsPipe(&mockBookingsRepo{parentBooking: pending, cancelBookingErr: errors.New("db")}, withParent, &mockNannyRepo{})
		res := p.Cancel(ctx, userID, bookingID)
		if res.Success || string(res.Message) != messages.Cannot_Cancel_Booking {
			t.Errorf("expected %s, got %s", messages.Cannot_Cancel_Booking, res.Message)
		}
	})

	t.Run("success", func(t *testing.T) {
		pending := pendingRecord()
		cancelled := bookingsrepo.BookingRecord{Booking: models.Booking{ID: uuid.New(), Status: models.CancelledBookingStatus}}
		p := newBookingsPipe(&mockBookingsRepo{parentBooking: pending, cancelledBooking: cancelled}, withParent, &mockNannyRepo{})
		res := p.Cancel(ctx, userID, bookingID)
		if !res.Success || string(res.Message) != messages.Booking_Cancelled {
			t.Errorf("expected success %s, got success=%v msg=%s", messages.Booking_Cancelled, res.Success, res.Message)
		}
	})
}

// ── GetByID ───────────────────────────────────────────────────────────────────

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

	t.Run("booking not found", func(t *testing.T) {
		p := newBookingsPipe(&mockBookingsRepo{}, withParent, &mockNannyRepo{})
		res := p.GetByID(ctx, userID, bookingID)
		if res.Success || string(res.Message) != messages.Booking_Not_Found {
			t.Errorf("expected %s, got %s", messages.Booking_Not_Found, res.Message)
		}
	})

	t.Run("success", func(t *testing.T) {
		record := bookingsrepo.BookingRecord{
			Booking:          models.Booking{ID: uuid.New()},
			NannyDisplayName: "Jane",
		}
		p := newBookingsPipe(&mockBookingsRepo{parentBooking: record}, withParent, &mockNannyRepo{})
		res := p.GetByID(ctx, userID, bookingID)
		if !res.Success || string(res.Message) != messages.Booking_Found {
			t.Errorf("expected success %s, got %s", messages.Booking_Found, res.Message)
		}
		if res.Data.NannyDisplayName != "Jane" {
			t.Errorf("NannyDisplayName mismatch")
		}
	})
}

// ── Approve ───────────────────────────────────────────────────────────────────

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
		repo := &mockBookingsRepo{approveBookingErr: bookingsrepo.ErrNannyTimeUnavailable}
		p := newBookingsPipe(repo, withNanny, &mockNannyRepo{})
		res := p.Approve(ctx, userID, bookingID)
		if res.Success || string(res.Message) != messages.Nanny_Time_Unavailable {
			t.Errorf("expected %s, got %s", messages.Nanny_Time_Unavailable, res.Message)
		}
	})

	t.Run("generic repo error", func(t *testing.T) {
		repo := &mockBookingsRepo{approveBookingErr: errors.New("db")}
		p := newBookingsPipe(repo, withNanny, &mockNannyRepo{})
		res := p.Approve(ctx, userID, bookingID)
		if res.Success || string(res.Message) != messages.Cannot_Approve_Booking {
			t.Errorf("expected %s, got %s", messages.Cannot_Approve_Booking, res.Message)
		}
	})

	t.Run("booking not found (nil id)", func(t *testing.T) {
		p := newBookingsPipe(&mockBookingsRepo{}, withNanny, &mockNannyRepo{})
		res := p.Approve(ctx, userID, bookingID)
		if res.Success || string(res.Message) != messages.Booking_Not_Found {
			t.Errorf("expected %s, got %s", messages.Booking_Not_Found, res.Message)
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

// ── Decline ───────────────────────────────────────────────────────────────────

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
		repo := &mockBookingsRepo{declineBookingErr: errors.New("db")}
		p := newBookingsPipe(repo, withNanny, &mockNannyRepo{})
		res := p.Decline(ctx, userID, bookingID)
		if res.Success || string(res.Message) != messages.Cannot_Decline_Booking {
			t.Errorf("expected %s, got %s", messages.Cannot_Decline_Booking, res.Message)
		}
	})

	t.Run("booking not found (nil id)", func(t *testing.T) {
		p := newBookingsPipe(&mockBookingsRepo{}, withNanny, &mockNannyRepo{})
		res := p.Decline(ctx, userID, bookingID)
		if res.Success || string(res.Message) != messages.Booking_Not_Found {
			t.Errorf("expected %s, got %s", messages.Booking_Not_Found, res.Message)
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

// ── GetForNannyByID ───────────────────────────────────────────────────────────

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

	t.Run("booking not found", func(t *testing.T) {
		p := newBookingsPipe(&mockBookingsRepo{}, withNanny, &mockNannyRepo{})
		res := p.GetForNannyByID(ctx, userID, bookingID)
		if res.Success || string(res.Message) != messages.Booking_Not_Found {
			t.Errorf("expected %s, got %s", messages.Booking_Not_Found, res.Message)
		}
	})

	t.Run("success", func(t *testing.T) {
		record := bookingsrepo.BookingRecord{
			Booking:           models.Booking{ID: uuid.New()},
			ParentDisplayName: "Alice",
		}
		p := newBookingsPipe(&mockBookingsRepo{nannyBooking: record}, withNanny, &mockNannyRepo{})
		res := p.GetForNannyByID(ctx, userID, bookingID)
		if !res.Success || string(res.Message) != messages.Booking_Found {
			t.Errorf("expected success %s, got %s", messages.Booking_Found, res.Message)
		}
		if res.Data.ParentDisplayName != "Alice" {
			t.Errorf("ParentDisplayName mismatch")
		}
	})
}

// ── ListForNanny ──────────────────────────────────────────────────────────────

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

	t.Run("page < 1 normalised to 1", func(t *testing.T) {
		p := newBookingsPipe(&mockBookingsRepo{}, withNanny, &mockNannyRepo{})
		res := p.ListForNanny(ctx, userID, dtos.ListBookingsQueryDTO{Page: -5, Limit: 10})
		if !res.Success {
			t.Fatalf("expected success, got %s", res.Message)
		}
		if res.Data.Page != 1 {
			t.Errorf("expected page 1, got %d", res.Data.Page)
		}
	})

	t.Run("limit > 100 clamped to 100", func(t *testing.T) {
		p := newBookingsPipe(&mockBookingsRepo{}, withNanny, &mockNannyRepo{})
		res := p.ListForNanny(ctx, userID, dtos.ListBookingsQueryDTO{Page: 1, Limit: 999})
		if !res.Success {
			t.Fatalf("expected success, got %s", res.Message)
		}
		if res.Data.Limit != 100 {
			t.Errorf("expected limit 100, got %d", res.Data.Limit)
		}
	})

	t.Run("success", func(t *testing.T) {
		records := []bookingsrepo.BookingRecord{
			{Booking: models.Booking{ID: uuid.New()}, ParentDisplayName: "Alice"},
		}
		repo := &mockBookingsRepo{nannyBookings: records, nannyBookingsTotal: 1}
		p := newBookingsPipe(repo, withNanny, &mockNannyRepo{})
		res := p.ListForNanny(ctx, userID, dtos.ListBookingsQueryDTO{Page: 1, Limit: 10})
		if !res.Success || res.Data.Total != 1 || len(res.Data.Items) != 1 {
			t.Errorf("expected 1 item, got %d total=%d success=%v", len(res.Data.Items), res.Data.Total, res.Success)
		}
	})
}
