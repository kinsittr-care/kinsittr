package pipes

import (
	"context"
	"log"
	"strings"

	"github.com/kinsittr/kinsittr-api/contact/dtos"
	"github.com/kinsittr/kinsittr-api/contact/messages"
	"github.com/kinsittr/kinsittr-api/contact/services"
	shared "github.com/kinsittr/kinsittr-api/shared"
	api_logging "github.com/kinsittr/kinsittr-api/shared/logging"
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
	fromHash, fromDomain := api_logging.EmailLogFields(dto.Email)
	toHash, toDomain := api_logging.EmailLogFields(p.toEmail)

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
		log.Printf("contact_email_send_failed from_email_hash=%s from_email_domain=%s to_email_hash=%s to_email_domain=%s role=%s err=%v", fromHash, fromDomain, toHash, toDomain, dto.Role, err)
		return &shared.PipeRes[any]{
			Success: false,
			Message: shared.CreatePipeMessage(messages.Send_Failed),
		}
	}

	log.Printf("contact_email_send_success from_email_hash=%s from_email_domain=%s to_email_hash=%s to_email_domain=%s role=%s", fromHash, fromDomain, toHash, toDomain, dto.Role)
	return &shared.PipeRes[any]{
		Success: true,
		Message: shared.CreatePipeMessage(messages.Message_Sent),
	}
}
