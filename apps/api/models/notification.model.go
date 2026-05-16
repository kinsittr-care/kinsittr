package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type NotificationType string

const (
	BookingRequestedNotificationType       NotificationType = "booking_requested"
	BookingApprovedNotificationType        NotificationType = "booking_approved"
	BookingDeclinedNotificationType        NotificationType = "booking_declined"
	BookingCancelledNotificationType       NotificationType = "booking_cancelled"
	BookingCompletedNotificationType       NotificationType = "booking_completed"
	BookingChangeRequestedNotificationType NotificationType = "booking_change_requested"
	BookingChangeAcceptedNotificationType  NotificationType = "booking_change_accepted"
	BookingChangeDeclinedNotificationType  NotificationType = "booking_change_declined"
	MessageReceivedNotificationType        NotificationType = "message_received"
)

type Notification struct {
	ID        uuid.UUID        `json:"id"`
	UserID    uuid.UUID        `json:"user_id"`
	Role      UserRole         `json:"role"`
	Type      NotificationType `json:"type"`
	Title     string           `json:"title"`
	Body      string           `json:"body"`
	Data      json.RawMessage  `json:"data,omitempty"`
	ReadAt    *time.Time       `json:"read_at,omitempty"`
	CreatedAt time.Time        `json:"created_at"`
}
