package dtos

type GetNannyProfileDTO struct{}

type UpdateNannyProfileDTO struct {
	DisplayName string   `json:"display_name" validate:"required,min=2,max=100"`
	Phone       string   `json:"phone" validate:"required,min=7,max=20"`
	Bio         string   `json:"bio" validate:"required,min=10,max=1000"`
	Specialties []string `json:"specialties" validate:"max=10,dive,min=2,max=50"`
	RatePerHour float64  `json:"rate_per_hour" validate:"required,gt=0"`
	City        string   `json:"city" validate:"required,min=2,max=100"`
	Province    string   `json:"province" validate:"required,min=2,max=100"`
}
