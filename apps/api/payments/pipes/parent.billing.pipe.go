package pipes

import (
	"context"
	"strings"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/payments/messages"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *PaymentsPipe) CreateParentSetupIntent(ctx context.Context, userID uuid.UUID) *shared.PipeRes[SetupIntentData] {
	if p.stripe == nil || !p.stripe.Configured() {
		return pipeError[SetupIntentData](messages.Stripe_Not_Configured)
	}
	profile, err := p.profileRepo.GetParentProfileByUserID(ctx, userID)
	if err != nil || profile.ID == uuid.Nil {
		return pipeError[SetupIntentData](messages.Payment_Profile_Not_Found)
	}
	customerID := strings.TrimSpace(profile.StripeCustomerID)
	if customerID == "" {
		customer, err := p.stripe.CreateCustomer(ctx, "", profile.DisplayName)
		if err != nil {
			return pipeError[SetupIntentData](messages.Invalid_Payment_Request)
		}
		customerID = customer.ID
		if err := p.repo.UpdateParentStripeCustomer(ctx, profile.ID, customerID); err != nil {
			return pipeError[SetupIntentData](messages.Invalid_Payment_Request)
		}
	}
	intent, err := p.stripe.CreateSetupIntent(ctx, customerID)
	if err != nil {
		return pipeError[SetupIntentData](messages.Invalid_Payment_Request)
	}
	data := SetupIntentData{CustomerID: customerID, ClientSecret: intent.ClientSecret}
	return pipeSuccess(messages.Payment_Setup_Created, &data)
}
