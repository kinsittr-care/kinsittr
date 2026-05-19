package pipes

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/models"
	bookingrepo "github.com/kinsittr/kinsittr-api/repositories/bookings"
	"github.com/kinsittr/kinsittr-api/repositories/profile"
	reviewrepo "github.com/kinsittr/kinsittr-api/repositories/reviews"
	reviewdtos "github.com/kinsittr/kinsittr-api/reviews/dtos"
	"github.com/kinsittr/kinsittr-api/reviews/messages"
)

type mockReviewsRepo struct {
	record    reviewrepo.ReviewRecord
	createErr error
	flagged   bool
}

func (m *mockReviewsRepo) CreateReview(context.Context, reviewrepo.CreateReviewParams) (reviewrepo.ReviewRecord, error) {
	return m.record, m.createErr
}
func (m *mockReviewsRepo) CreateParentReview(context.Context, reviewrepo.CreateReviewParams) (reviewrepo.ReviewRecord, error) {
	return m.record, m.createErr
}
func (m *mockReviewsRepo) GetReviewByID(context.Context, uuid.UUID, bool) (reviewrepo.ReviewRecord, error) {
	return m.record, nil
}
func (m *mockReviewsRepo) GetParentReviewByID(context.Context, uuid.UUID, bool) (reviewrepo.ReviewRecord, error) {
	return m.record, nil
}
func (m *mockReviewsRepo) ListReviews(context.Context, reviewrepo.ListReviewsFilter) ([]reviewrepo.ReviewRecord, int, error) {
	return []reviewrepo.ReviewRecord{m.record}, 1, nil
}
func (m *mockReviewsRepo) ListParentReviews(context.Context, reviewrepo.ListReviewsFilter) ([]reviewrepo.ReviewRecord, int, error) {
	return []reviewrepo.ReviewRecord{m.record}, 1, nil
}
func (m *mockReviewsRepo) ListPublicNannyReviews(context.Context, uuid.UUID, int, int) ([]reviewrepo.ReviewRecord, int, error) {
	return []reviewrepo.ReviewRecord{m.record}, 1, nil
}
func (m *mockReviewsRepo) FlagReview(context.Context, reviewrepo.AdminReviewActionParams) (reviewrepo.ReviewRecord, error) {
	m.flagged = true
	return m.record, nil
}
func (m *mockReviewsRepo) UnflagReview(context.Context, reviewrepo.AdminReviewActionParams) (reviewrepo.ReviewRecord, error) {
	return m.record, nil
}
func (m *mockReviewsRepo) FlagParentReview(context.Context, reviewrepo.AdminReviewActionParams) (reviewrepo.ReviewRecord, error) {
	m.flagged = true
	return m.record, nil
}
func (m *mockReviewsRepo) UnflagParentReview(context.Context, reviewrepo.AdminReviewActionParams) (reviewrepo.ReviewRecord, error) {
	return m.record, nil
}
func (m *mockReviewsRepo) ListReviewActions(context.Context, uuid.UUID, int, int) ([]reviewrepo.AdminReviewActionRecord, int, error) {
	return nil, 0, nil
}
func (m *mockReviewsRepo) ListParentReviewActions(context.Context, uuid.UUID, int, int) ([]reviewrepo.AdminReviewActionRecord, int, error) {
	return nil, 0, nil
}

type mockReviewBookingRepo struct {
	booking bookingrepo.BookingRecord
}

func (m *mockReviewBookingRepo) GetParentBookingByID(context.Context, uuid.UUID, uuid.UUID) (bookingrepo.BookingRecord, error) {
	return m.booking, nil
}
func (m *mockReviewBookingRepo) HasParentActiveBookingWithNanny(context.Context, uuid.UUID, uuid.UUID, time.Time, int) (bool, error) {
	return false, nil
}
func (m *mockReviewBookingRepo) HasNannyApprovedBookingConflict(context.Context, uuid.UUID, time.Time, int) (bool, error) {
	return false, nil
}
func (m *mockReviewBookingRepo) HasNannyApprovedBookingConflictExcluding(context.Context, uuid.UUID, time.Time, int, uuid.UUID) (bool, error) {
	return false, nil
}
func (m *mockReviewBookingRepo) CreateBooking(context.Context, models.Booking) (models.Booking, error) {
	return models.Booking{}, nil
}
func (m *mockReviewBookingRepo) ListParentBookings(context.Context, uuid.UUID, bookingrepo.ListBookingsFilter) ([]bookingrepo.BookingRecord, int, error) {
	return nil, 0, nil
}
func (m *mockReviewBookingRepo) CancelParentBooking(context.Context, uuid.UUID, uuid.UUID) (bookingrepo.BookingRecord, error) {
	return bookingrepo.BookingRecord{}, nil
}
func (m *mockReviewBookingRepo) ListNannyBookings(context.Context, uuid.UUID, bookingrepo.ListBookingsFilter) ([]bookingrepo.BookingRecord, int, error) {
	return nil, 0, nil
}
func (m *mockReviewBookingRepo) GetNannyBookingByID(context.Context, uuid.UUID, uuid.UUID) (bookingrepo.BookingRecord, error) {
	return m.booking, nil
}
func (m *mockReviewBookingRepo) ApproveNannyBooking(context.Context, uuid.UUID, uuid.UUID) (bookingrepo.BookingRecord, error) {
	return bookingrepo.BookingRecord{}, nil
}
func (m *mockReviewBookingRepo) ApproveNannyBookingWithConversation(context.Context, uuid.UUID, uuid.UUID) (bookingrepo.BookingRecord, error) {
	return bookingrepo.BookingRecord{}, nil
}
func (m *mockReviewBookingRepo) DeclineNannyBooking(context.Context, uuid.UUID, uuid.UUID) (bookingrepo.BookingRecord, error) {
	return bookingrepo.BookingRecord{}, nil
}
func (m *mockReviewBookingRepo) CreateBookingChangeRequest(context.Context, models.BookingChangeRequest) (models.BookingChangeRequest, error) {
	return models.BookingChangeRequest{}, nil
}
func (m *mockReviewBookingRepo) ListBookingChangeRequests(context.Context, uuid.UUID) ([]models.BookingChangeRequest, error) {
	return nil, nil
}
func (m *mockReviewBookingRepo) GetBookingChangeRequestByID(context.Context, uuid.UUID, uuid.UUID) (models.BookingChangeRequest, error) {
	return models.BookingChangeRequest{}, nil
}
func (m *mockReviewBookingRepo) AcceptBookingChangeRequest(context.Context, uuid.UUID, uuid.UUID, string) (bookingrepo.BookingRecord, models.BookingChangeRequest, error) {
	return bookingrepo.BookingRecord{}, models.BookingChangeRequest{}, nil
}
func (m *mockReviewBookingRepo) DeclineBookingChangeRequest(context.Context, uuid.UUID, uuid.UUID, string) (models.BookingChangeRequest, error) {
	return models.BookingChangeRequest{}, nil
}
func (m *mockReviewBookingRepo) CompleteNannyBooking(context.Context, uuid.UUID, uuid.UUID) (bookingrepo.BookingRecord, error) {
	return bookingrepo.BookingRecord{}, nil
}

type mockReviewProfileRepo struct {
	parent models.ParentProfile
	nanny  models.NannyProfile
}

func (m *mockReviewProfileRepo) GetParentProfileByUserID(context.Context, uuid.UUID) (models.ParentProfile, error) {
	return m.parent, nil
}
func (m *mockReviewProfileRepo) CreateNannyProfile(context.Context, models.NannyProfile) (models.NannyProfile, error) {
	return models.NannyProfile{}, nil
}
func (m *mockReviewProfileRepo) CreateParentProfile(context.Context, models.ParentProfile) (models.ParentProfile, error) {
	return models.ParentProfile{}, nil
}
func (m *mockReviewProfileRepo) GetNannyProfileByUserID(context.Context, uuid.UUID) (models.NannyProfile, error) {
	return m.nanny, nil
}
func (m *mockReviewProfileRepo) UpdateNannyProfile(context.Context, models.NannyProfile) (models.NannyProfile, error) {
	return models.NannyProfile{}, nil
}
func (m *mockReviewProfileRepo) UpdateParentProfile(context.Context, models.ParentProfile) (models.ParentProfile, error) {
	return models.ParentProfile{}, nil
}
func (m *mockReviewProfileRepo) GetOrCreateParentSettings(context.Context, uuid.UUID) (models.ParentSettings, error) {
	return models.ParentSettings{}, nil
}
func (m *mockReviewProfileRepo) UpdateParentSettings(context.Context, models.ParentSettings) (models.ParentSettings, error) {
	return models.ParentSettings{}, nil
}
func (m *mockReviewProfileRepo) DeleteNannyProfile(context.Context, uuid.UUID) error { return nil }
func (m *mockReviewProfileRepo) DeleteParentProfile(context.Context, uuid.UUID) error {
	return nil
}

var _ reviewrepo.ReviewsRepository = (*mockReviewsRepo)(nil)
var _ bookingrepo.BookingsRepository = (*mockReviewBookingRepo)(nil)
var _ profile.ProfileRepository = (*mockReviewProfileRepo)(nil)

func reviewTestPipe(status models.BookingStatus, reviewErr error) (*ReviewsPipe, *mockReviewsRepo, uuid.UUID) {
	parentID := uuid.New()
	nannyID := uuid.New()
	bookingID := uuid.New()
	record := reviewrepo.ReviewRecord{
		ID:               uuid.New(),
		BookingID:        bookingID,
		ParentProfileID:  parentID,
		NannyProfileID:   nannyID,
		Rating:           5,
		Comment:          "Great care",
		IsVisible:        true,
		Target:           reviewrepo.NannyReviewTarget,
		CreatedAt:        time.Now(),
		UpdatedAt:        time.Now(),
		BookingDate:      time.Now(),
		BookingStartTime: time.Now(),
		BookingStatus:    status,
	}
	reviewsRepo := &mockReviewsRepo{record: record, createErr: reviewErr}
	bookingRepo := &mockReviewBookingRepo{booking: bookingrepo.BookingRecord{Booking: models.Booking{
		ID:              bookingID,
		ParentProfileID: parentID,
		NannyProfileID:  nannyID,
		Status:          status,
	}}}
	profileRepo := &mockReviewProfileRepo{
		parent: models.ParentProfile{ID: parentID, UserID: uuid.New()},
		nanny:  models.NannyProfile{ID: nannyID, UserID: uuid.New()},
	}
	return NewReviewsPipe(reviewsRepo, bookingRepo, profileRepo), reviewsRepo, bookingID
}

func TestCreateParentReviewRequiresCompletedBooking(t *testing.T) {
	pipe, _, bookingID := reviewTestPipe(models.ApprovedBookingStatus, nil)
	res := pipe.CreateParentReview(context.Background(), uuid.New(), bookingID, reviewdtos.CreateReviewDTO{Rating: 5, Comment: "Great care"})

	if res.Success || string(res.Message) != messages.Cannot_Review_Booking {
		t.Fatalf("expected cannot review booking, got success=%v message=%s", res.Success, res.Message)
	}
}

func TestCreateParentReviewMapsDuplicateReview(t *testing.T) {
	pipe, _, bookingID := reviewTestPipe(models.CompletedBookingStatus, reviewrepo.ErrReviewAlreadyExists)
	res := pipe.CreateParentReview(context.Background(), uuid.New(), bookingID, reviewdtos.CreateReviewDTO{Rating: 5, Comment: "Great care"})

	if res.Success || string(res.Message) != messages.Review_Already_Exists {
		t.Fatalf("expected duplicate review, got success=%v message=%s", res.Success, res.Message)
	}
}

func TestCreateParentReviewSucceedsForCompletedBooking(t *testing.T) {
	pipe, _, bookingID := reviewTestPipe(models.CompletedBookingStatus, nil)
	res := pipe.CreateParentReview(context.Background(), uuid.New(), bookingID, reviewdtos.CreateReviewDTO{Rating: 5, Comment: "Great care"})

	if !res.Success || string(res.Message) != messages.Review_Created {
		t.Fatalf("expected review created, got success=%v message=%s", res.Success, res.Message)
	}
}

func TestFlagReviewRequiresReason(t *testing.T) {
	pipe, reviewsRepo, _ := reviewTestPipe(models.CompletedBookingStatus, nil)
	res := pipe.FlagReview(context.Background(), uuid.New(), reviewsRepo.record.ID, "", reviewdtos.AdminReviewActionDTO{})

	if res.Success || string(res.Message) != messages.Invalid_Review_Request {
		t.Fatalf("expected reason validation, got success=%v message=%s", res.Success, res.Message)
	}
	if reviewsRepo.flagged {
		t.Fatal("expected empty reason to block repository mutation")
	}
}

func TestCreateNannyReviewRequiresCompletedBooking(t *testing.T) {
	pipe, _, bookingID := reviewTestPipe(models.ApprovedBookingStatus, nil)
	res := pipe.CreateNannyReview(context.Background(), uuid.New(), bookingID, reviewdtos.CreateReviewDTO{Rating: 5, Comment: "Respectful parent"})

	if res.Success || string(res.Message) != messages.Cannot_Review_Booking {
		t.Fatalf("expected cannot review booking, got success=%v message=%s", res.Success, res.Message)
	}
}

func TestCreateNannyReviewSucceedsForCompletedBooking(t *testing.T) {
	pipe, _, bookingID := reviewTestPipe(models.CompletedBookingStatus, nil)
	res := pipe.CreateNannyReview(context.Background(), uuid.New(), bookingID, reviewdtos.CreateReviewDTO{Rating: 5, Comment: "Respectful parent"})

	if !res.Success || string(res.Message) != messages.Review_Created {
		t.Fatalf("expected review created, got success=%v message=%s", res.Success, res.Message)
	}
}

func TestMapReviewCreateErrorUsesGenericFallback(t *testing.T) {
	pipe, _, bookingID := reviewTestPipe(models.CompletedBookingStatus, errors.New("db failed"))
	res := pipe.CreateParentReview(context.Background(), uuid.New(), bookingID, reviewdtos.CreateReviewDTO{Rating: 5, Comment: "Great care"})

	if res.Success || string(res.Message) != messages.Invalid_Review_Request {
		t.Fatalf("expected generic invalid request, got success=%v message=%s", res.Success, res.Message)
	}
}
