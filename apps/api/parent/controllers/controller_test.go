package controllers

import (
	"context"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/models"
	"github.com/kinsittr/kinsittr-api/parent/messages"
	"github.com/kinsittr/kinsittr-api/parent/pipes"
)

type mockParentProfileRepo struct {
	parentProfile   models.ParentProfile
	updatedParent   models.ParentProfile
	settings        models.ParentSettings
	updatedSettings models.ParentSettings
}

func (m *mockParentProfileRepo) CreateNannyProfile(_ context.Context, p models.NannyProfile) (models.NannyProfile, error) {
	return p, nil
}
func (m *mockParentProfileRepo) CreateParentProfile(_ context.Context, p models.ParentProfile) (models.ParentProfile, error) {
	return p, nil
}
func (m *mockParentProfileRepo) GetNannyProfileByUserID(_ context.Context, _ uuid.UUID) (models.NannyProfile, error) {
	return models.NannyProfile{}, nil
}
func (m *mockParentProfileRepo) GetParentProfileByUserID(_ context.Context, _ uuid.UUID) (models.ParentProfile, error) {
	return m.parentProfile, nil
}
func (m *mockParentProfileRepo) UpdateNannyProfile(_ context.Context, p models.NannyProfile) (models.NannyProfile, error) {
	return p, nil
}
func (m *mockParentProfileRepo) UpdateNannyAvatar(_ context.Context, _ uuid.UUID, _ string, _ string) (models.NannyProfile, error) {
	return models.NannyProfile{}, nil
}
func (m *mockParentProfileRepo) UpdateParentProfile(_ context.Context, _ models.ParentProfile) (models.ParentProfile, error) {
	return m.updatedParent, nil
}
func (m *mockParentProfileRepo) GetOrCreateParentSettings(_ context.Context, userID uuid.UUID) (models.ParentSettings, error) {
	if m.settings.ID == uuid.Nil {
		m.settings = models.ParentSettings{ID: uuid.New(), UserID: userID}
	}
	return m.settings, nil
}
func (m *mockParentProfileRepo) UpdateParentSettings(_ context.Context, settings models.ParentSettings) (models.ParentSettings, error) {
	if m.updatedSettings.ID == uuid.Nil {
		settings.ID = uuid.New()
		m.updatedSettings = settings
	}
	return m.updatedSettings, nil
}
func (m *mockParentProfileRepo) DeleteNannyProfile(_ context.Context, _ uuid.UUID) error  { return nil }
func (m *mockParentProfileRepo) DeleteParentProfile(_ context.Context, _ uuid.UUID) error { return nil }

func parentTestApp(controller *ParentController, role models.UserRole) *fiber.App {
	app := fiber.New()
	app.Use(func(c *fiber.Ctx) error {
		c.Locals("auth.user_id", uuid.New())
		c.Locals("auth.role", role)
		return c.Next()
	})
	app.Get("/profile", controller.GetOwnProfile)
	app.Patch("/profile", controller.UpdateOwnProfile)
	app.Get("/settings", controller.GetOwnSettings)
	app.Patch("/settings", controller.UpdateOwnSettings)
	return app
}

func TestParentControllerAuth(t *testing.T) {
	controller := NewParentController(pipes.NewParentPipe(&mockParentProfileRepo{}))
	req := httptest.NewRequest(fiber.MethodGet, "/profile", nil)
	resp, err := parentTestApp(controller, models.NannyUserRole).Test(req)
	if err != nil {
		t.Fatal(err)
	}
	if resp.StatusCode != fiber.StatusForbidden {
		t.Fatalf("expected 403 %s, got %d", messages.Forbidden_Profile, resp.StatusCode)
	}
}

func TestParentControllerProfile(t *testing.T) {
	repo := &mockParentProfileRepo{
		parentProfile: models.ParentProfile{ID: uuid.New(), DisplayName: "Alex"},
		updatedParent: models.ParentProfile{ID: uuid.New(), DisplayName: "Alex Parent"},
	}
	controller := NewParentController(pipes.NewParentPipe(repo))

	resp, err := parentTestApp(controller, models.ParentUserRole).Test(httptest.NewRequest(fiber.MethodGet, "/profile", nil))
	if err != nil {
		t.Fatal(err)
	}
	if resp.StatusCode != fiber.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}

	body := `{"display_name":"Alex Parent","phone":"+14165550100","num_children":1,"children_ages":[3],"city":"Toronto","province":"ON"}`
	req := httptest.NewRequest(fiber.MethodPatch, "/profile", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err = parentTestApp(controller, models.ParentUserRole).Test(req)
	if err != nil {
		t.Fatal(err)
	}
	if resp.StatusCode != fiber.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}
}

func TestParentControllerSettingsValidation(t *testing.T) {
	repo := &mockParentProfileRepo{parentProfile: models.ParentProfile{ID: uuid.New()}}
	controller := NewParentController(pipes.NewParentPipe(repo))
	req := httptest.NewRequest(fiber.MethodPatch, "/settings", strings.NewReader(`{"language":"","currency":"CAD","timezone":"UTC"}`))
	req.Header.Set("Content-Type", "application/json")
	resp, err := parentTestApp(controller, models.ParentUserRole).Test(req)
	if err != nil {
		t.Fatal(err)
	}
	if resp.StatusCode != fiber.StatusBadRequest {
		t.Fatalf("expected 400, got %d", resp.StatusCode)
	}
}
