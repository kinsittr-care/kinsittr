package models

import (
	"time"

	"github.com/google/uuid"
)

type NannyReview struct {
	ID              uuid.UUID  `json:"id"`
	BookingID       uuid.UUID  `json:"booking_id"`
	NannyProfileID  uuid.UUID  `json:"nanny_profile_id"`
	ParentProfileID uuid.UUID  `json:"parent_profile_id"`
	Rating          int        `json:"rating"`
	Comment         string     `json:"comment"`
	IsVisible       bool       `json:"is_visible"`
	FlaggedAt       *time.Time `json:"flagged_at,omitempty"`
	FlaggedBy       *uuid.UUID `json:"flagged_by,omitempty"`
	FlagReason      *string    `json:"flag_reason,omitempty"`
	ReviewedByAdmin bool       `json:"reviewed_by_admin"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

type ParentReview struct {
	ID              uuid.UUID  `json:"id"`
	BookingID       uuid.UUID  `json:"booking_id"`
	ParentProfileID uuid.UUID  `json:"parent_profile_id"`
	NannyProfileID  uuid.UUID  `json:"nanny_profile_id"`
	Rating          int        `json:"rating"`
	Comment         string     `json:"comment"`
	IsVisible       bool       `json:"is_visible"`
	FlaggedAt       *time.Time `json:"flagged_at,omitempty"`
	FlaggedBy       *uuid.UUID `json:"flagged_by,omitempty"`
	FlagReason      *string    `json:"flag_reason,omitempty"`
	ReviewedByAdmin bool       `json:"reviewed_by_admin"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

type AdminReviewActionType string

const (
	AdminFlagReviewAction   AdminReviewActionType = "flag"
	AdminUnflagReviewAction AdminReviewActionType = "unflag"
)

type AdminReviewAction struct {
	ID          uuid.UUID             `json:"id"`
	ReviewID    uuid.UUID             `json:"review_id"`
	AdminUserID *uuid.UUID            `json:"admin_user_id,omitempty"`
	Action      AdminReviewActionType `json:"action"`
	Reason      string                `json:"reason"`
	CreatedAt   time.Time             `json:"created_at"`
}
