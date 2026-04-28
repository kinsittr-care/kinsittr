package dtos

type ListPublicNanniesQuery struct {
	Page        int     `query:"page"`
	Limit       int     `query:"limit"`
	City        string  `query:"city"`
	Province    string  `query:"province"`
	MinRate     float64 `query:"min_rate"`
	MaxRate     float64 `query:"max_rate"`
	ServiceType string  `query:"service_type"`
	Sort        string  `query:"sort"`
}
