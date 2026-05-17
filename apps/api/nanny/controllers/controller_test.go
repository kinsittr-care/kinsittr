package controllers

import (
	"context"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/models"
	"github.com/kinsittr/kinsittr-api/nanny/messages"
	"github.com/kinsittr/kinsittr-api/nanny/pipes"
	nannyrepo "github.com/kinsittr/kinsittr-api/repositories/nanny"
)

type mockNannyRepo struct {
	nanny        models.NannyProfile
	nannies      []models.NannyProfile
	nanniesTotal int
}

func (m *mockNannyRepo) GetVerifiedNannyByID(_ context.Context, _ uuid.UUID) (models.NannyProfile, error) {
	return m.nanny, nil
}
func (m *mockNannyRepo) ListVerifiedNannies(_ context.Context, _ nannyrepo.ListVerifiedNanniesFilter) ([]models.NannyProfile, int, error) {
	return m.nannies, m.nanniesTotal, nil
}

type mockNannyProfileRepo struct {
	nannyProfile models.NannyProfile
	updatedNanny models.NannyProfile
}

func (m *mockNannyProfileRepo) CreateNannyProfile(_ context.Context, p models.NannyProfile) (models.NannyProfile, error) {
	return p, nil
}
func (m *mockNannyProfileRepo) CreateParentProfile(_ context.Context, p models.ParentProfile) (models.ParentProfile, error) {
	return p, nil
}
func (m *mockNannyProfileRepo) GetNannyProfileByUserID(_ context.Context, _ uuid.UUID) (models.NannyProfile, error) {
	return m.nannyProfile, nil
}
func (m *mockNannyProfileRepo) GetParentProfileByUserID(_ context.Context, _ uuid.UUID) (models.ParentProfile, error) {
	return models.ParentProfile{}, nil
}
func (m *mockNannyProfileRepo) UpdateNannyProfile(_ context.Context, _ models.NannyProfile) (models.NannyProfile, error) {
	return m.updatedNanny, nil
}
func (m *mockNannyProfileRepo) UpdateParentProfile(_ context.Context, p models.ParentProfile) (models.ParentProfile, error) {
	return p, nil
}
func (m *mockNannyProfileRepo) GetOrCreateParentSettings(_ context.Context, userID uuid.UUID) (models.ParentSettings, error) {
	return models.ParentSettings{ID: uuid.New(), UserID: userID}, nil
}
func (m *mockNannyProfileRepo) UpdateParentSettings(_ context.Context, settings models.ParentSettings) (models.ParentSettings, error) {
	if settings.ID == uuid.Nil {
		settings.ID = uuid.New()
	}
	return settings, nil
}
func (m *mockNannyProfileRepo) DeleteNannyProfile(_ context.Context, _ uuid.UUID) error  { return nil }
func (m *mockNannyProfileRepo) DeleteParentProfile(_ context.Context, _ uuid.UUID) error { return nil }

func nannyController(repo *mockNannyRepo, profileRepo *mockNannyProfileRepo) *NannyController {
	return NewNannyController(pipes.NewNannyPipe(repo, profileRepo))
}

func nannyTestApp(controller *NannyController, role models.UserRole) *fiber.App {
	app := fiber.New()
	app.Use(func(c *fiber.Ctx) error {
		c.Locals("auth.user_id", uuid.New())
		c.Locals("auth.role", role)
		return c.Next()
	})
	app.Get("/nannies", controller.ListPublic)
	app.Get("/nannies/:id", controller.GetPublicByID)
	app.Get("/profile", controller.GetOwnProfile)
	app.Patch("/profile", controller.UpdateOwnProfile)
	return app
}

func TestNannyControllerPublicRoutes(t *testing.T) {
	nanny := models.NannyProfile{ID: uuid.New(), DisplayName: "Jane", VerificationStatus: models.VerifiedVerificationStatus}
	controller := nannyController(&mockNannyRepo{nanny: nanny, nannies: []models.NannyProfile{nanny}, nanniesTotal: 1}, &mockNannyProfileRepo{})

	resp, err := nannyTestApp(controller, models.ParentUserRole).Test(httptest.NewRequest(fiber.MethodGet, "/nannies", nil))
	if err != nil {
		t.Fatal(err)
	}
	if resp.StatusCode != fiber.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}

	resp, err = nannyTestApp(controller, models.ParentUserRole).Test(httptest.NewRequest(fiber.MethodGet, "/nannies/not-a-uuid", nil))
	if err != nil {
		t.Fatal(err)
	}
	if resp.StatusCode != fiber.StatusBadRequest {
		t.Fatalf("expected 400 %s, got %d", messages.Invalid_Nanny_ID, resp.StatusCode)
	}
}

func TestNannyControllerOwnProfileAuthAndValidation(t *testing.T) {
	profile := models.NannyProfile{ID: uuid.New(), DisplayName: "Jane"}
	controller := nannyController(&mockNannyRepo{}, &mockNannyProfileRepo{
		nannyProfile: profile,
		updatedNanny: models.NannyProfile{ID: uuid.New(), DisplayName: "Jane Doe"},
	})

	resp, err := nannyTestApp(controller, models.ParentUserRole).Test(httptest.NewRequest(fiber.MethodGet, "/profile", nil))
	if err != nil {
		t.Fatal(err)
	}
	if resp.StatusCode != fiber.StatusForbidden {
		t.Fatalf("expected 403 %s, got %d", messages.Forbidden_Profile, resp.StatusCode)
	}

	req := httptest.NewRequest(fiber.MethodPatch, "/profile", strings.NewReader(`{"display_name":"J"}`))
	req.Header.Set("Content-Type", "application/json")
	resp, err = nannyTestApp(controller, models.NannyUserRole).Test(req)
	if err != nil {
		t.Fatal(err)
	}
	if resp.StatusCode != fiber.StatusBadRequest {
		t.Fatalf("expected 400, got %d", resp.StatusCode)
	}
}
