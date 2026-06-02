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

func (p *AdminPipe) UpdateScreeningSteps(ctx context.Context, nannyProfileID uuid.UUID, dto dtos.UpdateScreeningStepsDTO) *shared.PipeRes[AdminNannyData] {
	if dto.DocsReviewed == nil && dto.ReferencesChecked == nil && dto.InterviewDone == nil {
		return pipeError[AdminNannyData](messages.Invalid_Admin_Request)
	}
	current, err := p.repo.GetNannyByID(ctx, nannyProfileID)
	if err != nil {
		return pipeError[AdminNannyData](messages.Invalid_Admin_Request)
	}
	if current.ID == uuid.Nil {
		return notFoundNanny[AdminNannyData]()
	}
	if current.VerificationStatus == models.PendingVerificationStatus {
		return pipeError[AdminNannyData](messages.Admin_Screening_Not_Started)
	}
	if current.VerificationStatus != models.UnderReviewVerificationStatus {
		return pipeError[AdminNannyData](messages.Admin_Screening_Closed)
	}

	record, err := p.repo.UpdateScreeningSteps(ctx, nannyProfileID, repository.UpdateScreeningStepsParams{
		DocsReviewed:      dto.DocsReviewed,
		ReferencesChecked: dto.ReferencesChecked,
		InterviewDone:     dto.InterviewDone,
	})
	if err != nil {
		return pipeError[AdminNannyData](messages.Invalid_Admin_Request)
	}
	if record.ID == uuid.Nil {
		return notFoundNanny[AdminNannyData]()
	}
	data := toAdminNannyData(record)
	return pipeSuccess(messages.Admin_Screening_Updated, &data)
}

func (p *AdminPipe) StartScreening(ctx context.Context, adminUserID, nannyProfileID uuid.UUID) *shared.PipeRes[AdminNannyData] {
	action := string(models.AdminUnderReviewNannyAction)
	current, err := p.repo.GetNannyByID(ctx, nannyProfileID)
	if err != nil {
		logAdminActionResult(action, adminUserID, "nanny", nannyProfileID, "failed", err)
		return pipeError[AdminNannyData](messages.Invalid_Admin_Request)
	}
	if current.ID == uuid.Nil {
		logAdminActionResult(action, adminUserID, "nanny", nannyProfileID, "not_found", nil)
		return notFoundNanny[AdminNannyData]()
	}
	if current.VerificationStatus != models.PendingVerificationStatus {
		logAdminActionResult(action, adminUserID, "nanny", nannyProfileID, "blocked", nil)
		if !isScreeningEditable(current.VerificationStatus) {
			return pipeError[AdminNannyData](messages.Admin_Screening_Closed)
		}
		return pipeError[AdminNannyData](messages.Admin_Nanny_Action_Blocked)
	}

	record, err := p.repo.UpdateNannyVerificationStatusWithAction(ctx, repository.AdminNannyActionParams{
		NannyProfileID: nannyProfileID,
		AdminUserID:    adminUserID,
		Action:         models.AdminUnderReviewNannyAction,
		FromStatuses:   []string{string(models.PendingVerificationStatus)},
		ToStatus:       models.UnderReviewVerificationStatus,
	})
	if err != nil {
		logAdminActionResult(action, adminUserID, "nanny", nannyProfileID, "failed", err)
		return pipeError[AdminNannyData](messages.Invalid_Admin_Request)
	}
	if record.ID == uuid.Nil {
		logAdminActionResult(action, adminUserID, "nanny", nannyProfileID, "blocked", nil)
		return pipeError[AdminNannyData](messages.Admin_Nanny_Action_Blocked)
	}
	data := toAdminNannyData(record)
	logAdminActionResult(action, adminUserID, "nanny", nannyProfileID, "success", nil)
	return pipeSuccess(messages.Admin_Screening_Started, &data)
}

func (p *AdminPipe) ResetScreening(ctx context.Context, adminUserID, nannyProfileID uuid.UUID, dto dtos.AdminNannyActionDTO) *shared.PipeRes[AdminNannyData] {
	action := string(models.AdminResetNannyAction)
	reason := strings.TrimSpace(dto.Reason)
	if reason == "" || len(reason) > 500 {
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
	if current.VerificationStatus != models.RejectedVerificationStatus {
		logAdminActionResult(action, adminUserID, "nanny", nannyProfileID, "blocked", nil)
		return pipeError[AdminNannyData](messages.Invalid_Admin_Request)
	}

	record, err := p.repo.ResetNannyScreeningWithAction(ctx, repository.AdminNannyActionParams{
		NannyProfileID: nannyProfileID,
		AdminUserID:    adminUserID,
		Action:         models.AdminResetNannyAction,
		Reason:         reason,
		FromStatuses:   []string{string(models.RejectedVerificationStatus)},
		ToStatus:       models.PendingVerificationStatus,
	})
	if err != nil {
		logAdminActionResult(action, adminUserID, "nanny", nannyProfileID, "failed", err)
		return pipeError[AdminNannyData](messages.Invalid_Admin_Request)
	}
	if record.ID == uuid.Nil {
		logAdminActionResult(action, adminUserID, "nanny", nannyProfileID, "not_found", nil)
		return notFoundNanny[AdminNannyData]()
	}
	data := toAdminNannyData(record)
	logAdminActionResult(action, adminUserID, "nanny", nannyProfileID, "success", nil)
	return pipeSuccess(messages.Admin_Screening_Reset, &data)
}

func (p *AdminPipe) VerifyNanny(ctx context.Context, adminUserID, nannyProfileID uuid.UUID) *shared.PipeRes[AdminNannyData] {
	current, err := p.repo.GetNannyByID(ctx, nannyProfileID)
	if err != nil {
		logAdminActionResult(string(models.AdminVerifyNannyAction), adminUserID, "nanny", nannyProfileID, "failed", err)
		return pipeError[AdminNannyData](messages.Invalid_Admin_Request)
	}
	if current.ID == uuid.Nil {
		logAdminActionResult(string(models.AdminVerifyNannyAction), adminUserID, "nanny", nannyProfileID, "not_found", nil)
		return notFoundNanny[AdminNannyData]()
	}
	if current.VerificationStatus != models.UnderReviewVerificationStatus ||
		!current.DocsReviewed ||
		!current.ReferencesChecked ||
		!current.InterviewDone {
		logAdminActionResult(string(models.AdminVerifyNannyAction), adminUserID, "nanny", nannyProfileID, "blocked", nil)
		return pipeError[AdminNannyData](messages.Admin_Nanny_Action_Blocked)
	}
	return p.updateNannyStatus(ctx, adminUserID, nannyProfileID, models.VerifiedVerificationStatus, models.AdminVerifyNannyAction, "", []string{string(models.UnderReviewVerificationStatus)}, messages.Admin_Nanny_Verified)
}

func (p *AdminPipe) RejectNanny(ctx context.Context, adminUserID, nannyProfileID uuid.UUID, dto dtos.AdminNannyActionDTO) *shared.PipeRes[AdminNannyData] {
	reason := strings.TrimSpace(dto.Reason)
	if reason == "" || len(reason) > 500 {
		logAdminActionResult(string(models.AdminRejectNannyAction), adminUserID, "nanny", nannyProfileID, "invalid_request", nil)
		return pipeError[AdminNannyData](messages.Invalid_Admin_Request)
	}
	return p.updateNannyStatus(ctx, adminUserID, nannyProfileID, models.RejectedVerificationStatus, models.AdminRejectNannyAction, reason, []string{string(models.UnderReviewVerificationStatus)}, messages.Admin_Nanny_Rejected)
}

func (p *AdminPipe) updateNannyStatus(ctx context.Context, adminUserID, nannyProfileID uuid.UUID, status models.VerificationStatus, action models.AdminNannyActionType, reason string, from []string, message string) *shared.PipeRes[AdminNannyData] {
	record, err := p.repo.UpdateNannyVerificationStatusWithAction(ctx, repository.AdminNannyActionParams{
		NannyProfileID: nannyProfileID,
		AdminUserID:    adminUserID,
		Action:         action,
		Reason:         reason,
		FromStatuses:   from,
		ToStatus:       status,
	})
	if err != nil {
		logAdminActionResult(string(action), adminUserID, "nanny", nannyProfileID, "failed", err)
		return pipeError[AdminNannyData](messages.Invalid_Admin_Request)
	}
	if record.ID == uuid.Nil {
		logAdminActionResult(string(action), adminUserID, "nanny", nannyProfileID, "blocked", nil)
		return pipeError[AdminNannyData](messages.Admin_Nanny_Action_Blocked)
	}
	data := toAdminNannyData(record)
	logAdminActionResult(string(action), adminUserID, "nanny", nannyProfileID, "success", nil)
	return pipeSuccess(message, &data)
}

func isScreeningEditable(status models.VerificationStatus) bool {
	return status == models.PendingVerificationStatus || status == models.UnderReviewVerificationStatus
}
