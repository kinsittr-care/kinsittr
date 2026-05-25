package pipes

import (
	"context"
	"math"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/models"
	paymentrepo "github.com/kinsittr/kinsittr-api/repositories/payments"
	stripeapi "github.com/kinsittr/kinsittr-api/shared/stripe"
)

func (p *PaymentsPipe) ChargeApprovedBooking(ctx context.Context, nannyProfileID, bookingID uuid.UUID) error {
	if p.stripe == nil || !p.stripe.Configured() {
		return nil
	}
	paymentCtx, err := p.repo.GetNannyPaymentContext(ctx, nannyProfileID, bookingID)
	if err != nil || paymentCtx.BookingID == uuid.Nil {
		return err
	}
	if paymentCtx.StripeCustomerID == "" || paymentCtx.StripeAccountID == "" || !paymentCtx.StripeOnboarded {
		_, _ = p.repo.UpsertBookingPayment(ctx, failedPayment(paymentCtx, "missing_stripe_setup", p.platformFeeRate))
		return nil
	}
	method, err := p.stripe.FirstCardPaymentMethod(ctx, paymentCtx.StripeCustomerID)
	if err != nil {
		_, _ = p.repo.UpsertBookingPayment(ctx, failedPayment(paymentCtx, "missing_payment_method", p.platformFeeRate))
		return nil
	}
	amountCents := cents(paymentCtx.Amount)
	feeCents := int64(math.Round(float64(amountCents) * p.platformFeeRate))
	intent, err := p.stripe.CreateDestinationPaymentIntent(ctx, stripeapi.PaymentIntentParams{
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
	_, upsertErr := p.repo.UpsertBookingPayment(ctx, paymentrepo.CreatePaymentParams{
		BookingID:             paymentCtx.BookingID,
		ParentProfileID:       paymentCtx.ParentProfileID,
		NannyProfileID:        paymentCtx.NannyProfileID,
		StripePaymentIntentID: intent.ID,
		StripeChargeID:        intent.LatestCharge,
		Amount:                paymentCtx.Amount,
		PlatformFee:           float64(feeCents) / 100,
		Currency:              paymentCtx.Currency,
		Status:                normalizePaymentStatus(status),
		FailureMessage:        failure,
	})
	return upsertErr
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
	refund, err := p.stripe.CreateRefund(ctx, payment.StripeChargeID)
	if err != nil {
		return err
	}
	return p.repo.UpdatePaymentRefundedByChargeID(ctx, payment.StripeChargeID, refund.ID)
}
