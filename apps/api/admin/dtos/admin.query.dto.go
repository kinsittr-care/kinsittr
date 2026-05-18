package dtos

type ListAdminNanniesQueryDTO struct {
	Page   int    `query:"page"`
	Limit  int    `query:"limit"`
	Search string `query:"search"`
	Status string `query:"status"`
	City   string `query:"city"`
}

type ListAdminParentsQueryDTO struct {
	Page   int    `query:"page"`
	Limit  int    `query:"limit"`
	Search string `query:"search"`
	City   string `query:"city"`
}

type ListAdminBookingsQueryDTO struct {
	Page     int    `query:"page"`
	Limit    int    `query:"limit"`
	Search   string `query:"search"`
	Status   string `query:"status"`
	DateFrom string `query:"date_from"`
	DateTo   string `query:"date_to"`
}

type ListAdminConversationsQueryDTO struct {
	Page   int    `query:"page"`
	Limit  int    `query:"limit"`
	Search string `query:"search"`
	Status string `query:"status"`
}

type ListAdminMessagesQueryDTO struct {
	Page  int `query:"page"`
	Limit int `query:"limit"`
}

type AdminBookingActionDTO struct {
	Reason string `json:"reason"`
}

type AdminNannyActionDTO struct {
	Reason string `json:"reason"`
}

type AdminAccountActionDTO struct {
	Reason string `json:"reason"`
}

type AdminConversationActionDTO struct {
	Reason string `json:"reason"`
}

type InviteAdminDTO struct {
	Firstname string `json:"firstname"`
	Lastname  string `json:"lastname"`
	Email     string `json:"email"`
	Password  string `json:"password"`
}

type AdminAnalyticsQueryDTO struct {
	DateFrom        string `query:"date_from"`
	DateTo          string `query:"date_to"`
	Bucket          string `query:"bucket"`
	CityLimit       int    `query:"city_limit"`
	TopNanniesLimit int    `query:"top_nannies_limit"`
}
