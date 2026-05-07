package dtos

type CreateBookingDTO struct {
	NannyID   string `json:"nanny_id" validate:"required,uuid4"`
	Date      string `json:"date" validate:"required"`
	StartTime string `json:"start_time" validate:"required"`
	Duration  int    `json:"duration" validate:"required,min=1,max=24"`
}
