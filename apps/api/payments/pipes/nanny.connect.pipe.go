package pipes

import (
	"context"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/payments/messages"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *PaymentsPipe) CreateNannyConnectLink(ctx context.Context, userID uuid.UUID) *shared.PipeRes[StripeConnectData] {
	if p.stripe == nil || !p.stripe.Configured() {
		logPaymentEvent("connect_link", uuid.Nil, uuid.Nil, uuid.Nil, "stripe_not_configured", nil)
		return pipeError[StripeConnectData](messages.Stripe_Not_Configured)
	}
	connect, err := p.repo.GetNannyConnectContext(ctx, userID)
	if err != nil || connect.NannyProfileID == uuid.Nil {
		logPaymentEvent("connect_link", uuid.Nil, uuid.Nil, uuid.Nil, "profile_not_found", err)
		return pipeError[StripeConnectData](messages.Payment_Profile_Not_Found)
	}
	accountID := connect.StripeAccountID
	if accountID == "" {
		account, err := p.stripe.CreateExpressAccount(ctx, connect.Email, "nanny-connect-"+connect.NannyProfileID.String())
		if err != nil {
			logPaymentEvent("connect_account_create", uuid.Nil, uuid.Nil, connect.NannyProfileID, "stripe_failed", err)
			return pipeError[StripeConnectData](messages.Invalid_Payment_Request)
		}
		accountID = account.ID
		onboarded := account.ChargesEnabled && account.PayoutsEnabled && account.DetailsSubmitted
		if err := p.repo.UpdateNannyStripeAccount(ctx, connect.NannyProfileID, accountID, onboarded); err != nil {
			logPaymentEvent("connect_account_create", uuid.Nil, uuid.Nil, connect.NannyProfileID, "record_failed", err)
			return pipeError[StripeConnectData](messages.Invalid_Payment_Request)
		}
		logPaymentEvent("connect_account_create", uuid.Nil, uuid.Nil, connect.NannyProfileID, "success", nil)
	}
	link, err := p.stripe.CreateAccountLink(ctx, accountID, p.refreshURL, p.returnURL)
	if err != nil {
		logPaymentEvent("connect_link", uuid.Nil, uuid.Nil, connect.NannyProfileID, "stripe_failed", err)
		return pipeError[StripeConnectData](messages.Invalid_Payment_Request)
	}
	logPaymentEvent("connect_link", uuid.Nil, uuid.Nil, connect.NannyProfileID, "success", nil)
	data := StripeConnectData{AccountID: accountID, URL: link.URL, Onboarded: connect.StripeOnboarded}
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
