package controllers

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/auth/pipes"
	"github.com/kinsittr/kinsittr-api/auth/services"
	"github.com/kinsittr/kinsittr-api/models"
)

type mockAccountRepo struct {
	userExistsByEmail bool
	userByEmail       models.User
	userByID          models.User
	createParentUser  models.User
	createRefreshErr  error
}

func (m *mockAccountRepo) UserExistsByEmail(_ context.Context, _ string) (bool, error) {
	return m.userExistsByEmail, nil
}
func (m *mockAccountRepo) CreateUser(_ context.Context, user models.User) (models.User, error) {
	return user, nil
}
func (m *mockAccountRepo) GetUserByEmail(_ context.Context, _ string) (models.User, error) {
	return m.userByEmail, nil
}
func (m *mockAccountRepo) GetUserByID(_ context.Context, _ uuid.UUID) (models.User, error) {
	return m.userByID, nil
}
func (m *mockAccountRepo) CreateParentAccount(_ context.Context, user models.User, _ models.ParentProfile) (models.User, error) {
	if m.createParentUser.ID != uuid.Nil {
		return m.createParentUser, nil
	}
	return user, nil
}
func (m *mockAccountRepo) CreateNannyAccount(_ context.Context, user models.User, _ models.NannyProfile) (models.User, error) {
	return user, nil
}
func (m *mockAccountRepo) CreateRefreshSession(_ context.Context, _ models.RefreshSession) error {
	return m.createRefreshErr
}
func (m *mockAccountRepo) GetRefreshSessionByID(_ context.Context, _ uuid.UUID) (models.RefreshSession, error) {
	return models.RefreshSession{}, nil
}
func (m *mockAccountRepo) RotateRefreshSession(_ context.Context, _ uuid.UUID, _ models.RefreshSession) error {
	return nil
}
func (m *mockAccountRepo) DeleteRefreshSession(_ context.Context, _ uuid.UUID) error {
	return nil
}
func (m *mockAccountRepo) DeleteRefreshSessionsByUserID(_ context.Context, _ uuid.UUID) error {
	return nil
}
func (m *mockAccountRepo) UpdateUserPassword(_ context.Context, _ uuid.UUID, _ string) error {
	return nil
}
func (m *mockAccountRepo) DeactivateUser(_ context.Context, _ uuid.UUID) error {
	return nil
}

type mockProfileRepo struct {
	parentProfile models.ParentProfile
}

func (m *mockProfileRepo) GetParentProfileByUserID(_ context.Context, _ uuid.UUID) (models.ParentProfile, error) {
	return m.parentProfile, nil
}
func (m *mockProfileRepo) GetNannyProfileByUserID(_ context.Context, _ uuid.UUID) (models.NannyProfile, error) {
	return models.NannyProfile{}, nil
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

type apiResponse struct {
	Success bool            `json:"success"`
	Message string          `json:"message"`
	Data    json.RawMessage `json:"data"`
}

func mustHashPassword(t *testing.T, password string) string {
	t.Helper()
	hash, err := services.HashPassword(password)
	if err != nil {
		t.Fatalf("failed to hash password: %v", err)
	}
	return hash
}

func newAuthControllerForTests(user models.User, parentProfile models.ParentProfile) *AuthController {
	repo := &mockAccountRepo{
		userByEmail:      user,
		userByID:         user,
		createParentUser: user,
	}
	pipe := pipes.NewAuthPipe(repo, &mockProfileRepo{parentProfile: parentProfile}, "controller-jwt-secret", "controller-refresh-secret")
	return NewAuthController(pipe)
}

func doJSONRequest(t *testing.T, app *fiber.App, method, path string, body any) *apiResponse {
	t.Helper()

	var payload []byte
	var err error
	if body != nil {
		payload, err = json.Marshal(body)
		if err != nil {
			t.Fatalf("failed to marshal body: %v", err)
		}
	}

	req := httptest.NewRequest(method, path, bytes.NewReader(payload))
	req.Header.Set("Content-Type", "application/json")
	resp, err := app.Test(req, -1)
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	defer resp.Body.Close()

	var parsed apiResponse
	if err := json.NewDecoder(resp.Body).Decode(&parsed); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	return &parsed
}

func TestAuthControllerRegisterParent(t *testing.T) {
	app := fiber.New()
	user := models.User{
		ID:        uuid.New(),
		Firstname: "Jordan",
		Lastname:  "Lee",
		Email:     "jordan@example.com",
		Role:      models.ParentUserRole,
		IsActive:  true,
	}
	controller := newAuthControllerForTests(user, models.ParentProfile{ID: uuid.New(), UserID: user.ID})
	app.Post("/register-parent", controller.RegisterParent)

	t.Run("invalid request body returns 400", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPost, "/register-parent", bytes.NewBufferString("{"))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("request failed: %v", err)
		}
		defer resp.Body.Close()
		if resp.StatusCode != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", resp.StatusCode)
		}
	})

	t.Run("valid payload returns 201", func(t *testing.T) {
		res := doJSONRequest(t, app, http.MethodPost, "/register-parent", map[string]any{
			"firstname":     "Jordan",
			"lastname":      "Lee",
			"email":         "jordan@example.com",
			"password":      "verysecure",
			"display_name":  "Jordan",
			"num_children":  1,
			"children_ages": []int{4},
			"city":          "Toronto",
			"province":      "ON",
		})
		if !res.Success || res.Message != "registered_successfully" {
			t.Fatalf("unexpected response: %+v", res)
		}
	})
}

func TestAuthControllerLogin(t *testing.T) {
	app := fiber.New()
	user := models.User{
		ID:        uuid.New(),
		Firstname: "Jordan",
		Lastname:  "Lee",
		Email:     "jordan@example.com",
		Password:  mustHashPassword(t, "verysecure"),
		Role:      models.ParentUserRole,
		IsActive:  true,
	}
	controller := newAuthControllerForTests(user, models.ParentProfile{ID: uuid.New(), UserID: user.ID})
	app.Post("/login", controller.Login)

	t.Run("validation failure returns 400", func(t *testing.T) {
		req := doJSONRequest(t, app, http.MethodPost, "/login", map[string]any{
			"email":    "bad-email",
			"password": "short",
		})
		if req.Success {
			t.Fatalf("expected validation failure, got %+v", req)
		}
	})

	t.Run("invalid credentials return 401", func(t *testing.T) {
		req := doJSONRequest(t, app, http.MethodPost, "/login", map[string]any{
			"email":    "jordan@example.com",
			"password": "wrongpass",
		})
		if req.Success || req.Message != "invalid_email_or_password" {
			t.Fatalf("unexpected response: %+v", req)
		}
	})
}

func TestAuthControllerMe(t *testing.T) {
	user := models.User{
		ID:        uuid.New(),
		Firstname: "Jordan",
		Lastname:  "Lee",
		Email:     "jordan@example.com",
		Role:      models.ParentUserRole,
		IsActive:  true,
	}
	parentProfile := models.ParentProfile{ID: uuid.New(), UserID: user.ID, DisplayName: "Jordan"}
	controller := newAuthControllerForTests(user, parentProfile)

	t.Run("missing auth locals returns 401", func(t *testing.T) {
		app := fiber.New()
		app.Get("/me", controller.Me)
		req := doJSONRequest(t, app, http.MethodGet, "/me", nil)
		if req.Success || req.Message != "invalid_or_expired_token" {
			t.Fatalf("unexpected response: %+v", req)
		}
	})

	t.Run("valid auth locals returns 200", func(t *testing.T) {
		app := fiber.New()
		app.Use(func(c *fiber.Ctx) error {
			c.Locals("auth.user_id", user.ID)
			return c.Next()
		})
		app.Get("/me", controller.Me)

		req := doJSONRequest(t, app, http.MethodGet, "/me", nil)
		if !req.Success || req.Message != "current_user_fetched" {
			t.Fatalf("unexpected response: %+v", req)
		}
	})
}
