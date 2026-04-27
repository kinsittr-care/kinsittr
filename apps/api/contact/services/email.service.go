package services

import (
	"context"
	"fmt"

	"github.com/kinsittr/kinsittr-api/shared/mail"
)

type EmailService struct {
	provider mail.Provider
}

func NewEmailService(provider mail.Provider) *EmailService {
	return &EmailService{provider: provider}
}

func (s *EmailService) SendContactMessage(
	ctx context.Context,
	toEmail string,
	firstName string,
	lastName string,
	fromEmail string,
	role string,
	subject string,
	message string,
) error {
	fullName := firstName + " " + lastName

	return s.provider.Send(ctx, mail.Message{
		ToEmail: toEmail,
		ReplyTo: fromEmail,
		Subject: fmt.Sprintf("KinSittr contact form: %s", subject),
		TextContent: fmt.Sprintf(
			"New contact form submission\n\nName: %s\nEmail: %s\nRole: %s\nSubject: %s\n\nMessage:\n%s",
			fullName,
			fromEmail,
			role,
			subject,
			message,
		),
		HTMLContent: fmt.Sprintf(
			"<h2>New contact form submission</h2><p><strong>Name:</strong> %s</p><p><strong>Email:</strong> %s</p><p><strong>Role:</strong> %s</p><p><strong>Subject:</strong> %s</p><p><strong>Message:</strong></p><p>%s</p>",
			fullName,
			fromEmail,
			role,
			subject,
			message,
		),
	})
}
