package token

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/models"
)

const testSecret = "test-secret-key-for-unit-tests"

func TestGenerateAccessToken(t *testing.T) {
	userID := uuid.New()

	t.Run("returns non-empty token string", func(t *testing.T) {
		tok, err := GenerateAccessToken(userID, models.ParentUserRole, testSecret)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if tok == "" {
			t.Error("expected non-empty token")
		}
	})

	t.Run("different users produce different tokens", func(t *testing.T) {
		tok1, _ := GenerateAccessToken(userID, models.ParentUserRole, testSecret)
		tok2, _ := GenerateAccessToken(uuid.New(), models.ParentUserRole, testSecret)
		if tok1 == tok2 {
			t.Error("expected different tokens for different user IDs")
		}
	})

	t.Run("different secrets produce different tokens", func(t *testing.T) {
		tok1, _ := GenerateAccessToken(userID, models.ParentUserRole, "secret-a")
		tok2, _ := GenerateAccessToken(userID, models.ParentUserRole, "secret-b")
		if tok1 == tok2 {
			t.Error("expected different tokens for different secrets")
		}
	})
}

func TestGenerateRefreshToken(t *testing.T) {
	userID := uuid.New()
	sessionID := uuid.New()

	t.Run("returns non-empty token string", func(t *testing.T) {
		tok, err := GenerateRefreshToken(userID, models.NannyUserRole, sessionID, testSecret)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if tok == "" {
			t.Error("expected non-empty token")
		}
	})

	t.Run("different session IDs produce different tokens", func(t *testing.T) {
		tok1, _ := GenerateRefreshToken(userID, models.NannyUserRole, uuid.New(), testSecret)
		tok2, _ := GenerateRefreshToken(userID, models.NannyUserRole, uuid.New(), testSecret)
		if tok1 == tok2 {
			t.Error("expected different tokens for different session IDs")
		}
	})
}

func TestValidateToken(t *testing.T) {
	userID := uuid.New()

	t.Run("valid access token parses correctly", func(t *testing.T) {
		tok, err := GenerateAccessToken(userID, models.ParentUserRole, testSecret)
		if err != nil {
			t.Fatalf("generate error: %v", err)
		}
		claims, err := ValidateToken(tok, testSecret)
		if err != nil {
			t.Fatalf("validate error: %v", err)
		}
		if claims.UserID != userID {
			t.Errorf("UserID: got %s, want %s", claims.UserID, userID)
		}
		if claims.Role != models.ParentUserRole {
			t.Errorf("Role: got %s, want %s", claims.Role, models.ParentUserRole)
		}
	})

	t.Run("valid refresh token includes session ID", func(t *testing.T) {
		sessionID := uuid.New()
		tok, err := GenerateRefreshToken(userID, models.NannyUserRole, sessionID, testSecret)
		if err != nil {
			t.Fatalf("generate error: %v", err)
		}
		claims, err := ValidateToken(tok, testSecret)
		if err != nil {
			t.Fatalf("validate error: %v", err)
		}
		if claims.SessionID != sessionID {
			t.Errorf("SessionID: got %s, want %s", claims.SessionID, sessionID)
		}
		if claims.Role != models.NannyUserRole {
			t.Errorf("Role: got %s, want %s", claims.Role, models.NannyUserRole)
		}
	})

	t.Run("wrong secret returns error", func(t *testing.T) {
		tok, _ := GenerateAccessToken(userID, models.ParentUserRole, testSecret)
		if _, err := ValidateToken(tok, "wrong-secret"); err == nil {
			t.Error("expected error for wrong secret")
		}
	})

	t.Run("tampered token returns error", func(t *testing.T) {
		tok, _ := GenerateAccessToken(userID, models.ParentUserRole, testSecret)
		if _, err := ValidateToken(tok+"x", testSecret); err == nil {
			t.Error("expected error for tampered token")
		}
	})

	t.Run("malformed token returns error", func(t *testing.T) {
		if _, err := ValidateToken("not.a.jwt", testSecret); err == nil {
			t.Error("expected error for malformed token")
		}
	})

	t.Run("access token expiry is ~15 minutes from now", func(t *testing.T) {
		tok, _ := GenerateAccessToken(userID, models.ParentUserRole, testSecret)
		claims, err := ValidateToken(tok, testSecret)
		if err != nil {
			t.Fatalf("validate error: %v", err)
		}
		exp := claims.ExpiresAt.Time
		remaining := time.Until(exp)
		if remaining < 14*time.Minute || remaining > 16*time.Minute {
			t.Errorf("expected ~15m expiry, got %v remaining", remaining)
		}
	})

	t.Run("refresh token expiry is ~7 days from now", func(t *testing.T) {
		tok, _ := GenerateRefreshToken(userID, models.ParentUserRole, uuid.New(), testSecret)
		claims, err := ValidateToken(tok, testSecret)
		if err != nil {
			t.Fatalf("validate error: %v", err)
		}
		exp := claims.ExpiresAt.Time
		remaining := time.Until(exp)
		sevenDays := 7 * 24 * time.Hour
		if remaining < sevenDays-time.Minute || remaining > sevenDays+time.Minute {
			t.Errorf("expected ~7d expiry, got %v remaining", remaining)
		}
	})
}
