package pipes

import (
	"context"
	"errors"
	"strings"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/auth/dtos"
	"github.com/kinsittr/kinsittr-api/auth/messages"
	"github.com/kinsittr/kinsittr-api/auth/services"
	"github.com/kinsittr/kinsittr-api/models"
	accountrepo "github.com/kinsittr/kinsittr-api/repositories/account"
	"github.com/kinsittr/kinsittr-api/shared/mail"
	"github.com/kinsittr/kinsittr-api/shared/token"
)

const (
	testJWTSecret        = "unit-test-jwt-secret"
	testJWTRefreshSecret = "unit-test-jwt-refresh-secret"
)

type mockAccountRepo struct {
	userExistsByEmail bool
	userExistsErr     error
	userByEmail       models.User
	userByEmailErr    error
	userByID          models.User
	userByIDErr       error
	createParentUser  models.User
	createParentErr   error
	createNannyUser   models.User
	createNannyErr    error

	createRefreshSessionErr error
	getRefreshSession       models.RefreshSession
	getRefreshSessionErr    error
	rotateRefreshErr        error
	deleteRefreshErr        error
	deleteRefreshByUserErr  error
	updatePasswordErr       error
	deactivateUserErr       error
	recoveryToken           models.PasswordRecoveryToken
	recoveryTokenErr        error
	recoveryCount           int
	recoveryCountErr        error
	blockedRateLimitKeys    map[string]bool
	rateLimitErr            error
	createRecoveryErr       error
	expireRecoveryErr       error
	resetRecoveryErr        error

	createdRefreshSession models.RefreshSession
	createdParentProfile  models.ParentProfile
	createdNannyProfile   models.NannyProfile
	rotatedOldSessionID   uuid.UUID
	rotatedNewSession     models.RefreshSession
	deletedSessionID      uuid.UUID
	deletedRefreshUserID  uuid.UUID
	createdRecoveryToken  models.PasswordRecoveryToken
	resetRecoveryTokenID  uuid.UUID
	resetRecoveryUserID   uuid.UUID
	resetRecoveryPassword string
	rateLimitKeys         []string
}

func (m *mockAccountRepo) UserExistsByEmail(_ context.Context, _ string) (bool, error) {
	return m.userExistsByEmail, m.userExistsErr
}
func (m *mockAccountRepo) CreateUser(_ context.Context, user models.User) (models.User, error) {
	return user, nil
}
func (m *mockAccountRepo) GetUserByEmail(_ context.Context, _ string) (models.User, error) {
	return m.userByEmail, m.userByEmailErr
}
func (m *mockAccountRepo) GetUserByID(_ context.Context, _ uuid.UUID) (models.User, error) {
	return m.userByID, m.userByIDErr
}
func (m *mockAccountRepo) CreateParentAccount(_ context.Context, user models.User, profile models.ParentProfile) (models.User, error) {
	m.createdParentProfile = profile
	if m.createParentUser.ID != uuid.Nil {
		return m.createParentUser, m.createParentErr
	}
	return user, m.createParentErr
}
func (m *mockAccountRepo) CreateNannyAccount(_ context.Context, user models.User, profile models.NannyProfile) (models.User, error) {
	m.createdNannyProfile = profile
	if m.createNannyUser.ID != uuid.Nil {
		return m.createNannyUser, m.createNannyErr
	}
	return user, m.createNannyErr
}
func (m *mockAccountRepo) CreateRefreshSession(_ context.Context, session models.RefreshSession) error {
	m.createdRefreshSession = session
	return m.createRefreshSessionErr
}
func (m *mockAccountRepo) GetRefreshSessionByID(_ context.Context, _ uuid.UUID) (models.RefreshSession, error) {
	return m.getRefreshSession, m.getRefreshSessionErr
}
func (m *mockAccountRepo) RotateRefreshSession(_ context.Context, oldSessionID uuid.UUID, newSession models.RefreshSession) error {
	m.rotatedOldSessionID = oldSessionID
	m.rotatedNewSession = newSession
	return m.rotateRefreshErr
}
func (m *mockAccountRepo) DeleteRefreshSession(_ context.Context, sessionID uuid.UUID) error {
	m.deletedSessionID = sessionID
	return m.deleteRefreshErr
}
func (m *mockAccountRepo) DeleteRefreshSessionsByUserID(_ context.Context, userID uuid.UUID) error {
	m.deletedRefreshUserID = userID
	return m.deleteRefreshByUserErr
}
func (m *mockAccountRepo) UpdateUserPassword(_ context.Context, _ uuid.UUID, _ string) error {
	return m.updatePasswordErr
}
func (m *mockAccountRepo) DeactivateUser(_ context.Context, _ uuid.UUID) error {
	return m.deactivateUserErr
}
func (m *mockAccountRepo) CreatePasswordRecoveryToken(_ context.Context, token models.PasswordRecoveryToken) error {
	m.createdRecoveryToken = token
	return m.createRecoveryErr
}
func (m *mockAccountRepo) GetPasswordRecoveryTokenByHash(_ context.Context, _ string) (models.PasswordRecoveryToken, error) {
	return m.recoveryToken, m.recoveryTokenErr
}
func (m *mockAccountRepo) CountPasswordRecoveryTokensSince(_ context.Context, _ uuid.UUID, _ time.Time) (int, error) {
	return m.recoveryCount, m.recoveryCountErr
}
func (m *mockAccountRepo) AllowAuthRateLimit(_ context.Context, key string, _ int, _ time.Duration) (bool, error) {
	m.rateLimitKeys = append(m.rateLimitKeys, key)
	if m.rateLimitErr != nil {
		return false, m.rateLimitErr
	}
	if m.blockedRateLimitKeys != nil && m.blockedRateLimitKeys[key] {
		return false, nil
	}
	return true, nil
}
func (m *mockAccountRepo) DeleteStalePasswordRecoveryTokens(_ context.Context, _ time.Time) (int64, error) {
	return 0, nil
}
func (m *mockAccountRepo) ExpirePasswordRecoveryTokensByUserID(_ context.Context, _ uuid.UUID) error {
	return m.expireRecoveryErr
}
func (m *mockAccountRepo) ResetUserPasswordWithRecoveryToken(_ context.Context, tokenID uuid.UUID, userID uuid.UUID, passwordHash string) error {
	m.resetRecoveryTokenID = tokenID
	m.resetRecoveryUserID = userID
	m.resetRecoveryPassword = passwordHash
	return m.resetRecoveryErr
}

type mockProfileRepo struct {
	parentProfile    models.ParentProfile
	parentProfileErr error
	nannyProfile     models.NannyProfile
	nannyProfileErr  error
}

func (m *mockProfileRepo) GetParentProfileByUserID(_ context.Context, _ uuid.UUID) (models.ParentProfile, error) {
	return m.parentProfile, m.parentProfileErr
}
func (m *mockProfileRepo) GetNannyProfileByUserID(_ context.Context, _ uuid.UUID) (models.NannyProfile, error) {
	return m.nannyProfile, m.nannyProfileErr
}
func (m *mockProfileRepo) CreateNannyProfile(_ context.Context, p models.NannyProfile) (models.NannyProfile, error) {
	return p, nil
}
func (m *mockProfileRepo) CreateParentProfile(_ context.Context, p models.ParentProfile) (models.ParentProfile, error) {
	return p, nil
}
func (m *mockProfileRepo) UpdateNannyProfile(_ context.Context, p models.NannyProfile) (models.NannyProfile, error) {
	return p, nil
}
func (m *mockProfileRepo) UpdateNannyAvatar(_ context.Context, _ uuid.UUID, _ string, _ string) (models.NannyProfile, error) {
	return models.NannyProfile{}, nil
}
func (m *mockProfileRepo) UpdateParentProfile(_ context.Context, p models.ParentProfile) (models.ParentProfile, error) {
	return p, nil
}
func (m *mockProfileRepo) GetOrCreateParentSettings(_ context.Context, userID uuid.UUID) (models.ParentSettings, error) {
	return models.ParentSettings{ID: uuid.New(), UserID: userID}, nil
}
func (m *mockProfileRepo) UpdateParentSettings(_ context.Context, settings models.ParentSettings) (models.ParentSettings, error) {
	if settings.ID == uuid.Nil {
		settings.ID = uuid.New()
	}
	return settings, nil
}
func (m *mockProfileRepo) DeleteNannyProfile(_ context.Context, _ uuid.UUID) error  { return nil }
func (m *mockProfileRepo) DeleteParentProfile(_ context.Context, _ uuid.UUID) error { return nil }

type mockMailProvider struct {
	message mail.Message
	err     error
}

func (m *mockMailProvider) Send(_ context.Context, message mail.Message) error {
	m.message = message
	return m.err
}

func newAuthPipeForTests(repo accountrepo.AccountRepository, profileRepo *mockProfileRepo) *AuthPipe {
	return NewAuthPipe(repo, profileRepo, testJWTSecret, testJWTRefreshSecret)
}

func mustHashPassword(t *testing.T, password string) string {
	t.Helper()
	hash, err := services.HashPassword(password)
	if err != nil {
		t.Fatalf("failed to hash password: %v", err)
	}
	return hash
}

func validUser(role models.UserRole) models.User {
	return models.User{
		ID:          uuid.New(),
		Firstname:   "Jordan",
		Lastname:    "Lee",
		Email:       "jordan@example.com",
		Role:        role,
		Phone:       "1234567890",
		IsActive:    true,
		CountryCode: "CA",
	}
}

func TestAuthPipeLogin(t *testing.T) {
	t.Run("success returns token pair and persists refresh session", func(t *testing.T) {
		user := validUser(models.ParentUserRole)
		user.Password = mustHashPassword(t, "verysecure")
		repo := &mockAccountRepo{userByEmail: user}
		pipe := newAuthPipeForTests(repo, &mockProfileRepo{})

		res := pipe.Login(context.Background(), dtos.LoginDTO{
			Email:    "  JORDAN@EXAMPLE.COM ",
			Password: "verysecure",
		})

		if !res.Success {
			t.Fatalf("expected success, got %s", res.Message)
		}
		if string(res.Message) != messages.Logged_In_Successfully {
			t.Fatalf("unexpected message: %s", res.Message)
		}
		if res.Data == nil || res.Data.AccessToken == "" || res.Data.RefreshToken == "" || res.Data.User != nil {
			t.Fatalf("expected compact token response without user, got %+v", res.Data)
		}
		if repo.createdRefreshSession.ID == uuid.Nil {
			t.Fatal("expected refresh session to be persisted")
		}
	})

	t.Run("disabled account is rejected", func(t *testing.T) {
		user := validUser(models.ParentUserRole)
		user.IsActive = false
		user.Password = mustHashPassword(t, "verysecure")
		pipe := newAuthPipeForTests(&mockAccountRepo{userByEmail: user}, &mockProfileRepo{})

		res := pipe.Login(context.Background(), dtos.LoginDTO{Email: user.Email, Password: "verysecure"})
		if res.Success || string(res.Message) != messages.Account_Disabled {
			t.Fatalf("expected %s, got success=%v message=%s", messages.Account_Disabled, res.Success, res.Message)
		}
	})

	t.Run("wrong password is rejected", func(t *testing.T) {
		user := validUser(models.ParentUserRole)
		user.Password = mustHashPassword(t, "verysecure")
		pipe := newAuthPipeForTests(&mockAccountRepo{userByEmail: user}, &mockProfileRepo{})

		res := pipe.Login(context.Background(), dtos.LoginDTO{Email: user.Email, Password: "wrongpass"})
		if res.Success || string(res.Message) != messages.Invalid_Email_Or_Password {
			t.Fatalf("expected %s, got success=%v message=%s", messages.Invalid_Email_Or_Password, res.Success, res.Message)
		}
	})
}

func TestAuthPipeRegisterParent(t *testing.T) {
	t.Run("duplicate email is rejected", func(t *testing.T) {
		repo := &mockAccountRepo{userExistsByEmail: true}
		pipe := newAuthPipeForTests(repo, &mockProfileRepo{})

		res := pipe.RegisterParent(context.Background(), dtos.RegisterParentDTO{
			Firstname: "Jordan",
			Lastname:  "Lee",
			Email:     "jordan@example.com",
			Password:  "verysecure",
		})

		if res.Success || string(res.Message) != messages.Email_Already_In_Use {
			t.Fatalf("expected %s, got success=%v message=%s", messages.Email_Already_In_Use, res.Success, res.Message)
		}
	})

	t.Run("success returns compact token pair", func(t *testing.T) {
		user := validUser(models.ParentUserRole)
		repo := &mockAccountRepo{createParentUser: user}
		pipe := newAuthPipeForTests(repo, &mockProfileRepo{})

		res := pipe.RegisterParent(context.Background(), dtos.RegisterParentDTO{
			Firstname: "Jordan",
			Lastname:  "Lee",
			Email:     "  JORDAN@EXAMPLE.COM ",
			Password:  "verysecure",
		})

		if !res.Success || string(res.Message) != messages.Registered_Successfully {
			t.Fatalf("expected success %s, got success=%v message=%s", messages.Registered_Successfully, res.Success, res.Message)
		}
		if res.Data == nil || res.Data.AccessToken == "" || res.Data.RefreshToken == "" || res.Data.User != nil {
			t.Fatalf("expected compact token response without user, got %+v", res.Data)
		}
		if repo.createdParentProfile.DisplayName != "Jordan L." || repo.createdParentProfile.NumChildren != 0 || len(repo.createdParentProfile.ChildrenAges) != 0 {
			t.Fatalf("expected default parent profile, got %+v", repo.createdParentProfile)
		}
	})
}

func TestAuthPipeRegisterNanny(t *testing.T) {
	t.Run("success forces nanny service type and returns compact tokens", func(t *testing.T) {
		user := validUser(models.NannyUserRole)
		repo := &mockAccountRepo{createNannyUser: user}
		pipe := newAuthPipeForTests(repo, &mockProfileRepo{})

		res := pipe.RegisterNanny(context.Background(), dtos.RegisterNannyDTO{
			Firstname: "Taylor",
			Lastname:  "Smith",
			Email:     "taylor@example.com",
			Password:  "verysecure",
		})

		if !res.Success || string(res.Message) != messages.Registered_Successfully {
			t.Fatalf("expected success %s, got success=%v message=%s", messages.Registered_Successfully, res.Success, res.Message)
		}
		if res.Data == nil || res.Data.AccessToken == "" || res.Data.RefreshToken == "" || res.Data.User != nil {
			t.Fatalf("expected compact token response without user, got %+v", res.Data)
		}
		if repo.createdNannyProfile.DisplayName != "Taylor S." ||
			repo.createdNannyProfile.ServiceType != models.NannyServiceType ||
			repo.createdNannyProfile.RatePerHour != 0 ||
			repo.createdNannyProfile.Bio != "" {
			t.Fatalf("expected default nanny profile, got %+v", repo.createdNannyProfile)
		}
	})
}

func TestAuthPipeRefresh(t *testing.T) {
	t.Run("valid refresh rotates session and returns new tokens", func(t *testing.T) {
		user := validUser(models.ParentUserRole)
		oldSessionID := uuid.New()
		repo := &mockAccountRepo{
			getRefreshSession: models.RefreshSession{
				ID:        oldSessionID,
				UserID:    user.ID,
				ExpiresAt: time.Now().Add(time.Hour),
			},
			userByID: user,
		}
		pipe := newAuthPipeForTests(repo, &mockProfileRepo{})
		refreshToken, err := token.GenerateRefreshToken(user.ID, user.Role, oldSessionID, testJWTRefreshSecret)
		if err != nil {
			t.Fatalf("failed to create refresh token: %v", err)
		}

		res := pipe.Refresh(context.Background(), dtos.RefreshDTO{RefreshToken: refreshToken})
		if !res.Success || string(res.Message) != messages.Token_Refreshed_Successfully {
			t.Fatalf("expected success %s, got success=%v message=%s", messages.Token_Refreshed_Successfully, res.Success, res.Message)
		}
		if repo.rotatedOldSessionID != oldSessionID || repo.rotatedNewSession.ID == uuid.Nil {
			t.Fatal("expected refresh session rotation to occur")
		}
	})

	t.Run("expired stored session is rejected", func(t *testing.T) {
		user := validUser(models.ParentUserRole)
		oldSessionID := uuid.New()
		repo := &mockAccountRepo{
			getRefreshSession: models.RefreshSession{
				ID:        oldSessionID,
				UserID:    user.ID,
				ExpiresAt: time.Now().Add(-time.Minute),
			},
			userByID: user,
		}
		pipe := newAuthPipeForTests(repo, &mockProfileRepo{})
		refreshToken, err := token.GenerateRefreshToken(user.ID, user.Role, oldSessionID, testJWTRefreshSecret)
		if err != nil {
			t.Fatalf("failed to create refresh token: %v", err)
		}

		res := pipe.Refresh(context.Background(), dtos.RefreshDTO{RefreshToken: refreshToken})
		if res.Success || string(res.Message) != messages.Invalid_Or_Expired_Token {
			t.Fatalf("expected %s, got success=%v message=%s", messages.Invalid_Or_Expired_Token, res.Success, res.Message)
		}
	})
}

func TestAuthPipeMe(t *testing.T) {
	t.Run("parent returns current user with parent profile", func(t *testing.T) {
		user := validUser(models.ParentUserRole)
		parentProfile := models.ParentProfile{ID: uuid.New(), UserID: user.ID, DisplayName: "Jordan"}
		repo := &mockAccountRepo{userByID: user}
		profileRepo := &mockProfileRepo{parentProfile: parentProfile}
		pipe := newAuthPipeForTests(repo, profileRepo)

		res := pipe.Me(context.Background(), user.ID)
		if !res.Success || string(res.Message) != messages.Current_User_Fetched {
			t.Fatalf("expected success %s, got success=%v message=%s", messages.Current_User_Fetched, res.Success, res.Message)
		}
		if res.Data == nil || res.Data.ParentProfile == nil || res.Data.ParentProfile.ID != parentProfile.ID {
			t.Fatalf("expected parent profile in response, got %+v", res.Data)
		}
	})

	t.Run("admin returns current user without requiring a profile", func(t *testing.T) {
		user := validUser(models.AdminUserRole)
		pipe := newAuthPipeForTests(&mockAccountRepo{userByID: user}, &mockProfileRepo{})

		res := pipe.Me(context.Background(), user.ID)
		if !res.Success || string(res.Message) != messages.Current_User_Fetched {
			t.Fatalf("expected success %s, got success=%v message=%s", messages.Current_User_Fetched, res.Success, res.Message)
		}
		if res.Data == nil || res.Data.User.ID != user.ID {
			t.Fatalf("expected admin user in response, got %+v", res.Data)
		}
		if res.Data.ParentProfile != nil || res.Data.NannyProfile != nil {
			t.Fatalf("expected no role profile for admin, got parent=%+v nanny=%+v", res.Data.ParentProfile, res.Data.NannyProfile)
		}
	})

	t.Run("inactive user is rejected", func(t *testing.T) {
		user := validUser(models.ParentUserRole)
		user.IsActive = false
		pipe := newAuthPipeForTests(&mockAccountRepo{userByID: user}, &mockProfileRepo{})

		res := pipe.Me(context.Background(), user.ID)
		if res.Success || string(res.Message) != messages.Invalid_Or_Expired_Token {
			t.Fatalf("expected %s, got success=%v message=%s", messages.Invalid_Or_Expired_Token, res.Success, res.Message)
		}
	})
}

func TestAuthPipeLogout(t *testing.T) {
	t.Run("valid refresh token deletes session", func(t *testing.T) {
		user := validUser(models.ParentUserRole)
		sessionID := uuid.New()
		repo := &mockAccountRepo{}
		pipe := newAuthPipeForTests(repo, &mockProfileRepo{})
		refreshToken, err := token.GenerateRefreshToken(user.ID, user.Role, sessionID, testJWTRefreshSecret)
		if err != nil {
			t.Fatalf("failed to create refresh token: %v", err)
		}

		res := pipe.Logout(context.Background(), dtos.RefreshDTO{RefreshToken: refreshToken})
		if !res.Success || string(res.Message) != messages.Logged_Out_Successfully {
			t.Fatalf("expected success %s, got success=%v message=%s", messages.Logged_Out_Successfully, res.Success, res.Message)
		}
		if repo.deletedSessionID != sessionID {
			t.Fatalf("expected session %s to be deleted, got %s", sessionID, repo.deletedSessionID)
		}
	})

	t.Run("delete failure is rejected", func(t *testing.T) {
		user := validUser(models.ParentUserRole)
		sessionID := uuid.New()
		repo := &mockAccountRepo{deleteRefreshErr: errors.New("redis down")}
		pipe := newAuthPipeForTests(repo, &mockProfileRepo{})
		refreshToken, err := token.GenerateRefreshToken(user.ID, user.Role, sessionID, testJWTRefreshSecret)
		if err != nil {
			t.Fatalf("failed to create refresh token: %v", err)
		}

		res := pipe.Logout(context.Background(), dtos.RefreshDTO{RefreshToken: refreshToken})
		if res.Success || string(res.Message) != messages.Invalid_Or_Expired_Token {
			t.Fatalf("expected %s, got success=%v message=%s", messages.Invalid_Or_Expired_Token, res.Success, res.Message)
		}
	})
}

func TestAuthPipeRecovery(t *testing.T) {
	t.Run("unknown email returns generic success without token", func(t *testing.T) {
		repo := &mockAccountRepo{}
		pipe := newAuthPipeForTests(repo, &mockProfileRepo{})

		res := pipe.RequestRecovery(context.Background(), dtos.RecoveryRequestDTO{Email: "missing@example.com"}, "127.0.0.1")
		if !res.Success || string(res.Message) != messages.Recovery_Request_Accepted {
			t.Fatalf("expected generic success, got success=%v message=%s", res.Success, res.Message)
		}
		if repo.createdRecoveryToken.ID != uuid.Nil {
			t.Fatal("expected no recovery token for unknown email")
		}
	})

	t.Run("active parent creates recovery token", func(t *testing.T) {
		user := validUser(models.ParentUserRole)
		repo := &mockAccountRepo{userByEmail: user}
		pipe := newAuthPipeForTests(repo, &mockProfileRepo{})

		res := pipe.RequestRecovery(context.Background(), dtos.RecoveryRequestDTO{Email: " JORDAN@EXAMPLE.COM "}, "127.0.0.1")
		if !res.Success || string(res.Message) != messages.Recovery_Request_Accepted {
			t.Fatalf("expected success, got success=%v message=%s", res.Success, res.Message)
		}
		if repo.createdRecoveryToken.ID == uuid.Nil || repo.createdRecoveryToken.UserID != user.ID {
			t.Fatalf("expected recovery token for user, got %+v", repo.createdRecoveryToken)
		}
		if repo.createdRecoveryToken.TokenHash == "" {
			t.Fatal("expected hashed token")
		}
		if len(repo.rateLimitKeys) != 2 {
			t.Fatalf("expected IP and email rate limit checks, got %v", repo.rateLimitKeys)
		}
	})

	t.Run("configured email service receives normalized recipient and recovery link", func(t *testing.T) {
		user := validUser(models.ParentUserRole)
		user.Email = "jordan@example.com"
		repo := &mockAccountRepo{userByEmail: user}
		provider := &mockMailProvider{}
		pipe := newAuthPipeForTests(repo, &mockProfileRepo{})
		pipe.SetRecoveryEmailService(services.NewEmailService(provider), " https://kinsittr.test/ ")

		res := pipe.RequestRecovery(context.Background(), dtos.RecoveryRequestDTO{Email: " JORDAN@EXAMPLE.COM "}, "127.0.0.1")
		if !res.Success || string(res.Message) != messages.Recovery_Request_Accepted {
			t.Fatalf("expected success, got success=%v message=%s", res.Success, res.Message)
		}
		if provider.message.ToEmail != "jordan@example.com" {
			t.Fatalf("expected normalized recipient, got %q", provider.message.ToEmail)
		}
		if !strings.Contains(provider.message.TextContent, "https://kinsittr.test/auth/reset-password?token=") {
			t.Fatalf("expected text recovery link with token query, got %q", provider.message.TextContent)
		}
		if !strings.Contains(provider.message.HTMLContent, "https://kinsittr.test/auth/reset-password?token=") {
			t.Fatalf("expected HTML recovery link with token query, got %q", provider.message.HTMLContent)
		}
	})

	t.Run("request IP rate limit returns generic success without token", func(t *testing.T) {
		repo := &mockAccountRepo{
			blockedRateLimitKeys: map[string]bool{
				"auth:recovery:request:ip:127.0.0.1": true,
			},
		}
		pipe := newAuthPipeForTests(repo, &mockProfileRepo{})

		res := pipe.RequestRecovery(context.Background(), dtos.RecoveryRequestDTO{Email: "jordan@example.com"}, "127.0.0.1")
		if !res.Success || string(res.Message) != messages.Recovery_Request_Accepted {
			t.Fatalf("expected generic success, got success=%v message=%s", res.Success, res.Message)
		}
		if repo.createdRecoveryToken.ID != uuid.Nil {
			t.Fatal("expected no token when IP recovery limit is reached")
		}
	})

	t.Run("email rate limit returns generic success without token", func(t *testing.T) {
		user := validUser(models.ParentUserRole)
		repo := &mockAccountRepo{userByEmail: user, recoveryCount: maxRecoveryRequestsPerHour}
		pipe := newAuthPipeForTests(repo, &mockProfileRepo{})

		res := pipe.RequestRecovery(context.Background(), dtos.RecoveryRequestDTO{Email: user.Email}, "127.0.0.1")
		if !res.Success || string(res.Message) != messages.Recovery_Request_Accepted {
			t.Fatalf("expected generic success, got success=%v message=%s", res.Success, res.Message)
		}
		if repo.createdRecoveryToken.ID != uuid.Nil {
			t.Fatal("expected no token when email recovery limit is reached")
		}
	})

	t.Run("verify rejects expired token", func(t *testing.T) {
		repo := &mockAccountRepo{
			recoveryToken: models.PasswordRecoveryToken{
				ID:        uuid.New(),
				UserID:    uuid.New(),
				ExpiresAt: time.Now().Add(-time.Minute),
			},
		}
		pipe := newAuthPipeForTests(repo, &mockProfileRepo{})

		res := pipe.VerifyRecovery(context.Background(), dtos.RecoveryVerifyDTO{Token: "valid-length-token-value-1234567890"}, "127.0.0.1")
		if res.Success || string(res.Message) != messages.Invalid_Recovery_Token {
			t.Fatalf("expected %s, got success=%v message=%s", messages.Invalid_Recovery_Token, res.Success, res.Message)
		}
	})

	t.Run("verify rate limit returns invalid token", func(t *testing.T) {
		repo := &mockAccountRepo{
			blockedRateLimitKeys: map[string]bool{
				"auth:recovery:verify:ip:127.0.0.1": true,
			},
		}
		pipe := newAuthPipeForTests(repo, &mockProfileRepo{})

		res := pipe.VerifyRecovery(context.Background(), dtos.RecoveryVerifyDTO{Token: "valid-length-token-value-1234567890"}, "127.0.0.1")
		if res.Success || string(res.Message) != messages.Invalid_Recovery_Token {
			t.Fatalf("expected %s, got success=%v message=%s", messages.Invalid_Recovery_Token, res.Success, res.Message)
		}
	})

	t.Run("verify accepts active token for active user", func(t *testing.T) {
		user := validUser(models.ParentUserRole)
		repo := &mockAccountRepo{
			recoveryToken: models.PasswordRecoveryToken{
				ID:        uuid.New(),
				UserID:    user.ID,
				ExpiresAt: time.Now().Add(time.Minute),
			},
			userByID: user,
		}
		pipe := newAuthPipeForTests(repo, &mockProfileRepo{})

		res := pipe.VerifyRecovery(context.Background(), dtos.RecoveryVerifyDTO{Token: "valid-length-token-value-1234567890"}, "127.0.0.1")
		if !res.Success || string(res.Message) != messages.Recovery_Token_Verified {
			t.Fatalf("expected success, got success=%v message=%s", res.Success, res.Message)
		}
	})

	t.Run("reset updates password and uses token", func(t *testing.T) {
		user := validUser(models.NannyUserRole)
		tokenID := uuid.New()
		repo := &mockAccountRepo{
			recoveryToken: models.PasswordRecoveryToken{
				ID:        tokenID,
				UserID:    user.ID,
				ExpiresAt: time.Now().Add(time.Minute),
			},
			userByID: user,
		}
		pipe := newAuthPipeForTests(repo, &mockProfileRepo{})

		res := pipe.ResetRecoveryPassword(context.Background(), dtos.RecoveryResetDTO{
			Token:       "valid-length-token-value-1234567890",
			NewPassword: "newsecurepass",
		}, "127.0.0.1")
		if !res.Success || string(res.Message) != messages.Password_Reset {
			t.Fatalf("expected success, got success=%v message=%s", res.Success, res.Message)
		}
		if repo.resetRecoveryTokenID != tokenID || repo.resetRecoveryUserID != user.ID {
			t.Fatalf("expected reset token/user IDs, got token=%s user=%s", repo.resetRecoveryTokenID, repo.resetRecoveryUserID)
		}
		if !services.CheckPassword(repo.resetRecoveryPassword, "newsecurepass") {
			t.Fatal("expected stored reset password hash to match new password")
		}
	})

	t.Run("reset rate limit returns invalid token", func(t *testing.T) {
		repo := &mockAccountRepo{
			blockedRateLimitKeys: map[string]bool{
				"auth:recovery:reset:ip:127.0.0.1": true,
			},
		}
		pipe := newAuthPipeForTests(repo, &mockProfileRepo{})

		res := pipe.ResetRecoveryPassword(context.Background(), dtos.RecoveryResetDTO{
			Token:       "valid-length-token-value-1234567890",
			NewPassword: "newsecurepass",
		}, "127.0.0.1")
		if res.Success || string(res.Message) != messages.Invalid_Recovery_Token {
			t.Fatalf("expected %s, got success=%v message=%s", messages.Invalid_Recovery_Token, res.Success, res.Message)
		}
	})
}
