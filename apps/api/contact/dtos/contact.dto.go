package dtos

type ContactDTO struct {
	FirstName string `json:"firstName" validate:"required,min=2,max=100"`
	LastName  string `json:"lastName" validate:"required,min=2,max=100"`
	Email     string `json:"email" validate:"required,email,max=255"`
	Role      string `json:"role" validate:"required,max=100"`
	Subject   string `json:"subject" validate:"required,max=150"`
	Message   string `json:"message" validate:"required,min=10,max=5000"`
}
