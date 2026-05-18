package pipes

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"strings"
	"time"

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

func (p *AdminPipe) InviteAdmin(ctx context.Context, invitedBy uuid.UUID, dto dtos.InviteAdminDTO) *shared.PipeRes[AdminInviteData] {
	firstname := strings.TrimSpace(dto.Firstname)
	lastname := strings.TrimSpace(dto.Lastname)
	email := strings.ToLower(strings.TrimSpace(dto.Email))
	if firstname == "" || lastname == "" || email == "" || !strings.Contains(email, "@") {
		return pipeError[AdminInviteData](messages.Invalid_Admin_Request)
	}

	token, err := generateAdminInviteToken()
	if err != nil {
		return pipeError[AdminInviteData](messages.Invalid_Admin_Request)
	}
	invite, err := p.repo.CreateAdminInvite(ctx, repository.InviteAdminParams{
		ID:        uuid.New(),
		Firstname: firstname,
		Lastname:  lastname,
		Email:     email,
		TokenHash: hashAdminInviteToken(token),
		InvitedBy: invitedBy,
		ExpiresAt: time.Now().UTC().Add(72 * time.Hour),
	})
	if err != nil {
		return pipeError[AdminInviteData](messages.Invalid_Admin_Request)
	}
	data := toAdminInviteData(invite, token)
	return pipeSuccess(messages.Admin_Admin_Invited, &data)
}

func (p *AdminPipe) AcceptAdminInvite(ctx context.Context, dto dtos.AcceptAdminInviteDTO) *shared.PipeRes[AdminUserData] {
	token := strings.TrimSpace(dto.Token)
	if token == "" || len(dto.Password) < 8 || len(dto.Password) > 72 {
		return pipeError[AdminUserData](messages.Invalid_Admin_Request)
	}
	passwordHash, err := authservices.HashPassword(dto.Password)
	if err != nil {
		return pipeError[AdminUserData](messages.Invalid_Admin_Request)
	}
	record, err := p.repo.AcceptAdminInvite(ctx, repository.AcceptAdminInviteParams{
		TokenHash:    hashAdminInviteToken(token),
		PasswordHash: passwordHash,
	})
	if err != nil || record.ID == uuid.Nil {
		return pipeError[AdminUserData](messages.Invalid_Admin_Request)
	}
	data := toAdminUserData(record)
	return pipeSuccess(messages.Admin_Admin_Invite_Accepted, &data)
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

func generateAdminInviteToken() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(bytes), nil
}

func hashAdminInviteToken(token string) string {
	sum := sha256.Sum256([]byte(token))
	return hex.EncodeToString(sum[:])
}
