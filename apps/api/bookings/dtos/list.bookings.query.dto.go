package dtos

type ListBookingsQueryDTO struct {
	Page     int    `query:"page"`
	Limit    int    `query:"limit"`
	Status   string `query:"status"`
	DateFrom string `query:"date_from"`
	DateTo   string `query:"date_to"`
}
