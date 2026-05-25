package pipes

import (
	"context"
	"strings"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/payments/dtos"
	"github.com/kinsittr/kinsittr-api/payments/messages"
	shared "github.com/kinsittr/kinsittr-api/shared"
	stripe_api "github.com/kinsittr/kinsittr-api/shared/stripe"
)

func (p *PaymentsPipe) CreateParentSetupIntent(ctx context.Context, userID uuid.UUID) *shared.PipeRes[SetupIntentData] {
	if p.stripe == nil || !p.stripe.Configured() {
		return pipeError[SetupIntentData](messages.Stripe_Not_Configured)
	}
	billing, err := p.repo.GetParentBillingContext(ctx, userID)
	if err != nil || billing.ParentProfileID == uuid.Nil {
		return pipeError[SetupIntentData](messages.Payment_Profile_Not_Found)
	}
	customerID := strings.TrimSpace(billing.StripeCustomerID)
	if customerID == "" {
		customer, err := p.stripe.CreateCustomer(ctx, billing.Email, billing.DisplayName, "parent-customer-"+billing.ParentProfileID.String())
		if err != nil {
			return pipeError[SetupIntentData](messages.Invalid_Payment_Request)
		}
		customerID = customer.ID
		if err := p.repo.UpdateParentStripeCustomer(ctx, billing.ParentProfileID, customerID); err != nil {
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

func (p *PaymentsPipe) ListParentPaymentMethods(ctx context.Context, userID uuid.UUID) *shared.PipeRes[PaymentMethodListData] {
	if p.stripe == nil || !p.stripe.Configured() {
		return pipeError[PaymentMethodListData](messages.Stripe_Not_Configured)
	}
	billing, err := p.repo.GetParentBillingContext(ctx, userID)
	if err != nil || billing.ParentProfileID == uuid.Nil {
		return pipeError[PaymentMethodListData](messages.Payment_Profile_Not_Found)
	}
	if strings.TrimSpace(billing.StripeCustomerID) == "" {
		return pipeSuccess(messages.Payment_Methods_Listed, &PaymentMethodListData{Items: []PaymentMethodData{}})
	}
	methods, err := p.stripe.ListCardPaymentMethods(ctx, billing.StripeCustomerID)
	if err != nil {
		return pipeError[PaymentMethodListData](messages.Invalid_Payment_Request)
	}
	defaultID := strings.TrimSpace(billing.StripeDefaultPaymentMethodID)
	if defaultID == "" {
		customer, err := p.stripe.GetCustomer(ctx, billing.StripeCustomerID)
		if err == nil {
			defaultID = customer.InvoiceSettings.DefaultPaymentMethod
		}
	}
	items := make([]PaymentMethodData, 0, len(methods))
	for _, method := range methods {
		items = append(items, toPaymentMethodData(method, method.ID == defaultID))
	}
	return pipeSuccess(messages.Payment_Methods_Listed, &PaymentMethodListData{Items: items})
}

func (p *PaymentsPipe) UpdateParentPaymentMethod(ctx context.Context, userID uuid.UUID, paymentMethodID string, dto dtos.UpdatePaymentMethodDTO) *shared.PipeRes[PaymentMethodData] {
	if p.stripe == nil || !p.stripe.Configured() {
		return pipeError[PaymentMethodData](messages.Stripe_Not_Configured)
	}
	billing, err := p.repo.GetParentBillingContext(ctx, userID)
	if err != nil || billing.ParentProfileID == uuid.Nil || strings.TrimSpace(paymentMethodID) == "" {
		return pipeError[PaymentMethodData](messages.Payment_Profile_Not_Found)
	}
	if strings.TrimSpace(billing.StripeCustomerID) == "" {
		return pipeError[PaymentMethodData](messages.Invalid_Payment_Request)
	}
	method, ok := p.findParentPaymentMethod(ctx, billing.StripeCustomerID, paymentMethodID)
	if !ok {
		return pipeError[PaymentMethodData](messages.Invalid_Payment_Request)
	}
	if dto.SetDefault {
		if _, err := p.stripe.UpdateCustomerDefaultPaymentMethod(ctx, billing.StripeCustomerID, paymentMethodID); err != nil {
			return pipeError[PaymentMethodData](messages.Invalid_Payment_Request)
		}
		if err := p.repo.UpdateParentDefaultPaymentMethod(ctx, billing.ParentProfileID, paymentMethodID); err != nil {
			return pipeError[PaymentMethodData](messages.Invalid_Payment_Request)
		}
	}
	method.IsDefault = dto.SetDefault
	data := method
	return pipeSuccess(messages.Payment_Method_Updated, &data)
}

func (p *PaymentsPipe) DeleteParentPaymentMethod(ctx context.Context, userID uuid.UUID, paymentMethodID string) *shared.PipeRes[any] {
	if p.stripe == nil || !p.stripe.Configured() {
		return pipeError[any](messages.Stripe_Not_Configured)
	}
	billing, err := p.repo.GetParentBillingContext(ctx, userID)
	if err != nil || billing.ParentProfileID == uuid.Nil || strings.TrimSpace(paymentMethodID) == "" {
		return pipeError[any](messages.Payment_Profile_Not_Found)
	}
	if strings.TrimSpace(billing.StripeCustomerID) == "" {
		return pipeError[any](messages.Invalid_Payment_Request)
	}
	if _, ok := p.findParentPaymentMethod(ctx, billing.StripeCustomerID, paymentMethodID); !ok {
		return pipeError[any](messages.Invalid_Payment_Request)
	}
	if _, err := p.stripe.DetachPaymentMethod(ctx, paymentMethodID); err != nil {
		return pipeError[any](messages.Invalid_Payment_Request)
	}
	if billing.StripeDefaultPaymentMethodID == paymentMethodID {
		_ = p.repo.UpdateParentDefaultPaymentMethod(ctx, billing.ParentProfileID, "")
	}
	return pipeSuccess[any](messages.Payment_Method_Deleted, nil)
}

func (p *PaymentsPipe) findParentPaymentMethod(ctx context.Context, customerID, paymentMethodID string) (PaymentMethodData, bool) {
	methods, err := p.stripe.ListCardPaymentMethods(ctx, customerID)
	if err != nil {
		return PaymentMethodData{}, false
	}
	for _, method := range methods {
		if method.ID == paymentMethodID {
			return toPaymentMethodData(method, false), true
		}
	}
	return PaymentMethodData{}, false
}

func toPaymentMethodData(method stripe_api.PaymentMethod, isDefault bool) PaymentMethodData {
	return PaymentMethodData{
		ID:        method.ID,
		Brand:     method.Card.Brand,
		Last4:     method.Card.Last4,
		ExpMonth:  method.Card.ExpMonth,
		ExpYear:   method.Card.ExpYear,
		IsDefault: isDefault,
	}
}
