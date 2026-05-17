package models

import (
	"time"

	"github.com/google/uuid"
)

type BookingChangeRequestType string

const (
	RescheduleBookingChangeRequestType BookingChangeRequestType = "reschedule"
	CancelBookingChangeRequestType     BookingChangeRequestType = "cancel"
)

type BookingChangeRequestStatus string

const (
	PendingBookingChangeRequestStatus  BookingChangeRequestStatus = "pending"
	AcceptedBookingChangeRequestStatus BookingChangeRequestStatus = "accepted"
	DeclinedBookingChangeRequestStatus BookingChangeRequestStatus = "declined"
)

type BookingChangeRequest struct {
	ID                uuid.UUID                  `json:"id"`
	BookingID         uuid.UUID                  `json:"booking_id"`
	RequestedByUserID uuid.UUID                  `json:"requested_by_user_id"`
	RequestedByRole   UserRole                   `json:"requested_by_role"`
	Type              BookingChangeRequestType   `json:"type"`
	Status            BookingChangeRequestStatus `json:"status"`
	ProposedDate      *time.Time                 `json:"proposed_date,omitempty"`
	ProposedStartTime *time.Time                 `json:"proposed_start_time,omitempty"`
	ProposedDuration  *int                       `json:"proposed_duration,omitempty"`
	Reason            string                     `json:"reason"`
	ResponseNote      string                     `json:"response_note,omitempty"`
	CreatedAt         time.Time                  `json:"created_at"`
	UpdatedAt         time.Time                  `json:"updated_at"`
	ResolvedAt        *time.Time                 `json:"resolved_at,omitempty"`
}
