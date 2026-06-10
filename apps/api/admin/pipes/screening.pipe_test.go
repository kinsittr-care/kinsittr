package pipes

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/admin/dtos"
	"github.com/kinsittr/kinsittr-api/admin/messages"
	"github.com/kinsittr/kinsittr-api/models"
	repository "github.com/kinsittr/kinsittr-api/repositories/admin"
)

type mockAdminRepo struct {
	nanny               repository.NannyRecord
	updatedNanny        repository.NannyRecord
	invite              models.AdminInvite
	createInviteParams  repository.InviteAdminParams
	stepsUpdated        bool
	statusActionUpdated bool
}

func (m *mockAdminRepo) ListNannies(context.Context, repository.ListNanniesFilter) ([]repository.NannyRecord, int, error) {
	return nil, 0, nil
}
func (m *mockAdminRepo) GetNannyByID(context.Context, uuid.UUID) (repository.NannyRecord, error) {
	return m.nanny, nil
}
func (m *mockAdminRepo) UpdateScreeningSteps(context.Context, uuid.UUID, repository.UpdateScreeningStepsParams) (repository.NannyRecord, error) {
	m.stepsUpdated = true
	return m.updatedNanny, nil
}
func (m *mockAdminRepo) UpdateNannyVerificationStatus(context.Context, uuid.UUID, models.VerificationStatus) (repository.NannyRecord, error) {
	return m.updatedNanny, nil
}
func (m *mockAdminRepo) UpdateNannyVerificationStatusWithAction(context.Context, repository.AdminNannyActionParams) (repository.NannyRecord, error) {
	m.statusActionUpdated = true
	return m.updatedNanny, nil
}
func (m *mockAdminRepo) ResetNannyScreening(context.Context, uuid.UUID) (repository.NannyRecord, error) {
	return m.updatedNanny, nil
}
func (m *mockAdminRepo) ResetNannyScreeningWithAction(context.Context, repository.AdminNannyActionParams) (repository.NannyRecord, error) {
	return m.updatedNanny, nil
}
func (m *mockAdminRepo) SuspendNannyAccount(context.Context, repository.AdminAccountActionParams) (repository.NannyRecord, error) {
	return m.updatedNanny, nil
}
func (m *mockAdminRepo) ReactivateNannyAccount(context.Context, repository.AdminAccountActionParams) (repository.NannyRecord, error) {
	return m.updatedNanny, nil
}
func (m *mockAdminRepo) ListNannyActions(context.Context, uuid.UUID, int, int) ([]repository.AdminAuditActionRecord, int, error) {
	return nil, 0, nil
}
func (m *mockAdminRepo) ListNannyBookingHistory(context.Context, uuid.UUID, repository.ListBookingsFilter) ([]repository.BookingRecord, int, error) {
	return nil, 0, nil
}
func (m *mockAdminRepo) GetNannyBookingSummary(context.Context, uuid.UUID) (repository.NannyBookingSummary, error) {
	return repository.NannyBookingSummary{}, nil
}
func (m *mockAdminRepo) ListParents(context.Context, repository.ListParentsFilter) ([]repository.ParentRecord, int, error) {
	return nil, 0, nil
}
func (m *mockAdminRepo) GetParentByID(context.Context, uuid.UUID) (repository.ParentRecord, error) {
	return repository.ParentRecord{}, nil
}
func (m *mockAdminRepo) SuspendParentAccount(context.Context, repository.AdminAccountActionParams) (repository.ParentRecord, error) {
	return repository.ParentRecord{}, nil
}
func (m *mockAdminRepo) ReactivateParentAccount(context.Context, repository.AdminAccountActionParams) (repository.ParentRecord, error) {
	return repository.ParentRecord{}, nil
}
func (m *mockAdminRepo) ListParentActions(context.Context, uuid.UUID, int, int) ([]repository.AdminAuditActionRecord, int, error) {
	return nil, 0, nil
}
func (m *mockAdminRepo) ListParentBookingHistory(context.Context, uuid.UUID, repository.ListBookingsFilter) ([]repository.BookingRecord, int, error) {
	return nil, 0, nil
}
func (m *mockAdminRepo) ListBookings(context.Context, repository.ListBookingsFilter) ([]repository.BookingRecord, int, error) {
	return nil, 0, nil
}
func (m *mockAdminRepo) GetBookingByID(context.Context, uuid.UUID) (repository.BookingRecord, error) {
	return repository.BookingRecord{}, nil
}
func (m *mockAdminRepo) CancelBooking(context.Context, repository.AdminBookingActionParams) (repository.BookingRecord, error) {
	return repository.BookingRecord{}, nil
}
func (m *mockAdminRepo) CompleteBooking(context.Context, repository.AdminBookingActionParams) (repository.BookingRecord, error) {
	return repository.BookingRecord{}, nil
}
func (m *mockAdminRepo) ListBookingActions(context.Context, uuid.UUID, int, int) ([]repository.AdminBookingActionRecord, int, error) {
	return nil, 0, nil
}
func (m *mockAdminRepo) ListConversations(context.Context, repository.ListConversationsFilter) ([]repository.ConversationRecord, int, error) {
	return nil, 0, nil
}
func (m *mockAdminRepo) GetConversationByID(context.Context, uuid.UUID) (repository.ConversationRecord, error) {
	return repository.ConversationRecord{}, nil
}
func (m *mockAdminRepo) ListConversationMessages(context.Context, uuid.UUID, int, int) ([]repository.MessageRecord, int, error) {
	return nil, 0, nil
}
func (m *mockAdminRepo) LockConversation(context.Context, repository.AdminConversationActionParams) (repository.ConversationRecord, error) {
	return repository.ConversationRecord{}, nil
}
func (m *mockAdminRepo) UnlockConversation(context.Context, repository.AdminConversationActionParams) (repository.ConversationRecord, error) {
	return repository.ConversationRecord{}, nil
}
func (m *mockAdminRepo) HideMessage(context.Context, repository.AdminConversationActionParams) (repository.MessageRecord, error) {
	return repository.MessageRecord{}, nil
}
func (m *mockAdminRepo) ListConversationActions(context.Context, uuid.UUID, int, int) ([]repository.AdminAuditActionRecord, int, error) {
	return nil, 0, nil
}
func (m *mockAdminRepo) ListAdmins(context.Context, int, int) ([]repository.AdminUserRecord, int, error) {
	return nil, 0, nil
}
func (m *mockAdminRepo) CreateAdminInvite(_ context.Context, params repository.InviteAdminParams) (models.AdminInvite, error) {
	m.createInviteParams = params
	return m.invite, nil
}
func (m *mockAdminRepo) AcceptAdminInvite(context.Context, repository.AcceptAdminInviteParams) (repository.AdminUserRecord, error) {
	return repository.AdminUserRecord{}, nil
}
func (m *mockAdminRepo) DisableAdmin(context.Context, uuid.UUID) (repository.AdminUserRecord, error) {
	return repository.AdminUserRecord{}, nil
}
func (m *mockAdminRepo) GetAdminByID(context.Context, uuid.UUID) (repository.AdminUserRecord, error) {
	return repository.AdminUserRecord{}, nil
}
func (m *mockAdminRepo) ReactivateAdmin(context.Context, repository.AdminUserAccountActionParams) (repository.AdminUserRecord, error) {
	return repository.AdminUserRecord{}, nil
}
func (m *mockAdminRepo) GetAnalyticsSummary(context.Context, repository.AnalyticsRangeFilter) (repository.AnalyticsSummary, error) {
	return repository.AnalyticsSummary{}, nil
}

func adminNanny(status models.VerificationStatus, complete bool) repository.NannyRecord {
	now := time.Now()
	return repository.NannyRecord{
		NannyProfile: models.NannyProfile{
			ID:                 uuid.New(),
			UserID:             uuid.New(),
			DisplayName:        "Test Nanny",
			ServiceType:        models.NannyServiceType,
			Currency:           models.CAD,
			VerificationStatus: status,
			CreatedAt:          now,
			UpdatedAt:          now,
		},
		DocsReviewed:      complete,
		ReferencesChecked: complete,
		InterviewDone:     complete,
	}
}

func TestAdminVerifyNannyRequiresCompletedScreening(t *testing.T) {
	nanny := adminNanny(models.UnderReviewVerificationStatus, false)
	pipe := NewAdminPipe(&mockAdminRepo{nanny: nanny, updatedNanny: nanny}, 0.10)

	res := pipe.VerifyNanny(context.Background(), uuid.New(), nanny.ID)
	if res.Success || string(res.Message) != messages.Admin_Nanny_Action_Blocked {
		t.Fatalf("expected blocked verification, got success=%v message=%s", res.Success, res.Message)
	}
}

func TestAdminVerifyNannySucceedsWhenScreeningComplete(t *testing.T) {
	nanny := adminNanny(models.UnderReviewVerificationStatus, true)
	updated := nanny
	updated.VerificationStatus = models.VerifiedVerificationStatus
	pipe := NewAdminPipe(&mockAdminRepo{nanny: nanny, updatedNanny: updated}, 0.10)

	res := pipe.VerifyNanny(context.Background(), uuid.New(), nanny.ID)
	if !res.Success || string(res.Message) != messages.Admin_Nanny_Verified {
		t.Fatalf("expected verification success, got success=%v message=%s", res.Success, res.Message)
	}
}

func TestAdminUpdateScreeningStepsRequiresStartedScreening(t *testing.T) {
	nanny := adminNanny(models.PendingVerificationStatus, false)
	repo := &mockAdminRepo{nanny: nanny, updatedNanny: nanny}
	pipe := NewAdminPipe(repo, 0.10)
	checked := true

	res := pipe.UpdateScreeningSteps(context.Background(), nanny.ID, dtos.UpdateScreeningStepsDTO{DocsReviewed: &checked})
	if res.Success || string(res.Message) != messages.Admin_Screening_Not_Started {
		t.Fatalf("expected screening not started, got success=%v message=%s", res.Success, res.Message)
	}
	if repo.stepsUpdated {
		t.Fatal("expected pending screening step update to be blocked before repository mutation")
	}
}

func TestAdminStartScreeningIsOnlyPendingToUnderReviewTransition(t *testing.T) {
	nanny := adminNanny(models.PendingVerificationStatus, false)
	updated := nanny
	updated.VerificationStatus = models.UnderReviewVerificationStatus
	repo := &mockAdminRepo{nanny: nanny, updatedNanny: updated}
	pipe := NewAdminPipe(repo, 0.10)

	res := pipe.StartScreening(context.Background(), uuid.New(), nanny.ID)
	if !res.Success || string(res.Message) != messages.Admin_Screening_Started {
		t.Fatalf("expected screening start success, got success=%v message=%s", res.Success, res.Message)
	}
	if !repo.statusActionUpdated {
		t.Fatal("expected explicit start screening action to be audited")
	}
}

func TestAdminStartScreeningBlocksAlreadyStartedScreening(t *testing.T) {
	nanny := adminNanny(models.UnderReviewVerificationStatus, false)
	repo := &mockAdminRepo{nanny: nanny, updatedNanny: nanny}
	pipe := NewAdminPipe(repo, 0.10)

	res := pipe.StartScreening(context.Background(), uuid.New(), nanny.ID)
	if res.Success || string(res.Message) != messages.Admin_Nanny_Action_Blocked {
		t.Fatalf("expected duplicate start to be blocked, got success=%v message=%s", res.Success, res.Message)
	}
	if repo.statusActionUpdated {
		t.Fatal("expected duplicate screening start to avoid audit mutation")
	}
}

func TestAdminRejectAndResetRequireReason(t *testing.T) {
	nanny := adminNanny(models.UnderReviewVerificationStatus, true)
	pipe := NewAdminPipe(&mockAdminRepo{nanny: nanny, updatedNanny: nanny}, 0.10)

	rejectRes := pipe.RejectNanny(context.Background(), uuid.New(), nanny.ID, dtos.AdminNannyActionDTO{})
	if rejectRes.Success || string(rejectRes.Message) != messages.Invalid_Admin_Request {
		t.Fatalf("expected reject reason validation, got success=%v message=%s", rejectRes.Success, rejectRes.Message)
	}

	rejected := adminNanny(models.RejectedVerificationStatus, false)
	resetPipe := NewAdminPipe(&mockAdminRepo{nanny: rejected, updatedNanny: rejected}, 0.10)
	resetRes := resetPipe.ResetScreening(context.Background(), uuid.New(), rejected.ID, dtos.AdminNannyActionDTO{})
	if resetRes.Success || string(resetRes.Message) != messages.Invalid_Admin_Request {
		t.Fatalf("expected reset reason validation, got success=%v message=%s", resetRes.Success, resetRes.Message)
	}
}
