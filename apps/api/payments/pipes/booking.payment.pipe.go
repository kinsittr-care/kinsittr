package pipes

import (
	"context"
	"errors"
	"math"

	"github.com/google/uuid"
	booking_messages "github.com/kinsittr/kinsittr-api/bookings/messages"
	"github.com/kinsittr/kinsittr-api/models"
	payment_repo "github.com/kinsittr/kinsittr-api/repositories/payments"
	stripe_api "github.com/kinsittr/kinsittr-api/shared/stripe"
)

func (p *PaymentsPipe) EnsureBookingPaymentReady(ctx context.Context, nannyProfileID, bookingID uuid.UUID) error {
	if p.stripe == nil || !p.stripe.Configured() {
		return errors.New(booking_messages.Booking_Payment_Setup_Missing)
	}
	paymentCtx, err := p.repo.GetNannyPaymentContext(ctx, nannyProfileID, bookingID)
	if err != nil || paymentCtx.BookingID == uuid.Nil {
		return err
	}
	if paymentCtx.StripeCustomerID == "" || paymentCtx.StripeAccountID == "" || !paymentCtx.StripeOnboarded {
		p.notifyPaymentSetupMissing(ctx, paymentCtx)
		return errors.New(booking_messages.Booking_Payment_Setup_Missing)
	}
	_, err = p.resolvePaymentMethod(ctx, paymentCtx)
	if err != nil {
		p.notifyPaymentSetupMissing(ctx, paymentCtx)
		return errors.New(booking_messages.Booking_Payment_Setup_Missing)
	}
	return nil
}

func (p *PaymentsPipe) ChargeCompletedBooking(ctx context.Context, nannyProfileID, bookingID uuid.UUID) error {
	if p.stripe == nil || !p.stripe.Configured() {
		return errors.New(booking_messages.Booking_Payment_Setup_Missing)
	}
	paymentCtx, err := p.repo.GetNannyPaymentContext(ctx, nannyProfileID, bookingID)
	if err != nil || paymentCtx.BookingID == uuid.Nil {
		return err
	}
	if paymentCtx.StripeCustomerID == "" || paymentCtx.StripeAccountID == "" || !paymentCtx.StripeOnboarded {
		_, _ = p.repo.UpsertBookingPayment(ctx, failedPayment(paymentCtx, "missing_stripe_setup", p.platformFeeRate))
		p.notifyPaymentSetupMissing(ctx, paymentCtx)
		return errors.New(booking_messages.Booking_Payment_Setup_Missing)
	}
	method, err := p.resolvePaymentMethod(ctx, paymentCtx)
	if err != nil {
		_, _ = p.repo.UpsertBookingPayment(ctx, failedPayment(paymentCtx, "missing_payment_method", p.platformFeeRate))
		p.notifyPaymentSetupMissing(ctx, paymentCtx)
		return errors.New(booking_messages.Booking_Payment_Setup_Missing)
	}
	amountCents := cents(paymentCtx.Amount)
	feeCents := int64(math.Round(float64(amountCents) * p.platformFeeRate))
	intent, err := p.stripe.CreateDestinationPaymentIntent(ctx, stripe_api.PaymentIntentParams{
		AmountCents:          amountCents,
		ApplicationFeeCents:  feeCents,
		Currency:             string(paymentCtx.Currency),
		CustomerID:           paymentCtx.StripeCustomerID,
		PaymentMethodID:      method.ID,
		DestinationAccountID: paymentCtx.StripeAccountID,
		BookingID:            paymentCtx.BookingID.String(),
	})
	status := models.PaymentStatus(intent.Status)
	failure := ""
	if err != nil {
		status = models.PaymentFailed
		failure = err.Error()
	} else if intent.LastError != nil {
		failure = intent.LastError.Message
	}
	status = normalizePaymentStatus(status)
	_, upsertErr := p.repo.UpsertBookingPayment(ctx, payment_repo.CreatePaymentParams{
		BookingID:             paymentCtx.BookingID,
		ParentProfileID:       paymentCtx.ParentProfileID,
		NannyProfileID:        paymentCtx.NannyProfileID,
		StripePaymentIntentID: intent.ID,
		StripeChargeID:        intent.LatestCharge,
		Amount:                paymentCtx.Amount,
		PlatformFee:           float64(feeCents) / 100,
		Currency:              paymentCtx.Currency,
		Status:                status,
		FailureMessage:        failure,
	})
	if upsertErr != nil {
		return upsertErr
	}
	if status != models.PaymentSucceeded && status != models.PaymentProcessing {
		p.notifyPaymentFailed(ctx, paymentCtx, failure)
		return errors.New(booking_messages.Booking_Payment_Failed)
	}
	p.notifyPaymentSucceeded(ctx, paymentCtx)
	return nil
}

func (p *PaymentsPipe) RefundBooking(ctx context.Context, bookingID uuid.UUID) error {
	if p.stripe == nil || !p.stripe.Configured() {
		return nil
	}
	payment, err := p.repo.GetPaymentByBookingID(ctx, bookingID)
	if err != nil || payment.ID == uuid.Nil || payment.StripeChargeID == "" {
		return err
	}
	if payment.Status != models.PaymentSucceeded && payment.Status != models.PaymentProcessing {
		return nil
	}
	refund, err := p.stripe.CreateRefund(ctx, payment.StripeChargeID, "booking-refund-"+bookingID.String())
	if err != nil {
		p.notifyRefundFailed(ctx, payment)
		return err
	}
	if err := p.repo.UpdatePaymentRefundedByChargeID(ctx, payment.StripeChargeID, refund.ID); err != nil {
		return err
	}
	p.notifyRefundSucceeded(ctx, payment)
	return nil
}

func (p *PaymentsPipe) resolvePaymentMethod(ctx context.Context, paymentCtx payment_repo.PaymentContext) (stripe_api.PaymentMethod, error) {
	if paymentCtx.StripeDefaultPaymentMethodID != "" {
		return stripe_api.PaymentMethod{ID: paymentCtx.StripeDefaultPaymentMethodID}, nil
	}
	customer, err := p.stripe.GetCustomer(ctx, paymentCtx.StripeCustomerID)
	if err == nil && customer.InvoiceSettings.DefaultPaymentMethod != "" {
		return stripe_api.PaymentMethod{ID: customer.InvoiceSettings.DefaultPaymentMethod}, nil
	}
	return p.stripe.FirstCardPaymentMethod(ctx, paymentCtx.StripeCustomerID)
}

func (p *PaymentsPipe) notifyPaymentSetupMissing(ctx context.Context, paymentCtx payment_repo.PaymentContext) {
	data := paymentNotificationData(map[string]string{"booking_id": paymentCtx.BookingID.String()})
	p.notifyParentProfile(ctx, paymentCtx.ParentProfileID, models.Notification{
		Type:  models.PaymentSetupMissingNotificationType,
		Title: "Payment setup needed",
		Body:  "Add or update your saved card so this booking can move forward.",
		Data:  data,
	})
	p.notifyNannyProfile(ctx, paymentCtx.NannyProfileID, models.Notification{
		Type:  models.PaymentSetupMissingNotificationType,
		Title: "Payment setup missing",
		Body:  "This booking is blocked until the parent's payment setup is ready.",
		Data:  data,
	})
}

func (p *PaymentsPipe) notifyPaymentSucceeded(ctx context.Context, paymentCtx payment_repo.PaymentContext) {
	data := paymentNotificationData(map[string]string{"booking_id": paymentCtx.BookingID.String()})
	p.notifyParentProfile(ctx, paymentCtx.ParentProfileID, models.Notification{
		Type:  models.PaymentSucceededNotificationType,
		Title: "Payment successful",
		Body:  "Your booking payment was processed successfully.",
		Data:  data,
	})
	p.notifyNannyProfile(ctx, paymentCtx.NannyProfileID, models.Notification{
		Type:  models.PaymentSucceededNotificationType,
		Title: "Booking payment received",
		Body:  "Payment for this completed booking was processed successfully.",
		Data:  data,
	})
}

func (p *PaymentsPipe) notifyPaymentFailed(ctx context.Context, paymentCtx payment_repo.PaymentContext, reason string) {
	if reason == "" {
		reason = "The saved payment method could not be charged."
	}
	data := paymentNotificationData(map[string]string{"booking_id": paymentCtx.BookingID.String()})
	p.notifyParentProfile(ctx, paymentCtx.ParentProfileID, models.Notification{
		Type:  models.PaymentFailedNotificationType,
		Title: "Payment failed",
		Body:  reason,
		Data:  data,
	})
	p.notifyNannyProfile(ctx, paymentCtx.NannyProfileID, models.Notification{
		Type:  models.PaymentFailedNotificationType,
		Title: "Booking payment failed",
		Body:  "The parent needs to update their payment method before this booking can be completed.",
		Data:  data,
	})
}

func (p *PaymentsPipe) notifyRefundSucceeded(ctx context.Context, payment models.BookingPayment) {
	p.notifyParentProfile(ctx, payment.ParentProfileID, models.Notification{
		Type:  models.PaymentRefundedNotificationType,
		Title: "Payment refunded",
		Body:  "A refund was issued for your cancelled booking.",
		Data:  paymentNotificationData(map[string]string{"booking_id": payment.BookingID.String()}),
	})
}

func (p *PaymentsPipe) notifyRefundFailed(ctx context.Context, payment models.BookingPayment) {
	data := paymentNotificationData(map[string]string{"booking_id": payment.BookingID.String()})
	p.notifyParentProfile(ctx, payment.ParentProfileID, models.Notification{
		Type:  models.PaymentRefundFailedNotificationType,
		Title: "Refund issue",
		Body:  "A refund for your cancelled booking needs manual review.",
		Data:  data,
	})
	p.notifyNannyProfile(ctx, payment.NannyProfileID, models.Notification{
		Type:  models.PaymentRefundFailedNotificationType,
		Title: "Refund issue",
		Body:  "A refund for this cancelled booking needs manual review.",
		Data:  data,
	})
}
