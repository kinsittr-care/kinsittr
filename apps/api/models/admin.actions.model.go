package models

import (
	"time"

	"github.com/google/uuid"
)

type AdminBookingActionType string

const (
	AdminCancelBookingAction   AdminBookingActionType = "cancel"
	AdminCompleteBookingAction AdminBookingActionType = "complete"
)

type AdminNannyActionType string

const (
	AdminVerifyNannyAction      AdminNannyActionType = "verify"
	AdminRejectNannyAction      AdminNannyActionType = "reject"
	AdminResetNannyAction       AdminNannyActionType = "reset"
	AdminUnderReviewNannyAction AdminNannyActionType = "under_review"
)

type AdminConversationActionType string

const (
	AdminLockConversationAction   AdminConversationActionType = "lock"
	AdminUnlockConversationAction AdminConversationActionType = "unlock"
	AdminHideMessageAction        AdminConversationActionType = "hide_message"
)

type AdminAccountActionType string

const (
	AdminSuspendAccountAction AdminAccountActionType = "suspend"
)

type AdminBookingAction struct {
	ID             uuid.UUID              `json:"id"`
	BookingID      uuid.UUID              `json:"booking_id"`
	AdminUserID    *uuid.UUID             `json:"admin_user_id,omitempty"`
	Action         AdminBookingActionType `json:"action"`
	PreviousStatus BookingStatus          `json:"previous_status"`
	NewStatus      BookingStatus          `json:"new_status"`
	Reason         string                 `json:"reason"`
	CreatedAt      time.Time              `json:"created_at"`
}

type AdminNannyAction struct {
	ID             uuid.UUID            `json:"id"`
	NannyProfileID uuid.UUID            `json:"nanny_profile_id"`
	AdminUserID    *uuid.UUID           `json:"admin_user_id,omitempty"`
	Action         AdminNannyActionType `json:"action"`
	PreviousStatus VerificationStatus   `json:"previous_status"`
	NewStatus      VerificationStatus   `json:"new_status"`
	Reason         string               `json:"reason,omitempty"`
	CreatedAt      time.Time            `json:"created_at"`
}

type AdminConversationAction struct {
	ID             uuid.UUID                   `json:"id"`
	ConversationID uuid.UUID                   `json:"conversation_id"`
	MessageID      *uuid.UUID                  `json:"message_id,omitempty"`
	AdminUserID    *uuid.UUID                  `json:"admin_user_id,omitempty"`
	Action         AdminConversationActionType `json:"action"`
	Reason         string                      `json:"reason"`
	CreatedAt      time.Time                   `json:"created_at"`
}

type AdminAccountAction struct {
	ID              uuid.UUID              `json:"id"`
	TargetUserID    uuid.UUID              `json:"target_user_id"`
	TargetProfileID uuid.UUID              `json:"target_profile_id"`
	TargetRole      UserRole               `json:"target_role"`
	AdminUserID     *uuid.UUID             `json:"admin_user_id,omitempty"`
	Action          AdminAccountActionType `json:"action"`
	Reason          string                 `json:"reason"`
	CreatedAt       time.Time              `json:"created_at"`
}
