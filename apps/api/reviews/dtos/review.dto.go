package dtos

type CreateReviewDTO struct {
	Rating  int    `json:"rating" validate:"required,min=1,max=5"`
	Comment string `json:"comment" validate:"required,min=1,max=1000"`
}

type AdminReviewActionDTO struct {
	Reason string `json:"reason" validate:"required,min=1,max=500"`
}

type ListReviewsQueryDTO struct {
	Page     int    `query:"page"`
	Limit    int    `query:"limit"`
	Target   string `query:"target"`
	Search   string `query:"search"`
	Flagged  *bool  `query:"flagged"`
	Visible  *bool  `query:"visible"`
	NannyID  string `query:"nanny_id"`
	ParentID string `query:"parent_id"`
	Rating   int    `query:"rating"`
	DateFrom string `query:"date_from"`
	DateTo   string `query:"date_to"`
}
