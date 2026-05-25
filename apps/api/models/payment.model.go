package models

import (
	"time"

	"github.com/google/uuid"
)

type PaymentStatus string

const (
	PaymentRequiresPaymentMethod PaymentStatus = "requires_payment_method"
	PaymentRequiresConfirmation  PaymentStatus = "requires_confirmation"
	PaymentRequiresAction        PaymentStatus = "requires_action"
	PaymentProcessing            PaymentStatus = "processing"
	PaymentSucceeded             PaymentStatus = "succeeded"
	PaymentFailed                PaymentStatus = "failed"
	PaymentCancelled             PaymentStatus = "cancelled"
	PaymentRefunded              PaymentStatus = "refunded"
)

type BookingPayment struct {
	ID                    uuid.UUID     `json:"id"`
	BookingID             uuid.UUID     `json:"booking_id"`
	ParentProfileID       uuid.UUID     `json:"parent_profile_id"`
	NannyProfileID        uuid.UUID     `json:"nanny_profile_id"`
	StripePaymentIntentID string        `json:"stripe_payment_intent_id"`
	StripeChargeID        string        `json:"stripe_charge_id"`
	StripeRefundID        string        `json:"stripe_refund_id"`
	Amount                float64       `json:"amount"`
	PlatformFee           float64       `json:"platform_fee"`
	Currency              Currency      `json:"currency"`
	Status                PaymentStatus `json:"status"`
	FailureMessage        string        `json:"failure_message"`
	CreatedAt             time.Time     `json:"created_at"`
	UpdatedAt             time.Time     `json:"updated_at"`
}
