package dtos

type ChangePasswordDTO struct {
	CurrentPassword string `json:"current_password" validate:"required,min=8"`
	NewPassword     string `json:"new_password" validate:"required,min=8"`
}

type DeactivateAccountDTO struct {
	Password string `json:"password" validate:"required,min=8"`
}
