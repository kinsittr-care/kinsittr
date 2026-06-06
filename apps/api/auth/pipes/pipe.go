package pipes

import (
	"context"
	"slices"
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
	ParentProfile *SessionParentProfile `json:"parent_profile,omitempty"`
	NannyProfile  *SessionNannyProfile  `json:"nanny_profile,omitempty"`
}

type SessionParentProfile struct {
	ID           string    `json:"id"`
	DisplayName  string    `json:"display_name"`
	Phone        string    `json:"phone"`
	NumChildren  int       `json:"num_children"`
	ChildrenAges []int     `json:"children_ages"`
	City         string    `json:"city"`
	Province     string    `json:"province"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type SessionNannyProfile struct {
	ID                 string                    `json:"id"`
	DisplayName        string                    `json:"display_name"`
	Phone              string                    `json:"phone"`
	Bio                string                    `json:"bio"`
	Specialties        []string                  `json:"specialties"`
	RatePerHour        float64                   `json:"rate_per_hour"`
	ServiceType        models.ServiceType        `json:"service_type"`
	Currency           models.Currency           `json:"currency"`
	VerificationStatus models.VerificationStatus `json:"verification_status"`
	VerifiedAt         string                    `json:"verified_at,omitempty"`
	StripeOnboarded    bool                      `json:"stripe_onboarded"`
	RatingAvg          float64                   `json:"rating_avg"`
	RatingCount        int                       `json:"rating_count"`
	AvatarURL          string                    `json:"avatar_url"`
	City               string                    `json:"city"`
	Province           string                    `json:"province"`
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

func sessionParentProfileData(profile models.ParentProfile) SessionParentProfile {
	return SessionParentProfile{
		ID:           profile.ID.String(),
		DisplayName:  profile.DisplayName,
		Phone:        profile.Phone,
		NumChildren:  profile.NumChildren,
		ChildrenAges: slices.Clone(profile.ChildrenAges),
		City:         profile.City,
		Province:     profile.Province,
		CreatedAt:    profile.CreatedAt,
		UpdatedAt:    profile.UpdatedAt,
	}
}

func sessionNannyProfileData(profile models.NannyProfile) SessionNannyProfile {
	return SessionNannyProfile{
		ID:                 profile.ID.String(),
		DisplayName:        profile.DisplayName,
		Phone:              profile.Phone,
		Bio:                profile.Bio,
		Specialties:        slices.Clone(profile.Specialties),
		RatePerHour:        profile.RatePerHour,
		ServiceType:        profile.ServiceType,
		Currency:           profile.Currency,
		VerificationStatus: profile.VerificationStatus,
		VerifiedAt:         formatOptionalSessionTime(profile.VerifiedAt),
		StripeOnboarded:    profile.StripeOnboarded,
		RatingAvg:          profile.RatingAvg,
		RatingCount:        profile.RatingCount,
		AvatarURL:          profile.AvatarURL,
		City:               profile.City,
		Province:           profile.Province,
	}
}

func formatOptionalSessionTime(value *time.Time) string {
	if value == nil || value.IsZero() {
		return ""
	}
	return value.UTC().Format(time.RFC3339)
}
