package pipes

import (
	"strings"
	"time"

	"github.com/kinsittr/kinsittr-api/models"
	"github.com/kinsittr/kinsittr-api/repositories/profile"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

type ParentProfileData struct {
	ID           string    `json:"id"`
	DisplayName  string    `json:"display_name"`
	Phone        string    `json:"phone"`
	NumChildren  int       `json:"num_children"`
	ChildrenAges []int     `json:"children_ages"`
	City         string    `json:"city"`
	Province     string    `json:"province"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type ParentSettingsData struct {
	ID                 string    `json:"id"`
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

type ParentPipe struct {
	profileRepo profile.ProfileRepository
}

func NewParentPipe(profileRepo profile.ProfileRepository) *ParentPipe {
	return &ParentPipe{profileRepo: profileRepo}
}

func pipeError[T any](message string) *shared.PipeRes[T] {
	return &shared.PipeRes[T]{
		Success: false,
		Message: shared.CreatePipeMessage(message),
	}
}

func pipeSuccess[T any](message string, data *T) *shared.PipeRes[T] {
	return &shared.PipeRes[T]{
		Success: true,
		Message: shared.CreatePipeMessage(message),
		Data:    data,
	}
}

func normalizeString(value string) string {
	return strings.TrimSpace(value)
}

func normalizeLocationString(value string) string {
	return strings.ToLower(strings.Join(strings.Fields(value), " "))
}

func parentProfileData(profile models.ParentProfile) ParentProfileData {
	return ParentProfileData{
		ID:           profile.ID.String(),
		DisplayName:  profile.DisplayName,
		Phone:        profile.Phone,
		NumChildren:  profile.NumChildren,
		ChildrenAges: append([]int(nil), profile.ChildrenAges...),
		City:         profile.City,
		Province:     profile.Province,
		CreatedAt:    profile.CreatedAt,
		UpdatedAt:    profile.UpdatedAt,
	}
}

func parentSettingsData(settings models.ParentSettings) ParentSettingsData {
	return ParentSettingsData{
		ID:                 settings.ID.String(),
		NotifyMessages:     settings.NotifyMessages,
		NotifyBookings:     settings.NotifyBookings,
		NotifyReminders:    settings.NotifyReminders,
		NotifyWeeklyDigest: settings.NotifyWeeklyDigest,
		ShowProfile:        settings.ShowProfile,
		ShareReviews:       settings.ShareReviews,
		Analytics:          settings.Analytics,
		Language:           settings.Language,
		Currency:           settings.Currency,
		Timezone:           settings.Timezone,
		CreatedAt:          settings.CreatedAt,
		UpdatedAt:          settings.UpdatedAt,
	}
}
