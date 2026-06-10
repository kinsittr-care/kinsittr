package dtos

type RegisterParentDTO struct {
	Firstname string `json:"firstname" validate:"required,min=2,max=100"`
	Lastname  string `json:"lastname" validate:"required,min=2,max=100"`
	Email     string `json:"email" validate:"required,email,max=255"`
	Password  string `json:"password" validate:"required,min=8,max=72"`
}

type RegisterNannyDTO struct {
	Firstname string `json:"firstname" validate:"required,min=2,max=100"`
	Lastname  string `json:"lastname" validate:"required,min=2,max=100"`
	Email     string `json:"email" validate:"required,email,max=255"`
	Password  string `json:"password" validate:"required,min=8,max=72"`
}
