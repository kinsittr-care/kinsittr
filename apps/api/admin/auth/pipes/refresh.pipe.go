package pipes

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/admin/auth/dtos"
	"github.com/kinsittr/kinsittr-api/admin/messages"
	"github.com/kinsittr/kinsittr-api/models"
	shared "github.com/kinsittr/kinsittr-api/shared"
	"github.com/kinsittr/kinsittr-api/shared/token"
)

func (p *AdminAuthPipe) Refresh(ctx context.Context, dto dtos.RefreshDTO) *shared.PipeRes[AdminAuthTokenPair] {
	claims, err := token.ValidateToken(dto.RefreshToken, p.jwtRefreshSecret)
	if err != nil || claims.SessionID == uuid.Nil || claims.Role != models.AdminUserRole {
		return pipeError[AdminAuthTokenPair](messages.Invalid_Admin_Session)
	}

	session, err := p.repo.GetRefreshSessionByID(ctx, claims.SessionID)
	if err != nil || session.ID == uuid.Nil || session.UserID != claims.UserID || session.ExpiresAt.Before(time.Now()) {
		return pipeError[AdminAuthTokenPair](messages.Invalid_Admin_Session)
	}

	user, err := p.repo.GetUserByID(ctx, claims.UserID)
	if err != nil || user.ID == uuid.Nil || user.Role != models.AdminUserRole || !user.IsActive {
		return pipeError[AdminAuthTokenPair](messages.Invalid_Admin_Session)
	}

	access, err := token.GenerateAccessToken(user.ID, user.Role, p.jwtSecret)
	if err != nil {
		return pipeError[AdminAuthTokenPair](messages.Invalid_Admin_Session)
	}

	newSession := models.RefreshSession{
		ID:        uuid.New(),
		UserID:    user.ID,
		ExpiresAt: time.Now().Add(token.RefreshTokenDuration),
	}
	refresh, err := token.GenerateRefreshToken(user.ID, user.Role, newSession.ID, p.jwtRefreshSecret)
	if err != nil {
		return pipeError[AdminAuthTokenPair](messages.Invalid_Admin_Session)
	}
	if err := p.repo.RotateRefreshSession(ctx, claims.SessionID, newSession); err != nil {
		return pipeError[AdminAuthTokenPair](messages.Invalid_Admin_Session)
	}

	return pipeSuccess(messages.Admin_Token_Refreshed, &AdminAuthTokenPair{
		AccessToken:  access,
		RefreshToken: refresh,
		User:         user,
	})
}

func (p *AdminAuthPipe) Logout(ctx context.Context, dto dtos.RefreshDTO) *shared.PipeRes[any] {
	claims, err := token.ValidateToken(dto.RefreshToken, p.jwtRefreshSecret)
	if err != nil || claims.SessionID == uuid.Nil || claims.Role != models.AdminUserRole {
		return pipeError[any](messages.Invalid_Admin_Session)
	}

	if err := p.repo.DeleteRefreshSession(ctx, claims.SessionID); err != nil {
		return pipeError[any](messages.Invalid_Admin_Session)
	}

	return pipeSuccess[any](messages.Admin_Logged_Out, nil)
}
