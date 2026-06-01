package pipes

import (
	"context"
	"fmt"
	"net/url"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/auth/dtos"
	"github.com/kinsittr/kinsittr-api/auth/messages"
	"github.com/kinsittr/kinsittr-api/auth/services"
	"github.com/kinsittr/kinsittr-api/models"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

const recoveryTokenTTL = 30 * time.Minute
const maxRecoveryRequestsPerHour = 3
const maxRecoveryIPRequestsPerWindow = 5
const maxRecoveryTokenAttemptsPerWindow = 10
const recoveryIPRateLimitWindow = 15 * time.Minute
const recoveryTokenRateLimitWindow = 15 * time.Minute

type RecoveryVerifyData struct {
	Valid bool `json:"valid"`
}

func (p *AuthPipe) RequestRecovery(ctx context.Context, dto dtos.RecoveryRequestDTO, requestIP string) *shared.PipeRes[any] {
	email := strings.ToLower(strings.TrimSpace(dto.Email))
	requestIP = strings.TrimSpace(requestIP)
	generic := pipeSuccess[any](messages.Recovery_Request_Accepted, nil)

	if !p.allowRecoveryRate(ctx, "request:ip:"+requestIP, maxRecoveryIPRequestsPerWindow, recoveryIPRateLimitWindow) {
		return generic
	}
	if !p.allowRecoveryRate(ctx, "request:email:"+email, maxRecoveryRequestsPerHour, time.Hour) {
		return generic
	}

	user, err := p.repo.GetUserByEmail(ctx, email)
	if err != nil || user.ID == uuid.Nil || !user.IsActive || user.Role == models.AdminUserRole {
		return generic
	}

	count, err := p.repo.CountPasswordRecoveryTokensSince(ctx, user.ID, time.Now().Add(-time.Hour))
	if err != nil {
		return generic
	}
	if count >= maxRecoveryRequestsPerHour {
		return generic
	}

	token, err := services.GenerateRecoveryToken()
	if err != nil {
		return generic
	}
	tokenHash := services.HashRecoveryToken(token)

	if err := p.repo.ExpirePasswordRecoveryTokensByUserID(ctx, user.ID); err != nil {
		return generic
	}
	if err := p.repo.CreatePasswordRecoveryToken(ctx, models.PasswordRecoveryToken{
		ID:        uuid.New(),
		UserID:    user.ID,
		TokenHash: tokenHash,
		RequestIP: requestIP,
		ExpiresAt: time.Now().Add(recoveryTokenTTL),
	}); err != nil {
		return generic
	}

	if p.emailService != nil {
		if err := p.emailService.SendPasswordRecovery(ctx, user.Email, user.Firstname, p.recoveryLink(token)); err != nil {
			return generic
		}
	}

	return generic
}

func (p *AuthPipe) VerifyRecovery(ctx context.Context, dto dtos.RecoveryVerifyDTO, requestIP string) *shared.PipeRes[RecoveryVerifyData] {
	if !p.allowRecoveryRate(ctx, "verify:ip:"+strings.TrimSpace(requestIP), maxRecoveryTokenAttemptsPerWindow, recoveryTokenRateLimitWindow) {
		return &shared.PipeRes[RecoveryVerifyData]{
			Success: false,
			Message: shared.CreatePipeMessage(messages.Invalid_Recovery_Token),
		}
	}

	token, err := p.validRecoveryToken(ctx, dto.Token)
	if err != nil || token.ID == uuid.Nil {
		return &shared.PipeRes[RecoveryVerifyData]{
			Success: false,
			Message: shared.CreatePipeMessage(messages.Invalid_Recovery_Token),
		}
	}

	return pipeSuccess(messages.Recovery_Token_Verified, &RecoveryVerifyData{Valid: true})
}

func (p *AuthPipe) ResetRecoveryPassword(ctx context.Context, dto dtos.RecoveryResetDTO, requestIP string) *shared.PipeRes[any] {
	if !p.allowRecoveryRate(ctx, "reset:ip:"+strings.TrimSpace(requestIP), maxRecoveryTokenAttemptsPerWindow, recoveryTokenRateLimitWindow) {
		return pipeError[any](messages.Invalid_Recovery_Token)
	}

	token, err := p.validRecoveryToken(ctx, dto.Token)
	if err != nil || token.ID == uuid.Nil {
		return pipeError[any](messages.Invalid_Recovery_Token)
	}

	passwordHash, err := services.HashPassword(dto.NewPassword)
	if err != nil {
		return pipeError[any](messages.Invalid_Account_Request)
	}
	if err := p.repo.ResetUserPasswordWithRecoveryToken(ctx, token.ID, token.UserID, passwordHash); err != nil {
		return pipeError[any](messages.Invalid_Recovery_Token)
	}

	return pipeSuccess[any](messages.Password_Reset, nil)
}

func (p *AuthPipe) allowRecoveryRate(ctx context.Context, suffix string, max int, window time.Duration) bool {
	key := "auth:recovery:" + suffix
	allowed, err := p.repo.AllowAuthRateLimit(ctx, key, max, window)
	return err == nil && allowed
}

func (p *AuthPipe) validRecoveryToken(ctx context.Context, rawToken string) (models.PasswordRecoveryToken, error) {
	tokenValue := strings.TrimSpace(rawToken)
	if tokenValue == "" {
		return models.PasswordRecoveryToken{}, fmt.Errorf("empty token")
	}
	token, err := p.repo.GetPasswordRecoveryTokenByHash(ctx, services.HashRecoveryToken(tokenValue))
	if err != nil || token.ID == uuid.Nil {
		return models.PasswordRecoveryToken{}, err
	}
	if token.UsedAt != nil || time.Now().After(token.ExpiresAt) {
		return models.PasswordRecoveryToken{}, fmt.Errorf("token expired or used")
	}
	user, err := p.repo.GetUserByID(ctx, token.UserID)
	if err != nil || user.ID == uuid.Nil || !user.IsActive || user.Role == models.AdminUserRole {
		return models.PasswordRecoveryToken{}, fmt.Errorf("invalid token user")
	}
	return token, nil
}

func (p *AuthPipe) recoveryLink(token string) string {
	if p.webOrigin == "" {
		return token
	}
	return p.webOrigin + "/auth/reset-password?token=" + url.QueryEscape(token)
}
