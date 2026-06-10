package dtos

type ListConversationsQueryDTO struct {
	Page  int `query:"page"`
	Limit int `query:"limit"`
}

type ListMessagesQueryDTO struct {
	Page  int `query:"page"`
	Limit int `query:"limit"`
}
