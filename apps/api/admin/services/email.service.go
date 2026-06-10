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

func (s *EmailService) SendAdminInvite(
	ctx context.Context,
	email string,
	firstname string,
	inviteLink string,
	expiresAt string,
) error {
	return s.provider.Send(ctx, mail.Message{
		ToEmail: email,
		Subject: "You have been invited to KinSittr Admin",
		TextContent: fmt.Sprintf(
			"Hi %s,\n\nYou have been invited to KinSittr Admin.\n\nAccept your invite here: %s\n\nThis invite expires %s. After accepting, sign in with the password you created.",
			firstname,
			inviteLink,
			expiresAt,
		),
		HTMLContent: fmt.Sprintf(
			"<p>Hi %s,</p><p>You have been invited to KinSittr Admin.</p><p><a href=\"%s\">Accept your invite</a></p><p>This invite expires %s. After accepting, sign in with the password you created.</p>",
			html.EscapeString(firstname),
			html.EscapeString(inviteLink),
			html.EscapeString(expiresAt),
		),
	})
}
