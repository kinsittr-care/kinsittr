package pipes

import (
	"context"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/payments/messages"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *PaymentsPipe) CreateNannyConnectLink(ctx context.Context, userID uuid.UUID) *shared.PipeRes[StripeConnectData] {
	if p.stripe == nil || !p.stripe.Configured() {
		return pipeError[StripeConnectData](messages.Stripe_Not_Configured)
	}
	profile, err := p.profileRepo.GetNannyProfileByUserID(ctx, userID)
	if err != nil || profile.ID == uuid.Nil {
		return pipeError[StripeConnectData](messages.Payment_Profile_Not_Found)
	}
	accountID := ""
	if profile.StripeAccountID != nil {
		accountID = *profile.StripeAccountID
	}
	if accountID == "" {
		account, err := p.stripe.CreateExpressAccount(ctx, "")
		if err != nil {
			return pipeError[StripeConnectData](messages.Invalid_Payment_Request)
		}
		accountID = account.ID
		onboarded := account.ChargesEnabled && account.PayoutsEnabled && account.DetailsSubmitted
		if err := p.repo.UpdateNannyStripeAccount(ctx, profile.ID, accountID, onboarded); err != nil {
			return pipeError[StripeConnectData](messages.Invalid_Payment_Request)
		}
	}
	link, err := p.stripe.CreateAccountLink(ctx, accountID, p.refreshURL, p.returnURL)
	if err != nil {
		return pipeError[StripeConnectData](messages.Invalid_Payment_Request)
	}
	data := StripeConnectData{AccountID: accountID, URL: link.URL, Onboarded: profile.StripeOnboarded}
	return pipeSuccess(messages.Stripe_Onboarding_Created, &data)
}

func (p *PaymentsPipe) GetNannyStripeStatus(ctx context.Context, userID uuid.UUID) *shared.PipeRes[StripeStatusData] {
	profile, err := p.profileRepo.GetNannyProfileByUserID(ctx, userID)
	if err != nil || profile.ID == uuid.Nil {
		return pipeError[StripeStatusData](messages.Payment_Profile_Not_Found)
	}
	accountID := ""
	if profile.StripeAccountID != nil {
		accountID = *profile.StripeAccountID
	}
	data := StripeStatusData{AccountID: accountID, Onboarded: profile.StripeOnboarded}
	return pipeSuccess(messages.Stripe_Status_Fetched, &data)
}
