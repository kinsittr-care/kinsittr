package pipes

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/admin/auth/dtos"
	"github.com/kinsittr/kinsittr-api/admin/messages"
	authservices "github.com/kinsittr/kinsittr-api/auth/services"
	"github.com/kinsittr/kinsittr-api/models"
)

const (
	testJWTSecret        = "unit-test-jwt-secret"
	testJWTRefreshSecret = "unit-test-jwt-refresh-secret"
)

type mockAccountRepo struct {
	userByEmail             models.User
	userByID                models.User
	refreshSession          models.RefreshSession
	createdRefreshSession   models.RefreshSession
	rotatedRefreshSession   models.RefreshSession
	deletedRefreshSession   uuid.UUID
	createRefreshSessionErr error
}

func (m *mockAccountRepo) UserExistsByEmail(context.Context, string) (bool, error) {
	return false, nil
}

func (m *mockAccountRepo) CreateUser(context.Context, models.User) (models.User, error) {
	return models.User{}, nil
}

func (m *mockAccountRepo) GetUserByEmail(context.Context, string) (models.User, error) {
	return m.userByEmail, nil
}

func (m *mockAccountRepo) GetUserByID(context.Context, uuid.UUID) (models.User, error) {
	return m.userByID, nil
}

func (m *mockAccountRepo) CreateParentAccount(context.Context, models.User, models.ParentProfile) (models.User, error) {
	return models.User{}, nil
}

func (m *mockAccountRepo) CreateNannyAccount(context.Context, models.User, models.NannyProfile) (models.User, error) {
	return models.User{}, nil
}

func (m *mockAccountRepo) UpdateUserPassword(context.Context, uuid.UUID, string) error {
	return nil
}

func (m *mockAccountRepo) DeactivateUser(context.Context, uuid.UUID) error {
	return nil
}

func (m *mockAccountRepo) CreatePasswordRecoveryToken(context.Context, models.PasswordRecoveryToken) error {
	return nil
}

func (m *mockAccountRepo) GetPasswordRecoveryTokenByHash(context.Context, string) (models.PasswordRecoveryToken, error) {
	return models.PasswordRecoveryToken{}, nil
}

func (m *mockAccountRepo) CountPasswordRecoveryTokensSince(context.Context, uuid.UUID, time.Time) (int, error) {
	return 0, nil
}

func (m *mockAccountRepo) AllowAuthRateLimit(context.Context, string, int, time.Duration) (bool, error) {
	return true, nil
}

func (m *mockAccountRepo) DeleteStalePasswordRecoveryTokens(context.Context, time.Time) (int64, error) {
	return 0, nil
}

func (m *mockAccountRepo) ExpirePasswordRecoveryTokensByUserID(context.Context, uuid.UUID) error {
	return nil
}

func (m *mockAccountRepo) ResetUserPasswordWithRecoveryToken(context.Context, uuid.UUID, uuid.UUID, string) error {
	return nil
}

func (m *mockAccountRepo) CreateRefreshSession(_ context.Context, session models.RefreshSession) error {
	m.createdRefreshSession = session
	return m.createRefreshSessionErr
}

func (m *mockAccountRepo) GetRefreshSessionByID(context.Context, uuid.UUID) (models.RefreshSession, error) {
	return m.refreshSession, nil
}

func (m *mockAccountRepo) RotateRefreshSession(_ context.Context, _ uuid.UUID, session models.RefreshSession) error {
	m.rotatedRefreshSession = session
	return nil
}

func (m *mockAccountRepo) DeleteRefreshSession(_ context.Context, sessionID uuid.UUID) error {
	m.deletedRefreshSession = sessionID
	return nil
}

func (m *mockAccountRepo) DeleteRefreshSessionsByUserID(context.Context, uuid.UUID) error {
	return nil
}

func newPipe(repo *mockAccountRepo) *AdminAuthPipe {
	return NewAdminAuthPipe(repo, testJWTSecret, testJWTRefreshSecret)
}

func mustHashPassword(t *testing.T, password string) string {
	t.Helper()
	hash, err := authservices.HashPassword(password)
	if err != nil {
		t.Fatalf("failed to hash password: %v", err)
	}
	return hash
}

func adminUser(t *testing.T, password string) models.User {
	t.Helper()
	return models.User{
		ID:       uuid.New(),
		Email:    "admin@kinsittr.com",
		Password: mustHashPassword(t, password),
		Role:     models.AdminUserRole,
		IsActive: true,
	}
}

func TestAdminLogin(t *testing.T) {
	t.Run("active admin succeeds", func(t *testing.T) {
		repo := &mockAccountRepo{userByEmail: adminUser(t, "password123")}
		res := newPipe(repo).Login(context.Background(), dtos.LoginDTO{
			Email:    "ADMIN@KINSITTR.COM",
			Password: "password123",
		})

		if !res.Success || res.Data == nil {
			t.Fatalf("expected successful admin login, got %#v", res)
		}
		if res.Data.User.Role != models.AdminUserRole {
			t.Fatalf("expected admin role, got %q", res.Data.User.Role)
		}
		if repo.createdRefreshSession.ID == uuid.Nil {
			t.Fatal("expected refresh session to be created")
		}
	})

	t.Run("non-admin is rejected", func(t *testing.T) {
		user := adminUser(t, "password123")
		user.Role = models.ParentUserRole
		repo := &mockAccountRepo{userByEmail: user}

		res := newPipe(repo).Login(context.Background(), dtos.LoginDTO{
			Email:    user.Email,
			Password: "password123",
		})

		if res.Success || string(res.Message) != messages.Invalid_Admin_Credentials {
			t.Fatalf("expected invalid admin credentials, got %#v", res)
		}
	})

	t.Run("inactive admin is rejected", func(t *testing.T) {
		user := adminUser(t, "password123")
		user.IsActive = false
		repo := &mockAccountRepo{userByEmail: user}

		res := newPipe(repo).Login(context.Background(), dtos.LoginDTO{
			Email:    user.Email,
			Password: "password123",
		})

		if res.Success || string(res.Message) != messages.Admin_Account_Disabled {
			t.Fatalf("expected disabled admin rejection, got %#v", res)
		}
	})

	t.Run("bad password is rejected", func(t *testing.T) {
		user := adminUser(t, "password123")
		repo := &mockAccountRepo{userByEmail: user}

		res := newPipe(repo).Login(context.Background(), dtos.LoginDTO{
			Email:    user.Email,
			Password: "wrong-password",
		})

		if res.Success || string(res.Message) != messages.Invalid_Admin_Credentials {
			t.Fatalf("expected invalid admin credentials, got %#v", res)
		}
	})
}

func TestAdminMe(t *testing.T) {
	t.Run("active admin session succeeds", func(t *testing.T) {
		user := adminUser(t, "password123")
		repo := &mockAccountRepo{userByID: user}

		res := newPipe(repo).Me(context.Background(), user.ID)

		if !res.Success || res.Data == nil || res.Data.User.ID != user.ID {
			t.Fatalf("expected current admin session, got %#v", res)
		}
	})

	t.Run("non-admin session is rejected", func(t *testing.T) {
		user := adminUser(t, "password123")
		user.Role = models.NannyUserRole
		repo := &mockAccountRepo{userByID: user}

		res := newPipe(repo).Me(context.Background(), user.ID)

		if res.Success || string(res.Message) != messages.Invalid_Admin_Session {
			t.Fatalf("expected invalid admin session, got %#v", res)
		}
	})
}

func TestAdminRefreshAndLogout(t *testing.T) {
	user := adminUser(t, "password123")
	repo := &mockAccountRepo{userByEmail: user}
	loginRes := newPipe(repo).Login(context.Background(), dtos.LoginDTO{
		Email:    user.Email,
		Password: "password123",
	})
	if !loginRes.Success || loginRes.Data == nil {
		t.Fatalf("expected login token pair, got %#v", loginRes)
	}

	repo.userByID = user
	repo.refreshSession = models.RefreshSession{
		ID:        repo.createdRefreshSession.ID,
		UserID:    user.ID,
		ExpiresAt: time.Now().Add(time.Hour),
	}

	refreshRes := newPipe(repo).Refresh(context.Background(), dtos.RefreshDTO{
		RefreshToken: loginRes.Data.RefreshToken,
	})
	if !refreshRes.Success || refreshRes.Data == nil {
		t.Fatalf("expected admin refresh success, got %#v", refreshRes)
	}
	if repo.rotatedRefreshSession.ID == uuid.Nil {
		t.Fatal("expected refresh session rotation")
	}

	logoutRes := newPipe(repo).Logout(context.Background(), dtos.RefreshDTO{
		RefreshToken: refreshRes.Data.RefreshToken,
	})
	if !logoutRes.Success {
		t.Fatalf("expected admin logout success, got %#v", logoutRes)
	}
	if repo.deletedRefreshSession == uuid.Nil {
		t.Fatal("expected refresh session deletion")
	}
}
