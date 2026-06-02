package pipes

import (
	"context"
	"encoding/json"

	"github.com/kinsittr/kinsittr-api/models"
	"github.com/kinsittr/kinsittr-api/payments/messages"
	shared "github.com/kinsittr/kinsittr-api/shared"
	stripe_api "github.com/kinsittr/kinsittr-api/shared/stripe"
)

func (p *PaymentsPipe) HandleStripeWebhook(ctx context.Context, payload []byte, signature string) *shared.PipeRes[any] {
	event, err := stripe_api.VerifyWebhook(payload, signature, p.webhookSecret)
	if err != nil {
		logStripeWebhookEvent("", "", "signature_failed", err)
		return pipeError[any](messages.Invalid_Payment_Request)
	}
	if event.ID == "" {
		logStripeWebhookEvent("", event.Type, "missing_event_id", nil)
		return pipeError[any](messages.Invalid_Payment_Request)
	}
	processed, err := p.repo.HasProcessedStripeEvent(ctx, event.ID)
	if err != nil {
		logStripeWebhookEvent(event.ID, event.Type, "processed_check_failed", err)
		return pipeError[any](messages.Invalid_Payment_Request)
	}
	if processed {
		logStripeWebhookEvent(event.ID, event.Type, "ignored_already_processed", nil)
		return pipeSuccess[any](messages.Stripe_Webhook_Processed, nil)
	}

	switch event.Type {
	case "account.updated":
		var account stripe_api.Account
		if err := json.Unmarshal(event.Data.Object, &account); err != nil {
			logStripeWebhookEvent(event.ID, event.Type, "decode_failed", err)
			return pipeError[any](messages.Invalid_Payment_Request)
		}
		onboarded := account.ChargesEnabled && account.PayoutsEnabled && account.DetailsSubmitted
		if err := p.repo.UpdateNannyStripeOnboardedByAccountID(ctx, account.ID, onboarded); err != nil {
			logStripeWebhookEvent(event.ID, event.Type, "account_update_failed", err)
			return pipeError[any](messages.Invalid_Payment_Request)
		}
	case "payment_intent.succeeded", "payment_intent.payment_failed", "payment_intent.processing", "payment_intent.canceled":
		var intent stripe_api.PaymentIntent
		if err := json.Unmarshal(event.Data.Object, &intent); err != nil {
			logStripeWebhookEvent(event.ID, event.Type, "decode_failed", err)
			return pipeError[any](messages.Invalid_Payment_Request)
		}
		failure := ""
		if intent.LastError != nil {
			failure = intent.LastError.Message
		}
		status := normalizePaymentStatus(models.PaymentStatus(intent.Status))
		if err := p.repo.UpdatePaymentStatusByIntentID(ctx, intent.ID, status, intent.LatestCharge, failure); err != nil {
			logStripeWebhookEvent(event.ID, event.Type, "payment_update_failed", err)
			return pipeError[any](messages.Invalid_Payment_Request)
		}
	case "charge.refunded":
		var charge struct {
			ID      string `json:"id"`
			Refunds struct {
				Data []struct {
					ID string `json:"id"`
				} `json:"data"`
			} `json:"refunds"`
		}
		if err := json.Unmarshal(event.Data.Object, &charge); err != nil {
			logStripeWebhookEvent(event.ID, event.Type, "decode_failed", err)
			return pipeError[any](messages.Invalid_Payment_Request)
		}
		refundID := ""
		if len(charge.Refunds.Data) > 0 {
			refundID = charge.Refunds.Data[0].ID
		}
		if err := p.repo.UpdatePaymentRefundedByChargeID(ctx, charge.ID, refundID); err != nil {
			logStripeWebhookEvent(event.ID, event.Type, "refund_update_failed", err)
			return pipeError[any](messages.Invalid_Payment_Request)
		}
	default:
		logStripeWebhookEvent(event.ID, event.Type, "ignored_unsupported_type", nil)
	}
	if err := p.repo.RecordProcessedStripeEvent(ctx, event.ID, event.Type); err != nil {
		logStripeWebhookEvent(event.ID, event.Type, "record_failed", err)
		return pipeError[any](messages.Invalid_Payment_Request)
	}
	logStripeWebhookEvent(event.ID, event.Type, "processed", nil)
	return pipeSuccess[any](messages.Stripe_Webhook_Processed, nil)
}
