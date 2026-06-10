package dtos

type CreateBookingDTO struct {
	NannyID               string `json:"nanny_id" validate:"required,uuid4"`
	Date                  string `json:"date" validate:"required,datetime=2006-01-02"`
	StartTime             string `json:"start_time" validate:"required,datetime=15:04"`
	TimezoneOffsetMinutes int    `json:"timezone_offset_minutes" validate:"min=-840,max=840"`
	Duration              int    `json:"duration" validate:"required,min=1,max=24"`
}
