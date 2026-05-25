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
		return pipeError[any](messages.Invalid_Payment_Request)
	}
	switch event.Type {
	case "account.updated":
		var account stripe_api.Account
		if err := json.Unmarshal(event.Data.Object, &account); err == nil {
			onboarded := account.ChargesEnabled && account.PayoutsEnabled && account.DetailsSubmitted
			_ = p.repo.UpdateNannyStripeOnboardedByAccountID(ctx, account.ID, onboarded)
		}
	case "payment_intent.succeeded", "payment_intent.payment_failed", "payment_intent.processing", "payment_intent.canceled":
		var intent stripe_api.PaymentIntent
		if err := json.Unmarshal(event.Data.Object, &intent); err == nil {
			failure := ""
			if intent.LastError != nil {
				failure = intent.LastError.Message
			}
			status := normalizePaymentStatus(models.PaymentStatus(intent.Status))
			_ = p.repo.UpdatePaymentStatusByIntentID(ctx, intent.ID, status, intent.LatestCharge, failure)
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
		if err := json.Unmarshal(event.Data.Object, &charge); err == nil {
			refundID := ""
			if len(charge.Refunds.Data) > 0 {
				refundID = charge.Refunds.Data[0].ID
			}
			_ = p.repo.UpdatePaymentRefundedByChargeID(ctx, charge.ID, refundID)
		}
	}
	return pipeSuccess[any](messages.Stripe_Webhook_Processed, nil)
}
