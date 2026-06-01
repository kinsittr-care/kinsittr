package dtos

type RecoveryRequestDTO struct {
	Email string `json:"email" validate:"required,email,max=255"`
}

type RecoveryVerifyDTO struct {
	Token string `json:"token" validate:"required,min=32,max=256"`
}

type RecoveryResetDTO struct {
	Token       string `json:"token" validate:"required,min=32,max=256"`
	NewPassword string `json:"new_password" validate:"required,min=8,max=72"`
}
