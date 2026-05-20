package middleware

import (
	"encoding/json"
	"io"
	"net/http"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/models"
	"github.com/kinsittr/kinsittr-api/shared/token"
)

const testSecret = "middleware-test-secret"

func newApp() *fiber.App {
	app := fiber.New(fiber.Config{DisableStartupMessage: true})
	app.Use(RequireAuth(testSecret))
	app.Get("/protected", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"user_id": c.Locals("auth.user_id"),
			"role":    c.Locals("auth.role"),
		})
	})
	return app
}

func newAdminApp() *fiber.App {
	app := fiber.New(fiber.Config{DisableStartupMessage: true})
	app.Use(RequireAuth(testSecret), RequireAdmin())
	app.Get("/admin", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"user_id": c.Locals("auth.user_id"),
			"role":    c.Locals("auth.role"),
		})
	})
	return app
}

func validToken(t *testing.T, userID uuid.UUID, role models.UserRole) string {
	t.Helper()
	tok, err := token.GenerateAccessToken(userID, role, testSecret)
	if err != nil {
		t.Fatalf("failed to generate test token: %v", err)
	}
	return tok
}

func doRequest(app *fiber.App, authorization string) (*http.Response, error) {
	req, _ := http.NewRequest(http.MethodGet, "/protected", nil)
	if authorization != "" {
		req.Header.Set("Authorization", authorization)
	}
	return app.Test(req, -1)
}

// ── RequireAuth ───────────────────────────────────────────────────────────────

func TestRequireAuth(t *testing.T) {
	app := newApp()

	t.Run("missing authorization header returns 401", func(t *testing.T) {
		resp, err := doRequest(app, "")
		if err != nil {
			t.Fatalf("request error: %v", err)
		}
		if resp.StatusCode != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d", resp.StatusCode)
		}
		assertMessage(t, resp, "missing_authorization_header")
	})

	t.Run("header without Bearer scheme returns 401", func(t *testing.T) {
		resp, err := doRequest(app, "Token abc123")
		if err != nil {
			t.Fatalf("request error: %v", err)
		}
		if resp.StatusCode != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d", resp.StatusCode)
		}
		assertMessage(t, resp, "invalid_authorization_header")
	})

	t.Run("Bearer with no token returns 401", func(t *testing.T) {
		resp, err := doRequest(app, "Bearer")
		if err != nil {
			t.Fatalf("request error: %v", err)
		}
		if resp.StatusCode != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d", resp.StatusCode)
		}
	})

	t.Run("invalid token returns 401", func(t *testing.T) {
		resp, err := doRequest(app, "Bearer this.is.invalid")
		if err != nil {
			t.Fatalf("request error: %v", err)
		}
		if resp.StatusCode != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d", resp.StatusCode)
		}
		assertMessage(t, resp, "invalid_or_expired_token")
	})

	t.Run("token signed with wrong secret returns 401", func(t *testing.T) {
		tok, _ := token.GenerateAccessToken(uuid.New(), models.ParentUserRole, "other-secret")
		resp, err := doRequest(app, "Bearer "+tok)
		if err != nil {
			t.Fatalf("request error: %v", err)
		}
		if resp.StatusCode != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d", resp.StatusCode)
		}
	})

	t.Run("valid parent token passes and sets locals", func(t *testing.T) {
		userID := uuid.New()
		tok := validToken(t, userID, models.ParentUserRole)
		resp, err := doRequest(app, "Bearer "+tok)
		if err != nil {
			t.Fatalf("request error: %v", err)
		}
		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected 200, got %d", resp.StatusCode)
		}
		assertAuthPayload(t, resp, userID, models.ParentUserRole)
	})

	t.Run("valid nanny token passes", func(t *testing.T) {
		tok := validToken(t, uuid.New(), models.NannyUserRole)
		resp, err := doRequest(app, "Bearer "+tok)
		if err != nil {
			t.Fatalf("request error: %v", err)
		}
		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected 200, got %d", resp.StatusCode)
		}
		assertAuthPayload(t, resp, claimsUserID(t, tok), models.NannyUserRole)
	})

	t.Run("bearer scheme is case-insensitive", func(t *testing.T) {
		tok := validToken(t, uuid.New(), models.ParentUserRole)
		resp, err := doRequest(app, "bearer "+tok)
		if err != nil {
			t.Fatalf("request error: %v", err)
		}
		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected 200 for lowercase bearer, got %d", resp.StatusCode)
		}
	})
}

func TestRequireAdmin(t *testing.T) {
	app := newAdminApp()

	t.Run("missing token returns 401 from auth middleware", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/admin", nil)
		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("request error: %v", err)
		}
		if resp.StatusCode != http.StatusUnauthorized {
			t.Fatalf("expected 401, got %d", resp.StatusCode)
		}
		assertMessage(t, resp, "missing_authorization_header")
	})

	t.Run("parent token returns 403", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/admin", nil)
		req.Header.Set("Authorization", "Bearer "+validToken(t, uuid.New(), models.ParentUserRole))
		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("request error: %v", err)
		}
		if resp.StatusCode != http.StatusForbidden {
			t.Fatalf("expected 403, got %d", resp.StatusCode)
		}
		assertMessage(t, resp, "forbidden_access")
	})

	t.Run("nanny token returns 403", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/admin", nil)
		req.Header.Set("Authorization", "Bearer "+validToken(t, uuid.New(), models.NannyUserRole))
		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("request error: %v", err)
		}
		if resp.StatusCode != http.StatusForbidden {
			t.Fatalf("expected 403, got %d", resp.StatusCode)
		}
		assertMessage(t, resp, "forbidden_access")
	})

	t.Run("admin token passes", func(t *testing.T) {
		userID := uuid.New()
		req, _ := http.NewRequest(http.MethodGet, "/admin", nil)
		req.Header.Set("Authorization", "Bearer "+validToken(t, userID, models.AdminUserRole))
		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("request error: %v", err)
		}
		if resp.StatusCode != http.StatusOK {
			t.Fatalf("expected 200, got %d", resp.StatusCode)
		}
		assertAuthPayload(t, resp, userID, models.AdminUserRole)
	})
}

// ── helper ────────────────────────────────────────────────────────────────────

func assertMessage(t *testing.T, resp *http.Response, want string) {
	t.Helper()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatalf("failed to read body: %v", err)
	}
	var payload struct {
		Message string `json:"message"`
	}
	if err := json.Unmarshal(body, &payload); err != nil {
		t.Fatalf("failed to parse body: %v", err)
	}
	if payload.Message != want {
		t.Errorf("message: got %q, want %q", payload.Message, want)
	}
}

func assertAuthPayload(t *testing.T, resp *http.Response, wantUserID uuid.UUID, wantRole models.UserRole) {
	t.Helper()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatalf("failed to read body: %v", err)
	}
	var payload struct {
		UserID string          `json:"user_id"`
		Role   models.UserRole `json:"role"`
	}
	if err := json.Unmarshal(body, &payload); err != nil {
		t.Fatalf("failed to parse auth payload: %v", err)
	}
	if payload.UserID != wantUserID.String() {
		t.Fatalf("user_id: got %q want %q", payload.UserID, wantUserID.String())
	}
	if payload.Role != wantRole {
		t.Fatalf("role: got %q want %q", payload.Role, wantRole)
	}
}

func claimsUserID(t *testing.T, tok string) uuid.UUID {
	t.Helper()
	claims, err := token.ValidateToken(tok, testSecret)
	if err != nil {
		t.Fatalf("failed to validate token: %v", err)
	}
	return claims.UserID
}
