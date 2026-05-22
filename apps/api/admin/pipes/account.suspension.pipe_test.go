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

func TestAdminReactivateNannyRequiresReason(t *testing.T) {
	nanny := adminNanny(models.VerifiedVerificationStatus, true)
	nanny.UserIsActive = false
	pipe := NewAdminPipe(&mockAdminRepo{nanny: nanny, updatedNanny: nanny}, 0.10)

	res := pipe.ReactivateNanny(context.Background(), uuid.New(), nanny.ID, dtos.AdminAccountActionDTO{})
	if res.Success || string(res.Message) != messages.Invalid_Admin_Request {
		t.Fatalf("expected required reason validation, got success=%v message=%s", res.Success, res.Message)
	}
}

func TestAdminReactivateNannyBlocksActiveAccount(t *testing.T) {
	nanny := adminNanny(models.VerifiedVerificationStatus, true)
	nanny.UserIsActive = true
	pipe := NewAdminPipe(&mockAdminRepo{nanny: nanny, updatedNanny: nanny}, 0.10)

	res := pipe.ReactivateNanny(context.Background(), uuid.New(), nanny.ID, dtos.AdminAccountActionDTO{Reason: "reviewed appeal"})
	if res.Success || string(res.Message) != messages.Admin_Account_Action_Blocked {
		t.Fatalf("expected active account block, got success=%v message=%s", res.Success, res.Message)
	}
}

func TestAdminReactivateNannySucceedsForSuspendedAccount(t *testing.T) {
	nanny := adminNanny(models.VerifiedVerificationStatus, true)
	nanny.UserIsActive = false
	updated := nanny
	updated.UserIsActive = true
	pipe := NewAdminPipe(&mockAdminRepo{nanny: nanny, updatedNanny: updated}, 0.10)

	res := pipe.ReactivateNanny(context.Background(), uuid.New(), nanny.ID, dtos.AdminAccountActionDTO{Reason: "appeal accepted"})
	if !res.Success || string(res.Message) != messages.Admin_Nanny_Reactivated {
		t.Fatalf("expected reactivation success, got success=%v message=%s", res.Success, res.Message)
	}
	if res.Data == nil || !res.Data.UserIsActive {
		t.Fatal("expected active nanny data")
	}
}

type adminReactivateRepo struct {
	mockAdminRepo
	admin repository.AdminUserRecord
}

func (m *adminReactivateRepo) GetAdminByID(context.Context, uuid.UUID) (repository.AdminUserRecord, error) {
	return m.admin, nil
}

func (m *adminReactivateRepo) ReactivateAdmin(context.Context, repository.AdminUserAccountActionParams) (repository.AdminUserRecord, error) {
	updated := m.admin
	updated.IsActive = true
	return updated, nil
}

func TestAdminReactivateAdminRequiresInactiveTarget(t *testing.T) {
	record := repository.AdminUserRecord{User: models.User{
		ID:        uuid.New(),
		Firstname: "Ada",
		Lastname:  "Admin",
		Email:     "ada@example.com",
		Role:      models.AdminUserRole,
		IsActive:  true,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}}
	pipe := NewAdminPipe(&adminReactivateRepo{admin: record}, 0.10)

	res := pipe.ReactivateAdmin(context.Background(), uuid.New(), record.ID, dtos.AdminAccountActionDTO{Reason: "restore access"})
	if res.Success || string(res.Message) != messages.Admin_Account_Action_Blocked {
		t.Fatalf("expected active admin block, got success=%v message=%s", res.Success, res.Message)
	}
}
