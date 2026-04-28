package dtos

type ListPublicNanniesQuery struct {
	Page  int `query:"page"`
	Limit int `query:"limit"`
}
