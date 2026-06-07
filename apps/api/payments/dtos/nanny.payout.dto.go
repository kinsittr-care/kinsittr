package dtos

type UpdateNannyPayoutSettingsDTO struct {
	Schedule string `json:"schedule" validate:"required,oneof=daily weekly"`
}
