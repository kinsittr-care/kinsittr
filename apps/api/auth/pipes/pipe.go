package pipes

import (
	"context"
	"strings"
	"time"
	"unicode"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/auth/services"
	"github.com/kinsittr/kinsittr-api/models"
	"github.com/kinsittr/kinsittr-api/repositories/account"
	"github.com/kinsittr/kinsittr-api/repositories/profile"
	shared "github.com/kinsittr/kinsittr-api/shared"
	"github.com/kinsittr/kinsittr-api/shared/token"
)

type AuthTokenPair struct {
	AccessToken  string       `json:"access_token"`
	RefreshToken string       `json:"refresh_token"`
	User         *models.User `json:"user,omitempty"`
}

type CurrentSessionData struct {
	User          models.User           `json:"user"`
	ParentProfile *models.ParentProfile `json:"parent_profile,omitempty"`
	NannyProfile  *models.NannyProfile  `json:"nanny_profile,omitempty"`
}

type AuthPipe struct {
	repo             account.AccountRepository
	profileRepo      profile.ProfileRepository
	jwtSecret        string
	jwtRefreshSecret string
	emailService     *services.EmailService
	webOrigin        string
}

func NewAuthPipe(repo account.AccountRepository, profileRepo profile.ProfileRepository, jwtSecret, jwtRefreshSecret string) *AuthPipe {
	return &AuthPipe{
		repo:             repo,
		profileRepo:      profileRepo,
		jwtSecret:        jwtSecret,
		jwtRefreshSecret: jwtRefreshSecret,
	}
}

func (p *AuthPipe) SetRecoveryEmailService(emailService *services.EmailService, webOrigin string) {
	p.emailService = emailService
	p.webOrigin = strings.TrimRight(strings.TrimSpace(webOrigin), "/")
}

func (p *AuthPipe) generateTokenPair(ctx context.Context, userID uuid.UUID, role models.UserRole) (string, string, error) {
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

func defaultDisplayName(firstname, lastname string) string {
	firstname = strings.TrimSpace(firstname)
	lastname = strings.TrimSpace(lastname)
	if lastname == "" {
		return firstname
	}
	initial := []rune(lastname)[0]
	return firstname + " " + string(unicode.ToUpper(initial)) + "."
}
