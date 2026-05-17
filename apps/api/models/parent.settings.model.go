package models

import (
	"time"

	"github.com/google/uuid"
)

type ParentSettings struct {
	ID                 uuid.UUID `json:"id"`
	UserID             uuid.UUID `json:"user_id"`
	NotifyMessages     bool      `json:"notify_messages"`
	NotifyBookings     bool      `json:"notify_bookings"`
	NotifyReminders    bool      `json:"notify_reminders"`
	NotifyWeeklyDigest bool      `json:"notify_weekly_digest"`
	ShowProfile        bool      `json:"show_profile"`
	ShareReviews       bool      `json:"share_reviews"`
	Analytics          bool      `json:"analytics"`
	Language           string    `json:"language"`
	Currency           string    `json:"currency"`
	Timezone           string    `json:"timezone"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}
