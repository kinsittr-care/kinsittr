package pipes

import (
	"context"
	"errors"
	"testing"

	"github.com/kinsittr/kinsittr-api/contact/dtos"
	"github.com/kinsittr/kinsittr-api/contact/messages"
	"github.com/kinsittr/kinsittr-api/contact/services"
	"github.com/kinsittr/kinsittr-api/shared/mail"
)

// ── mock mail provider ────────────────────────────────────────────────────────

type mockMailProvider struct {
	err      error
	lastMsg  mail.Message
}

func (m *mockMailProvider) Send(_ context.Context, msg mail.Message) error {
	m.lastMsg = msg
	return m.err
}

// ── normalizeContactDTO ───────────────────────────────────────────────────────

func TestNormalizeContactDTO(t *testing.T) {
	raw := dtos.ContactDTO{
		FirstName: "  Alice  ",
		LastName:  "  Smith  ",
		Email:     "  ALICE@EXAMPLE.COM  ",
		Role:      "  parent  ",
		Subject:   "  Hello  ",
		Message:   "  Some message here.  ",
	}
	got := normalizeContactDTO(raw)

	if got.FirstName != "Alice" {
		t.Errorf("FirstName: got %q, want %q", got.FirstName, "Alice")
	}
	if got.LastName != "Smith" {
		t.Errorf("LastName: got %q, want %q", got.LastName, "Smith")
	}
	if got.Email != "alice@example.com" {
		t.Errorf("Email: got %q, want %q (should be lowercased and trimmed)", got.Email, "alice@example.com")
	}
	if got.Role != "parent" {
		t.Errorf("Role: got %q, want %q", got.Role, "parent")
	}
	if got.Subject != "Hello" {
		t.Errorf("Subject: got %q, want %q", got.Subject, "Hello")
	}
	if got.Message != "Some message here." {
		t.Errorf("Message: got %q, want %q", got.Message, "Some message here.")
	}
}

// ── SendContactMessage ────────────────────────────────────────────────────────

func TestSendContactMessage(t *testing.T) {
	validDTO := dtos.ContactDTO{
		FirstName: "Alice",
		LastName:  "Smith",
		Email:     "alice@example.com",
		Role:      "parent",
		Subject:   "Test subject",
		Message:   "Hello from the test.",
	}

	t.Run("email provider error returns failure", func(t *testing.T) {
		provider := &mockMailProvider{err: errors.New("smtp error")}
		emailSvc := services.NewEmailService(provider)
		pipe := NewContactPipe(emailSvc, "support@kinsittr.com")

		res := pipe.SendContactMessage(context.Background(), validDTO)
		if res.Success || string(res.Message) != messages.Send_Failed {
			t.Errorf("expected %s, got success=%v msg=%s", messages.Send_Failed, res.Success, res.Message)
		}
	})

	t.Run("success returns message_sent", func(t *testing.T) {
		provider := &mockMailProvider{}
		emailSvc := services.NewEmailService(provider)
		pipe := NewContactPipe(emailSvc, "support@kinsittr.com")

		res := pipe.SendContactMessage(context.Background(), validDTO)
		if !res.Success || string(res.Message) != messages.Message_Sent {
			t.Errorf("expected success %s, got success=%v msg=%s", messages.Message_Sent, res.Success, res.Message)
		}
	})

	t.Run("email is normalised before sending", func(t *testing.T) {
		provider := &mockMailProvider{}
		emailSvc := services.NewEmailService(provider)
		pipe := NewContactPipe(emailSvc, "support@kinsittr.com")

		dto := validDTO
		dto.Email = "  ALICE@EXAMPLE.COM  "
		pipe.SendContactMessage(context.Background(), dto)

		// The provider receives the mail.Message; ReplyTo should be the normalised email
		if provider.lastMsg.ReplyTo != "alice@example.com" {
			t.Errorf("expected normalised ReplyTo, got %q", provider.lastMsg.ReplyTo)
		}
	})

	t.Run("to email is forwarded correctly", func(t *testing.T) {
		provider := &mockMailProvider{}
		emailSvc := services.NewEmailService(provider)
		toEmail := "support@kinsittr.com"
		pipe := NewContactPipe(emailSvc, toEmail)

		pipe.SendContactMessage(context.Background(), validDTO)

		if provider.lastMsg.ToEmail != toEmail {
			t.Errorf("ToEmail: got %q, want %q", provider.lastMsg.ToEmail, toEmail)
		}
	})
}
