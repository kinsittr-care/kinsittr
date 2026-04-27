package pipes

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/auth/dtos"
	"github.com/kinsittr/kinsittr-api/auth/messages"
	"github.com/kinsittr/kinsittr-api/models"
	shared "github.com/kinsittr/kinsittr-api/shared"
	"github.com/kinsittr/kinsittr-api/shared/token"
)

func (p *AuthPipe) Refresh(ctx context.Context, dto dtos.RefreshDTO) *shared.PipeRes[AuthTokenPair] {
	claims, err := token.ValidateToken(dto.RefreshToken, p.jwtRefreshSecret)
	if err != nil {
		return &shared.PipeRes[AuthTokenPair]{
			Success: false,
			Message: shared.CreatePipeMessage(messages.Invalid_Or_Expired_Token),
		}
	}

	if claims.SessionID == uuid.Nil {
		return pipeError[AuthTokenPair](messages.Invalid_Or_Expired_Token)
	}

	session, err := p.repo.GetRefreshSessionByID(ctx, claims.SessionID)
	if err != nil || session.ID == uuid.Nil || session.UserID != claims.UserID || session.ExpiresAt.Before(time.Now()) {
		return pipeError[AuthTokenPair](messages.Invalid_Or_Expired_Token)
	}

	user, err := p.repo.GetUserByID(ctx, claims.UserID)
	if err != nil || user.ID == uuid.Nil || !user.IsActive {
		return pipeError[AuthTokenPair](messages.Invalid_Or_Expired_Token)
	}

	access, err := token.GenerateAccessToken(user.ID, user.Role, p.jwtSecret)
	if err != nil {
		return pipeError[AuthTokenPair](messages.Invalid_Or_Expired_Token)
	}

	newSession := models.RefreshSession{
		ID:        uuid.New(),
		UserID:    user.ID,
		ExpiresAt: time.Now().Add(token.RefreshTokenDuration),
	}
	refresh, err := token.GenerateRefreshToken(user.ID, user.Role, newSession.ID, p.jwtRefreshSecret)
	if err != nil {
		return pipeError[AuthTokenPair](messages.Invalid_Or_Expired_Token)
	}
	if err := p.repo.RotateRefreshSession(ctx, claims.SessionID, newSession); err != nil {
		return pipeError[AuthTokenPair](messages.Invalid_Or_Expired_Token)
	}
	return &shared.PipeRes[AuthTokenPair]{
		Success: true,
		Message: shared.CreatePipeMessage(messages.Token_Refreshed_Successfully),
		Data:    &AuthTokenPair{AccessToken: access, RefreshToken: refresh, User: user},
	}
}
