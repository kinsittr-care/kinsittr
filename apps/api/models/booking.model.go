package models

import (
	"time"

	"github.com/google/uuid"
)

type BookingStatus string

const (
	PendingBookingStatus   BookingStatus = "pending"
	ApprovedBookingStatus  BookingStatus = "approved"
	DeclinedBookingStatus  BookingStatus = "declined"
	CancelledBookingStatus BookingStatus = "cancelled"
	CompletedBookingStatus BookingStatus = "completed"
)

type Booking struct {
	ID              uuid.UUID     `json:"id"`
	ParentProfileID uuid.UUID     `json:"parent_profile_id"`
	NannyProfileID  uuid.UUID     `json:"nanny_profile_id"`
	Date            time.Time     `json:"date"`
	StartTime       time.Time     `json:"start_time"`
	Duration        int           `json:"duration"`
	TotalAmount     float64       `json:"total_amount"`
	Status          BookingStatus `json:"status"`
	CreatedAt       time.Time     `json:"created_at"`
	UpdatedAt       time.Time     `json:"updated_at"`
}
