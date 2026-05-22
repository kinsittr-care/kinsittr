package pipes

import (
	"context"
	"strings"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/admin/dtos"
	"github.com/kinsittr/kinsittr-api/admin/messages"
	repository "github.com/kinsittr/kinsittr-api/repositories/admin"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *AdminPipe) SuspendNanny(ctx context.Context, adminUserID, nannyProfileID uuid.UUID, dto dtos.AdminAccountActionDTO) *shared.PipeRes[AdminNannyData] {
	reason, ok := validAccountActionReason(dto)
	if !ok {
		return pipeError[AdminNannyData](messages.Invalid_Admin_Request)
	}
	current, err := p.repo.GetNannyByID(ctx, nannyProfileID)
	if err != nil {
		return pipeError[AdminNannyData](messages.Invalid_Admin_Request)
	}
	if current.ID == uuid.Nil {
		return notFoundNanny[AdminNannyData]()
	}
	if !current.UserIsActive {
		return pipeError[AdminNannyData](messages.Admin_Account_Action_Blocked)
	}

	record, err := p.repo.SuspendNannyAccount(ctx, repository.AdminAccountActionParams{
		ProfileID:   nannyProfileID,
		AdminUserID: adminUserID,
		Reason:      reason,
	})
	if err != nil {
		return pipeError[AdminNannyData](messages.Invalid_Admin_Request)
	}
	if record.ID == uuid.Nil {
		return pipeError[AdminNannyData](messages.Admin_Account_Action_Blocked)
	}
	data := toAdminNannyData(record)
	return pipeSuccess(messages.Admin_Nanny_Suspended, &data)
}

func (p *AdminPipe) SuspendParent(ctx context.Context, adminUserID, parentProfileID uuid.UUID, dto dtos.AdminAccountActionDTO) *shared.PipeRes[AdminParentData] {
	reason, ok := validAccountActionReason(dto)
	if !ok {
		return pipeError[AdminParentData](messages.Invalid_Admin_Request)
	}
	current, err := p.repo.GetParentByID(ctx, parentProfileID)
	if err != nil {
		return pipeError[AdminParentData](messages.Invalid_Admin_Request)
	}
	if current.ID == uuid.Nil {
		return notFoundParent[AdminParentData]()
	}
	if !current.UserIsActive {
		return pipeError[AdminParentData](messages.Admin_Account_Action_Blocked)
	}

	record, err := p.repo.SuspendParentAccount(ctx, repository.AdminAccountActionParams{
		ProfileID:   parentProfileID,
		AdminUserID: adminUserID,
		Reason:      reason,
	})
	if err != nil {
		return pipeError[AdminParentData](messages.Invalid_Admin_Request)
	}
	if record.ID == uuid.Nil {
		return pipeError[AdminParentData](messages.Admin_Account_Action_Blocked)
	}
	data := toAdminParentData(record)
	return pipeSuccess(messages.Admin_Parent_Suspended, &data)
}

func (p *AdminPipe) ReactivateNanny(ctx context.Context, adminUserID, nannyProfileID uuid.UUID, dto dtos.AdminAccountActionDTO) *shared.PipeRes[AdminNannyData] {
	reason, ok := validAccountActionReason(dto)
	if !ok {
		return pipeError[AdminNannyData](messages.Invalid_Admin_Request)
	}
	current, err := p.repo.GetNannyByID(ctx, nannyProfileID)
	if err != nil {
		return pipeError[AdminNannyData](messages.Invalid_Admin_Request)
	}
	if current.ID == uuid.Nil {
		return notFoundNanny[AdminNannyData]()
	}
	if current.UserIsActive {
		return pipeError[AdminNannyData](messages.Admin_Account_Action_Blocked)
	}

	record, err := p.repo.ReactivateNannyAccount(ctx, repository.AdminAccountActionParams{
		ProfileID:   nannyProfileID,
		AdminUserID: adminUserID,
		Reason:      reason,
	})
	if err != nil {
		return pipeError[AdminNannyData](messages.Invalid_Admin_Request)
	}
	if record.ID == uuid.Nil {
		return pipeError[AdminNannyData](messages.Admin_Account_Action_Blocked)
	}
	data := toAdminNannyData(record)
	return pipeSuccess(messages.Admin_Nanny_Reactivated, &data)
}

func (p *AdminPipe) ReactivateParent(ctx context.Context, adminUserID, parentProfileID uuid.UUID, dto dtos.AdminAccountActionDTO) *shared.PipeRes[AdminParentData] {
	reason, ok := validAccountActionReason(dto)
	if !ok {
		return pipeError[AdminParentData](messages.Invalid_Admin_Request)
	}
	current, err := p.repo.GetParentByID(ctx, parentProfileID)
	if err != nil {
		return pipeError[AdminParentData](messages.Invalid_Admin_Request)
	}
	if current.ID == uuid.Nil {
		return notFoundParent[AdminParentData]()
	}
	if current.UserIsActive {
		return pipeError[AdminParentData](messages.Admin_Account_Action_Blocked)
	}

	record, err := p.repo.ReactivateParentAccount(ctx, repository.AdminAccountActionParams{
		ProfileID:   parentProfileID,
		AdminUserID: adminUserID,
		Reason:      reason,
	})
	if err != nil {
		return pipeError[AdminParentData](messages.Invalid_Admin_Request)
	}
	if record.ID == uuid.Nil {
		return pipeError[AdminParentData](messages.Admin_Account_Action_Blocked)
	}
	data := toAdminParentData(record)
	return pipeSuccess(messages.Admin_Parent_Reactivated, &data)
}

func (p *AdminPipe) ReactivateAdmin(ctx context.Context, adminUserID, targetAdminID uuid.UUID, dto dtos.AdminAccountActionDTO) *shared.PipeRes[AdminUserData] {
	reason, ok := validAccountActionReason(dto)
	if !ok || targetAdminID == uuid.Nil {
		return pipeError[AdminUserData](messages.Invalid_Admin_Request)
	}
	current, err := p.repo.GetAdminByID(ctx, targetAdminID)
	if err != nil {
		return pipeError[AdminUserData](messages.Invalid_Admin_Request)
	}
	if current.ID == uuid.Nil {
		return pipeError[AdminUserData](messages.Admin_User_Not_Found)
	}
	if current.IsActive {
		return pipeError[AdminUserData](messages.Admin_Account_Action_Blocked)
	}

	record, err := p.repo.ReactivateAdmin(ctx, repository.AdminUserAccountActionParams{
		TargetAdminID: targetAdminID,
		AdminUserID:   adminUserID,
		Reason:        reason,
	})
	if err != nil {
		return pipeError[AdminUserData](messages.Invalid_Admin_Request)
	}
	if record.ID == uuid.Nil {
		return pipeError[AdminUserData](messages.Admin_Account_Action_Blocked)
	}
	data := toAdminUserData(record)
	return pipeSuccess(messages.Admin_Admin_Reactivated, &data)
}

func validAccountActionReason(dto dtos.AdminAccountActionDTO) (string, bool) {
	reason := strings.TrimSpace(dto.Reason)
	return reason, reason != "" && len(reason) <= 500
}
