package pipes

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/models"
	"github.com/kinsittr/kinsittr-api/repositories/account"
	shared "github.com/kinsittr/kinsittr-api/shared"
	"github.com/kinsittr/kinsittr-api/shared/token"
)

type AdminAuthTokenPair struct {
	AccessToken  string      `json:"access_token"`
	RefreshToken string      `json:"refresh_token"`
	User         models.User `json:"user"`
}

type AdminSessionData struct {
	User models.User `json:"user"`
}

type AdminAuthPipe struct {
	repo             account.AccountRepository
	jwtSecret        string
	jwtRefreshSecret string
}

func NewAdminAuthPipe(repo account.AccountRepository, jwtSecret, jwtRefreshSecret string) *AdminAuthPipe {
	return &AdminAuthPipe{
		repo:             repo,
		jwtSecret:        jwtSecret,
		jwtRefreshSecret: jwtRefreshSecret,
	}
}

func (p *AdminAuthPipe) generateTokenPair(ctx context.Context, userID uuid.UUID, role models.UserRole) (string, string, error) {
	access, err := token.GenerateAccessToken(userID, role, p.jwtSecret)
	if err != nil {
		return "", "", err
	}
	sessionID := uuid.New()
	refresh, err := token.GenerateRefreshToken(userID, role, sessionID, p.jwtRefreshSecret)
	if err != nil {
		return "", "", err
	}
	if err := p.repo.CreateRefreshSession(ctx, models.RefreshSession{
		ID:        sessionID,
		UserID:    userID,
		ExpiresAt: time.Now().Add(token.RefreshTokenDuration),
	}); err != nil {
		return "", "", err
	}
	return access, refresh, nil
}

func pipeError[T any](message string) *shared.PipeRes[T] {
	return &shared.PipeRes[T]{
		Success: false,
		Message: shared.CreatePipeMessage(message),
	}
}

func pipeSuccess[T any](message string, data *T) *shared.PipeRes[T] {
	return &shared.PipeRes[T]{
		Success: true,
		Message: shared.CreatePipeMessage(message),
		Data:    data,
	}
}
