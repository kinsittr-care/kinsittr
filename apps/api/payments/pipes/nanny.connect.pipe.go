package pipes

import (
	"context"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/payments/dtos"
	"github.com/kinsittr/kinsittr-api/payments/messages"
	shared "github.com/kinsittr/kinsittr-api/shared"
	"github.com/kinsittr/kinsittr-api/shared/stripe"
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
	var url string
	if connect.StripeOnboarded {
		link, err := p.stripe.CreateLoginLink(ctx, accountID)
		if err != nil {
			logPaymentEvent("connect_login_link", uuid.Nil, uuid.Nil, connect.NannyProfileID, "stripe_failed", err)
			return pipeError[StripeConnectData](messages.Invalid_Payment_Request)
		}
		url = link.URL
	} else {
		link, err := p.stripe.CreateAccountLink(ctx, accountID, p.refreshURL, p.returnURL)
		if err != nil {
			logPaymentEvent("connect_link", uuid.Nil, uuid.Nil, connect.NannyProfileID, "stripe_failed", err)
			return pipeError[StripeConnectData](messages.Invalid_Payment_Request)
		}
		url = link.URL
	}
	logPaymentEvent("connect_link", uuid.Nil, uuid.Nil, connect.NannyProfileID, "success", nil)
	data := StripeConnectData{AccountID: accountID, URL: url, Onboarded: connect.StripeOnboarded}
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
	if accountID != "" && p.stripe != nil && p.stripe.Configured() {
		account, err := p.stripe.GetAccount(ctx, accountID)
		if err != nil {
			logPaymentEvent("connect_status_sync", uuid.Nil, uuid.Nil, profile.ID, "stripe_failed", err)
		} else {
			data = stripeStatusData(account)
			onboarded := account.ChargesEnabled && account.PayoutsEnabled && account.DetailsSubmitted
			data.AccountID = accountID
			data.Onboarded = onboarded
			if onboarded != profile.StripeOnboarded {
				_ = p.repo.UpdateNannyStripeAccount(ctx, profile.ID, accountID, onboarded)
			}
		}
	}
	return pipeSuccess(messages.Stripe_Status_Fetched, &data)
}

func (p *PaymentsPipe) GetNannyStripeBalance(ctx context.Context, userID uuid.UUID) *shared.PipeRes[StripeBalanceData] {
	connect, err := p.repo.GetNannyConnectContext(ctx, userID)
	if err != nil || connect.NannyProfileID == uuid.Nil {
		return pipeError[StripeBalanceData](messages.Payment_Profile_Not_Found)
	}
	if connect.StripeAccountID == "" || !connect.StripeOnboarded {
		data := StripeBalanceData{Available: []StripeBalanceAmountData{}, Pending: []StripeBalanceAmountData{}}
		return pipeSuccess(messages.Stripe_Status_Fetched, &data)
	}
	if p.stripe == nil || !p.stripe.Configured() {
		return pipeError[StripeBalanceData](messages.Stripe_Not_Configured)
	}
	balance, err := p.stripe.GetConnectedBalance(ctx, connect.StripeAccountID)
	if err != nil {
		logPaymentEvent("connect_balance", uuid.Nil, uuid.Nil, connect.NannyProfileID, "stripe_failed", err)
		return pipeError[StripeBalanceData](messages.Invalid_Payment_Request)
	}
	data := StripeBalanceData{
		Available: stripeBalanceAmounts(balance.Available),
		Pending:   stripeBalanceAmounts(balance.Pending),
	}
	return pipeSuccess(messages.Stripe_Status_Fetched, &data)
}

func (p *PaymentsPipe) ListNannyStripePayouts(ctx context.Context, userID uuid.UUID) *shared.PipeRes[StripePayoutListData] {
	connect, err := p.repo.GetNannyConnectContext(ctx, userID)
	if err != nil || connect.NannyProfileID == uuid.Nil {
		return pipeError[StripePayoutListData](messages.Payment_Profile_Not_Found)
	}
	if connect.StripeAccountID == "" || !connect.StripeOnboarded {
		data := StripePayoutListData{Items: []StripePayoutData{}}
		return pipeSuccess(messages.Stripe_Status_Fetched, &data)
	}
	if p.stripe == nil || !p.stripe.Configured() {
		return pipeError[StripePayoutListData](messages.Stripe_Not_Configured)
	}
	payouts, err := p.stripe.ListConnectedPayouts(ctx, connect.StripeAccountID, 10)
	if err != nil {
		logPaymentEvent("connect_payouts", uuid.Nil, uuid.Nil, connect.NannyProfileID, "stripe_failed", err)
		return pipeError[StripePayoutListData](messages.Invalid_Payment_Request)
	}
	items := make([]StripePayoutData, 0, len(payouts))
	for _, payout := range payouts {
		items = append(items, stripePayoutData(payout))
	}
	data := StripePayoutListData{Items: items}
	return pipeSuccess(messages.Stripe_Status_Fetched, &data)
}

func (p *PaymentsPipe) GetNannyPayoutSettings(ctx context.Context, userID uuid.UUID) *shared.PipeRes[NannyPayoutSettingsData] {
	settings, err := p.repo.GetNannyPayoutSettings(ctx, userID)
	if err != nil || settings.NannyProfileID == uuid.Nil {
		return pipeError[NannyPayoutSettingsData](messages.Payment_Profile_Not_Found)
	}
	data := NannyPayoutSettingsData{Schedule: normalizePayoutSchedule(settings.Schedule)}
	return pipeSuccess(messages.Stripe_Status_Fetched, &data)
}

func (p *PaymentsPipe) UpdateNannyPayoutSettings(ctx context.Context, userID uuid.UUID, dto dtos.UpdateNannyPayoutSettingsDTO) *shared.PipeRes[NannyPayoutSettingsData] {
	schedule := strings.ToLower(strings.TrimSpace(dto.Schedule))
	if schedule != "daily" && schedule != "weekly" {
		return pipeError[NannyPayoutSettingsData](messages.Invalid_Payment_Request)
	}
	settings, err := p.repo.UpdateNannyPayoutSettings(ctx, userID, schedule)
	if err != nil || settings.NannyProfileID == uuid.Nil {
		return pipeError[NannyPayoutSettingsData](messages.Payment_Profile_Not_Found)
	}
	data := NannyPayoutSettingsData{Schedule: normalizePayoutSchedule(settings.Schedule)}
	return pipeSuccess(messages.Stripe_Status_Fetched, &data)
}

func stripeStatusData(account stripe.Account) StripeStatusData {
	return StripeStatusData{
		AccountID:                 account.ID,
		ChargesEnabled:            account.ChargesEnabled,
		PayoutsEnabled:            account.PayoutsEnabled,
		DetailsSubmitted:          account.DetailsSubmitted,
		RequirementsCurrentlyDue:  account.Requirements.CurrentlyDue,
		RequirementsEventuallyDue: account.Requirements.EventuallyDue,
		DisabledReason:            account.Requirements.DisabledReason,
	}
}

func stripeBalanceAmounts(values []stripe.BalanceAmount) []StripeBalanceAmountData {
	items := make([]StripeBalanceAmountData, 0, len(values))
	for _, value := range values {
		items = append(items, StripeBalanceAmountData{
			Amount:   float64(value.Amount) / 100,
			Currency: strings.ToUpper(value.Currency),
		})
	}
	return items
}

func stripePayoutData(payout stripe.Payout) StripePayoutData {
	return StripePayoutData{
		ID:          payout.ID,
		Amount:      float64(payout.Amount) / 100,
		Currency:    strings.ToUpper(payout.Currency),
		Status:      payout.Status,
		ArrivalDate: unixDate(payout.ArrivalDate),
		CreatedAt:   unixDate(payout.Created),
	}
}

func unixDate(value int64) string {
	if value <= 0 {
		return ""
	}
	return time.Unix(value, 0).UTC().Format(time.RFC3339)
}

func normalizePayoutSchedule(schedule string) string {
	schedule = strings.ToLower(strings.TrimSpace(schedule))
	if schedule == "daily" {
		return "daily"
	}
	return "weekly"
}
