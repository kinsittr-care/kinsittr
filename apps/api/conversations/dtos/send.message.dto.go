package dtos

type SendMessageDTO struct {
	Body string `json:"body" validate:"required,max=5000"`
}
