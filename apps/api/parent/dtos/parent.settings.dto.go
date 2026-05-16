package dtos

type UpdateParentSettingsDTO struct {
	NotifyMessages     bool   `json:"notify_messages"`
	NotifyBookings     bool   `json:"notify_bookings"`
	NotifyReminders    bool   `json:"notify_reminders"`
	NotifyWeeklyDigest bool   `json:"notify_weekly_digest"`
	ShowProfile        bool   `json:"show_profile"`
	ShareReviews       bool   `json:"share_reviews"`
	Analytics          bool   `json:"analytics"`
	Language           string `json:"language" validate:"required,min=2,max=50"`
	Currency           string `json:"currency" validate:"required,min=3,max=20"`
	Timezone           string `json:"timezone" validate:"required,min=2,max=100"`
}
