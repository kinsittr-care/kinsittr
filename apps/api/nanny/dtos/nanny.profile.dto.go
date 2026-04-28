package dtos

type GetNannyProfileDTO struct{}

type UpdateNannyProfileDTO struct {
	DisplayName string  `json:"display_name" validate:"required,min=2,max=100"`
	Bio         string  `json:"bio" validate:"required,min=10,max=1000"`
	RatePerHour float64 `json:"rate_per_hour" validate:"required,gt=0"`
	City        string  `json:"city" validate:"required,min=2,max=100"`
	Province    string  `json:"province" validate:"required,min=2,max=100"`
}
