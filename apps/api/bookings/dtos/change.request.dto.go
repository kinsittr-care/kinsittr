package dtos

type CreateBookingChangeRequestDTO struct {
	Type                  string `json:"type" validate:"required,oneof=reschedule cancel"`
	Date                  string `json:"date" validate:"omitempty,datetime=2006-01-02"`
	StartTime             string `json:"start_time" validate:"omitempty,datetime=15:04"`
	TimezoneOffsetMinutes int    `json:"timezone_offset_minutes"`
	Duration              int    `json:"duration" validate:"omitempty,min=1,max=24"`
	Reason                string `json:"reason" validate:"required,max=500"`
}

type ResolveBookingChangeRequestDTO struct {
	ResponseNote string `json:"response_note" validate:"omitempty,max=500"`
}
