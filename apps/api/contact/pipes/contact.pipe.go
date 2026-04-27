package pipes

import (
	"context"
	"strings"

	"github.com/kinsittr/kinsittr-api/contact/dtos"
	"github.com/kinsittr/kinsittr-api/contact/messages"
	"github.com/kinsittr/kinsittr-api/contact/services"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

type ContactPipe struct {
	emailService *services.EmailService
	toEmail      string
}

func NewContactPipe(emailService *services.EmailService, toEmail string) *ContactPipe {
	return &ContactPipe{
		emailService: emailService,
		toEmail:      toEmail,
	}
}

func normalizeContactDTO(dto dtos.ContactDTO) dtos.ContactDTO {
	dto.FirstName = strings.TrimSpace(dto.FirstName)
	dto.LastName = strings.TrimSpace(dto.LastName)
	dto.Email = strings.TrimSpace(strings.ToLower(dto.Email))
	dto.Role = strings.TrimSpace(dto.Role)
	dto.Subject = strings.TrimSpace(dto.Subject)
	dto.Message = strings.TrimSpace(dto.Message)

	return dto
}

func (p *ContactPipe) SendContactMessage(ctx context.Context, dto dtos.ContactDTO) *shared.PipeRes[any] {
	dto = normalizeContactDTO(dto)

	if err := p.emailService.SendContactMessage(
		ctx,
		p.toEmail,
		dto.FirstName,
		dto.LastName,
		dto.Email,
		dto.Role,
		dto.Subject,
		dto.Message,
	); err != nil {
		return &shared.PipeRes[any]{
			Success: false,
			Message: shared.CreatePipeMessage(messages.Send_Failed),
		}
	}

	return &shared.PipeRes[any]{
		Success: true,
		Message: shared.CreatePipeMessage(messages.Message_Sent),
	}
}
