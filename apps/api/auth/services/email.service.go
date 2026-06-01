package services

import (
	"context"
	"fmt"
	"html"

	"github.com/kinsittr/kinsittr-api/shared/mail"
)

type EmailService struct {
	provider mail.Provider
}

func NewEmailService(provider mail.Provider) *EmailService {
	return &EmailService{provider: provider}
}

func (s *EmailService) SendPasswordRecovery(ctx context.Context, email string, firstname string, recoveryLink string) error {
	return s.provider.Send(ctx, mail.Message{
		ToEmail: email,
		Subject: "Reset your KinSittr password",
		TextContent: fmt.Sprintf(
			"Hi %s,\n\nWe received a request to reset your KinSittr password.\n\nReset your password here: %s\n\nThis link expires soon. If you did not request this, you can ignore this email.",
			firstname,
			recoveryLink,
		),
		HTMLContent: fmt.Sprintf(
			"<p>Hi %s,</p><p>We received a request to reset your KinSittr password.</p><p><a href=\"%s\">Reset your password</a></p><p>This link expires soon. If you did not request this, you can ignore this email.</p>",
			html.EscapeString(firstname),
			html.EscapeString(recoveryLink),
		),
	})
}
