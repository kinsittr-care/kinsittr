package pipes

import (
	"context"
	"strings"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/admin/dtos"
	adminservices "github.com/kinsittr/kinsittr-api/admin/services"
	"github.com/kinsittr/kinsittr-api/models"
	"github.com/kinsittr/kinsittr-api/shared/mail"
)

type captureMailProvider struct {
	message mail.Message
}

func (p *captureMailProvider) Send(_ context.Context, message mail.Message) error {
	p.message = message
	return nil
}

func TestAdminInviteSendsEmailWhenConfigured(t *testing.T) {
	expiresAt := time.Now().UTC().Add(72 * time.Hour)
	repo := &mockAdminRepo{
		invite: models.AdminInvite{
			ID:        uuid.New(),
			Firstname: "Ada",
			Lastname:  "Lovelace",
			Email:     "ada@example.com",
			ExpiresAt: expiresAt,
			CreatedAt: time.Now().UTC(),
		},
	}
	provider := &captureMailProvider{}
	pipe := NewAdminPipe(repo, 0.10)
	pipe.SetInviteEmailService(adminservices.NewEmailService(provider), "https://kinsittr.test")

	res := pipe.InviteAdmin(context.Background(), uuid.New(), dtos.InviteAdminDTO{
		Firstname: " Ada ",
		Lastname:  " Lovelace ",
		Email:     " ADA@EXAMPLE.COM ",
	})

	if !res.Success {
		t.Fatalf("expected invite success, got message=%s", res.Message)
	}
	if provider.message.ToEmail != "ada@example.com" {
		t.Fatalf("expected invite email to normalized address, got %q", provider.message.ToEmail)
	}
	if !strings.Contains(provider.message.TextContent, "https://kinsittr.test/auth/admin/accept-invite?token=") {
		t.Fatalf("expected invite link in email text, got %q", provider.message.TextContent)
	}
	if res.Data == nil || res.Data.Token == "" {
		t.Fatal("expected invite token fallback in response")
	}
	if repo.createInviteParams.Email != "ada@example.com" {
		t.Fatalf("expected normalized repository email, got %q", repo.createInviteParams.Email)
	}
}
