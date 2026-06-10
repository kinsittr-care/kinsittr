package dtos

type LoginDTO struct {
	Email    string `json:"email"    validate:"required,email,max=255"`
	Password string `json:"password" validate:"required,min=8,max=72"`
}

type RefreshDTO struct {
	RefreshToken string `json:"refresh_token" validate:"required"`
}
