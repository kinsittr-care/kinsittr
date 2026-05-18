package pipes

import (
	"context"
	"strings"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/admin/dtos"
	"github.com/kinsittr/kinsittr-api/admin/messages"
	authservices "github.com/kinsittr/kinsittr-api/auth/services"
	repository "github.com/kinsittr/kinsittr-api/repositories/admin"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *AdminPipe) ListAdmins(ctx context.Context, dto dtos.ListAdminMessagesQueryDTO) *shared.PipeRes[AdminUserListData] {
	page, limit := normalizePageLimit(dto.Page, dto.Limit)
	itemsRaw, total, err := p.repo.ListAdmins(ctx, page, limit)
	if err != nil {
		return pipeError[AdminUserListData](messages.Invalid_Admin_Request)
	}
	items := make([]AdminUserData, 0, len(itemsRaw))
	for _, item := range itemsRaw {
		items = append(items, toAdminUserData(item))
	}
	data := AdminUserListData{Items: items, Page: page, Limit: limit, Total: total}
	return pipeSuccess(messages.Admin_Admins_Listed, &data)
}

func (p *AdminPipe) InviteAdmin(ctx context.Context, dto dtos.InviteAdminDTO) *shared.PipeRes[AdminUserData] {
	firstname := strings.TrimSpace(dto.Firstname)
	lastname := strings.TrimSpace(dto.Lastname)
	email := strings.ToLower(strings.TrimSpace(dto.Email))
	if firstname == "" || lastname == "" || email == "" || len(dto.Password) < 8 || len(dto.Password) > 72 {
		return pipeError[AdminUserData](messages.Invalid_Admin_Request)
	}
	passwordHash, err := authservices.HashPassword(dto.Password)
	if err != nil {
		return pipeError[AdminUserData](messages.Invalid_Admin_Request)
	}

	record, err := p.repo.CreateAdmin(ctx, repository.InviteAdminParams{
		ID:           uuid.New(),
		Firstname:    firstname,
		Lastname:     lastname,
		Email:        email,
		PasswordHash: passwordHash,
	})
	if err != nil {
		return pipeError[AdminUserData](messages.Invalid_Admin_Request)
	}
	data := toAdminUserData(record)
	return pipeSuccess(messages.Admin_Admin_Invited, &data)
}

func (p *AdminPipe) DisableAdmin(ctx context.Context, currentAdminID, targetAdminID uuid.UUID) *shared.PipeRes[AdminUserData] {
	if targetAdminID == uuid.Nil || targetAdminID == currentAdminID {
		return pipeError[AdminUserData](messages.Invalid_Admin_Request)
	}
	record, err := p.repo.DisableAdmin(ctx, targetAdminID)
	if err != nil {
		return pipeError[AdminUserData](messages.Invalid_Admin_Request)
	}
	if record.ID == uuid.Nil {
		return pipeError[AdminUserData](messages.Admin_User_Not_Found)
	}
	data := toAdminUserData(record)
	return pipeSuccess(messages.Admin_Admin_Disabled, &data)
}
