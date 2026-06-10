package pipes

import (
	"context"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/payments/messages"
	paymentrepo "github.com/kinsittr/kinsittr-api/repositories/payments"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *PaymentsPipe) GetNannyEarningsSummary(ctx context.Context, userID uuid.UUID) *shared.PipeRes[NannyEarningsSummaryData] {
	summary, err := p.repo.GetNannyEarningsSummary(ctx, userID)
	if err != nil {
		return pipeError[NannyEarningsSummaryData](messages.Invalid_Payment_Request)
	}

	data := NannyEarningsSummaryData{
		ThisMonthEarnings: summary.ThisMonthEarnings,
		ThisMonthBookings: summary.ThisMonthBookings,
		LastMonthEarnings: summary.LastMonthEarnings,
		LastMonthBookings: summary.LastMonthBookings,
		AllTimeEarnings:   summary.AllTimeEarnings,
		AllTimeBookings:   summary.AllTimeBookings,
	}
	return pipeSuccess(messages.Earnings_Fetched, &data)
}

func (p *PaymentsPipe) ListNannyEarnings(ctx context.Context, userID uuid.UUID, page, limit int) *shared.PipeRes[NannyEarningsListData] {
	page, limit = normalizeEarningsPageLimit(page, limit)
	records, total, err := p.repo.ListNannyEarnings(ctx, userID, page, limit)
	if err != nil {
		return pipeError[NannyEarningsListData](messages.Invalid_Payment_Request)
	}

	items := make([]NannyEarningData, 0, len(records))
	for _, record := range records {
		items = append(items, nannyEarningData(record))
	}

	return pipeSuccess(messages.Earnings_Fetched, &NannyEarningsListData{
		Items: items,
		Page:  page,
		Limit: limit,
		Total: total,
	})
}

func normalizeEarningsPageLimit(page, limit int) (int, int) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}
	return page, limit
}

func nannyEarningData(record paymentrepo.NannyEarningRecord) NannyEarningData {
	return NannyEarningData{
		BookingID:         record.BookingID.String(),
		ParentDisplayName: record.ParentDisplayName,
		Date:              record.Date,
		StartTime:         record.StartTime,
		Duration:          record.Duration,
		GrossAmount:       record.GrossAmount,
		PlatformFee:       record.PlatformFee,
		NetAmount:         record.NetAmount,
		Currency:          string(record.Currency),
		PaymentStatus:     record.PaymentStatus,
	}
}

func (p *PaymentsPipe) ListPaymentReconciliationIssues(ctx context.Context, page, limit int) *shared.PipeRes[PaymentReconciliationListData] {
	page, limit = normalizeEarningsPageLimit(page, limit)
	records, total, err := p.repo.ListPaymentReconciliationIssues(ctx, page, limit)
	if err != nil {
		return pipeError[PaymentReconciliationListData](messages.Invalid_Payment_Request)
	}

	items := make([]PaymentReconciliationIssueData, 0, len(records))
	for _, record := range records {
		items = append(items, paymentReconciliationIssueData(record))
	}

	return pipeSuccess(messages.Payment_Reconciliation_Listed, &PaymentReconciliationListData{
		Items: items,
		Page:  page,
		Limit: limit,
		Total: total,
	})
}

func paymentReconciliationIssueData(record paymentrepo.PaymentReconciliationIssue) PaymentReconciliationIssueData {
	return PaymentReconciliationIssueData{
		IssueType:             record.IssueType,
		BookingID:             record.BookingID.String(),
		ParentProfileID:       record.ParentProfileID.String(),
		NannyProfileID:        record.NannyProfileID.String(),
		BookingStatus:         record.BookingStatus,
		PaymentStatus:         record.PaymentStatus,
		StripePaymentIntentID: record.StripePaymentIntentID,
		StripeChargeID:        record.StripeChargeID,
		StripeRefundID:        record.StripeRefundID,
		Amount:                record.Amount,
		Currency:              string(record.Currency),
		CreatedAt:             record.CreatedAt,
	}
}
