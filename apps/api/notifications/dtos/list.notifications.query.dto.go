package dtos

type ListNotificationsQueryDTO struct {
	Page       int  `query:"page"`
	Limit      int  `query:"limit"`
	UnreadOnly bool `query:"unread_only"`
}
