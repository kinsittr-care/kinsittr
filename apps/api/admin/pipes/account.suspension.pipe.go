package pipes

import (
	"context"
	"strings"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/admin/dtos"
	"github.com/kinsittr/kinsittr-api/admin/messages"
	"github.com/kinsittr/kinsittr-api/models"
	repository "github.com/kinsittr/kinsittr-api/repositories/admin"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *AdminPipe) SuspendNanny(ctx context.Context, adminUserID, nannyProfileID uuid.UUID, dto dtos.AdminAccountActionDTO) *shared.PipeRes[AdminNannyData] {
	action := string(models.AdminSuspendAccountAction)
	reason, ok := validAccountActionReason(dto)
	if !ok {
		logAdminActionResult(action, adminUserID, "nanny", nannyProfileID, "invalid_request", nil)
		return pipeError[AdminNannyData](messages.Invalid_Admin_Request)
	}
	current, err := p.repo.GetNannyByID(ctx, nannyProfileID)
	if err != nil {
		logAdminActionResult(action, adminUserID, "nanny", nannyProfileID, "failed", err)
		return pipeError[AdminNannyData](messages.Invalid_Admin_Request)
	}
	if current.ID == uuid.Nil {
		logAdminActionResult(action, adminUserID, "nanny", nannyProfileID, "not_found", nil)
		return notFoundNanny[AdminNannyData]()
	}
	if !current.UserIsActive {
		logAdminActionResult(action, adminUserID, "nanny", nannyProfileID, "blocked", nil)
		return pipeError[AdminNannyData](messages.Admin_Account_Action_Blocked)
	}

	record, err := p.repo.SuspendNannyAccount(ctx, repository.AdminAccountActionParams{
		ProfileID:   nannyProfileID,
		AdminUserID: adminUserID,
		Reason:      reason,
	})
	if err != nil {
		logAdminActionResult(action, adminUserID, "nanny", nannyProfileID, "failed", err)
		return pipeError[AdminNannyData](messages.Invalid_Admin_Request)
	}
	if record.ID == uuid.Nil {
		logAdminActionResult(action, adminUserID, "nanny", nannyProfileID, "blocked", nil)
		return pipeError[AdminNannyData](messages.Admin_Account_Action_Blocked)
	}
	data := toAdminNannyData(record)
	logAdminActionResult(action, adminUserID, "nanny", nannyProfileID, "success", nil)
	return pipeSuccess(messages.Admin_Nanny_Suspended, &data)
}

func (p *AdminPipe) SuspendParent(ctx context.Context, adminUserID, parentProfileID uuid.UUID, dto dtos.AdminAccountActionDTO) *shared.PipeRes[AdminParentData] {
	action := string(models.AdminSuspendAccountAction)
	reason, ok := validAccountActionReason(dto)
	if !ok {
		logAdminActionResult(action, adminUserID, "parent", parentProfileID, "invalid_request", nil)
		return pipeError[AdminParentData](messages.Invalid_Admin_Request)
	}
	current, err := p.repo.GetParentByID(ctx, parentProfileID)
	if err != nil {
		logAdminActionResult(action, adminUserID, "parent", parentProfileID, "failed", err)
		return pipeError[AdminParentData](messages.Invalid_Admin_Request)
	}
	if current.ID == uuid.Nil {
		logAdminActionResult(action, adminUserID, "parent", parentProfileID, "not_found", nil)
		return notFoundParent[AdminParentData]()
	}
	if !current.UserIsActive {
		logAdminActionResult(action, adminUserID, "parent", parentProfileID, "blocked", nil)
		return pipeError[AdminParentData](messages.Admin_Account_Action_Blocked)
	}

	record, err := p.repo.SuspendParentAccount(ctx, repository.AdminAccountActionParams{
		ProfileID:   parentProfileID,
		AdminUserID: adminUserID,
		Reason:      reason,
	})
	if err != nil {
		logAdminActionResult(action, adminUserID, "parent", parentProfileID, "failed", err)
		return pipeError[AdminParentData](messages.Invalid_Admin_Request)
	}
	if record.ID == uuid.Nil {
		logAdminActionResult(action, adminUserID, "parent", parentProfileID, "blocked", nil)
		return pipeError[AdminParentData](messages.Admin_Account_Action_Blocked)
	}
	data := toAdminParentData(record)
	logAdminActionResult(action, adminUserID, "parent", parentProfileID, "success", nil)
	return pipeSuccess(messages.Admin_Parent_Suspended, &data)
}

func (p *AdminPipe) ReactivateNanny(ctx context.Context, adminUserID, nannyProfileID uuid.UUID, dto dtos.AdminAccountActionDTO) *shared.PipeRes[AdminNannyData] {
	action := string(models.AdminReactivateAccountAction)
	reason, ok := validAccountActionReason(dto)
	if !ok {
		logAdminActionResult(action, adminUserID, "nanny", nannyProfileID, "invalid_request", nil)
		return pipeError[AdminNannyData](messages.Invalid_Admin_Request)
	}
	current, err := p.repo.GetNannyByID(ctx, nannyProfileID)
	if err != nil {
		logAdminActionResult(action, adminUserID, "nanny", nannyProfileID, "failed", err)
		return pipeError[AdminNannyData](messages.Invalid_Admin_Request)
	}
	if current.ID == uuid.Nil {
		logAdminActionResult(action, adminUserID, "nanny", nannyProfileID, "not_found", nil)
		return notFoundNanny[AdminNannyData]()
	}
	if current.UserIsActive {
		logAdminActionResult(action, adminUserID, "nanny", nannyProfileID, "blocked", nil)
		return pipeError[AdminNannyData](messages.Admin_Account_Action_Blocked)
	}

	record, err := p.repo.ReactivateNannyAccount(ctx, repository.AdminAccountActionParams{
		ProfileID:   nannyProfileID,
		AdminUserID: adminUserID,
		Reason:      reason,
	})
	if err != nil {
		logAdminActionResult(action, adminUserID, "nanny", nannyProfileID, "failed", err)
		return pipeError[AdminNannyData](messages.Invalid_Admin_Request)
	}
	if record.ID == uuid.Nil {
		logAdminActionResult(action, adminUserID, "nanny", nannyProfileID, "blocked", nil)
		return pipeError[AdminNannyData](messages.Admin_Account_Action_Blocked)
	}
	data := toAdminNannyData(record)
	logAdminActionResult(action, adminUserID, "nanny", nannyProfileID, "success", nil)
	return pipeSuccess(messages.Admin_Nanny_Reactivated, &data)
}

func (p *AdminPipe) ReactivateParent(ctx context.Context, adminUserID, parentProfileID uuid.UUID, dto dtos.AdminAccountActionDTO) *shared.PipeRes[AdminParentData] {
	action := string(models.AdminReactivateAccountAction)
	reason, ok := validAccountActionReason(dto)
	if !ok {
		logAdminActionResult(action, adminUserID, "parent", parentProfileID, "invalid_request", nil)
		return pipeError[AdminParentData](messages.Invalid_Admin_Request)
	}
	current, err := p.repo.GetParentByID(ctx, parentProfileID)
	if err != nil {
		logAdminActionResult(action, adminUserID, "parent", parentProfileID, "failed", err)
		return pipeError[AdminParentData](messages.Invalid_Admin_Request)
	}
	if current.ID == uuid.Nil {
		logAdminActionResult(action, adminUserID, "parent", parentProfileID, "not_found", nil)
		return notFoundParent[AdminParentData]()
	}
	if current.UserIsActive {
		logAdminActionResult(action, adminUserID, "parent", parentProfileID, "blocked", nil)
		return pipeError[AdminParentData](messages.Admin_Account_Action_Blocked)
	}

	record, err := p.repo.ReactivateParentAccount(ctx, repository.AdminAccountActionParams{
		ProfileID:   parentProfileID,
		AdminUserID: adminUserID,
		Reason:      reason,
	})
	if err != nil {
		logAdminActionResult(action, adminUserID, "parent", parentProfileID, "failed", err)
		return pipeError[AdminParentData](messages.Invalid_Admin_Request)
	}
	if record.ID == uuid.Nil {
		logAdminActionResult(action, adminUserID, "parent", parentProfileID, "blocked", nil)
		return pipeError[AdminParentData](messages.Admin_Account_Action_Blocked)
	}
	data := toAdminParentData(record)
	logAdminActionResult(action, adminUserID, "parent", parentProfileID, "success", nil)
	return pipeSuccess(messages.Admin_Parent_Reactivated, &data)
}

func (p *AdminPipe) ReactivateAdmin(ctx context.Context, adminUserID, targetAdminID uuid.UUID, dto dtos.AdminAccountActionDTO) *shared.PipeRes[AdminUserData] {
	action := string(models.AdminReactivateAccountAction)
	reason, ok := validAccountActionReason(dto)
	if !ok || targetAdminID == uuid.Nil {
		logAdminActionResult(action, adminUserID, "admin", targetAdminID, "invalid_request", nil)
		return pipeError[AdminUserData](messages.Invalid_Admin_Request)
	}
	current, err := p.repo.GetAdminByID(ctx, targetAdminID)
	if err != nil {
		logAdminActionResult(action, adminUserID, "admin", targetAdminID, "failed", err)
		return pipeError[AdminUserData](messages.Invalid_Admin_Request)
	}
	if current.ID == uuid.Nil {
		logAdminActionResult(action, adminUserID, "admin", targetAdminID, "not_found", nil)
		return pipeError[AdminUserData](messages.Admin_User_Not_Found)
	}
	if current.IsActive {
		logAdminActionResult(action, adminUserID, "admin", targetAdminID, "blocked", nil)
		return pipeError[AdminUserData](messages.Admin_Account_Action_Blocked)
	}

	record, err := p.repo.ReactivateAdmin(ctx, repository.AdminUserAccountActionParams{
		TargetAdminID: targetAdminID,
		AdminUserID:   adminUserID,
		Reason:        reason,
	})
	if err != nil {
		logAdminActionResult(action, adminUserID, "admin", targetAdminID, "failed", err)
		return pipeError[AdminUserData](messages.Invalid_Admin_Request)
	}
	if record.ID == uuid.Nil {
		logAdminActionResult(action, adminUserID, "admin", targetAdminID, "blocked", nil)
		return pipeError[AdminUserData](messages.Admin_Account_Action_Blocked)
	}
	data := toAdminUserData(record)
	logAdminActionResult(action, adminUserID, "admin", targetAdminID, "success", nil)
	return pipeSuccess(messages.Admin_Admin_Reactivated, &data)
}

func validAccountActionReason(dto dtos.AdminAccountActionDTO) (string, bool) {
	reason := strings.TrimSpace(dto.Reason)
	return reason, reason != "" && len(reason) <= 500
}
