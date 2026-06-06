package pipes

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"strconv"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/models"
	paymentrepo "github.com/kinsittr/kinsittr-api/repositories/payments"
)

func testStripeSignature(t *testing.T, payload []byte, secret string) string {
	t.Helper()
	timestamp := strconv.FormatInt(time.Now().Unix(), 10)
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(timestamp + "." + string(payload)))
	return "t=" + timestamp + ",v1=" + hex.EncodeToString(mac.Sum(nil))
}

type mockPaymentRepo struct {
	paymentCtx          paymentrepo.PaymentContext
	paymentCtxErr       error
	payment             models.BookingPayment
	paymentErr          error
	upserted            paymentrepo.CreatePaymentParams
	upsertErr           error
	processed           bool
	hasProcessedErr     error
	recordedEventID     string
	recordedEventType   string
	recordProcessedErr  error
	updateIntentErr     error
	updatedIntentID     string
	updatedIntentStatus models.PaymentStatus
	updateRefundErr     error
	updatedChargeID     string
	updatedRefundID     string
}

func (m *mockPaymentRepo) GetNannyPaymentContext(context.Context, uuid.UUID, uuid.UUID) (paymentrepo.PaymentContext, error) {
	return m.paymentCtx, m.paymentCtxErr
}
func (m *mockPaymentRepo) GetParentBillingContext(context.Context, uuid.UUID) (paymentrepo.ParentBillingContext, error) {
	return paymentrepo.ParentBillingContext{}, nil
}
func (m *mockPaymentRepo) GetNannyConnectContext(context.Context, uuid.UUID) (paymentrepo.NannyConnectContext, error) {
	return paymentrepo.NannyConnectContext{}, nil
}
func (m *mockPaymentRepo) UpdateNannyStripeAccount(context.Context, uuid.UUID, string, bool) error {
	return nil
}
func (m *mockPaymentRepo) UpdateNannyStripeOnboardedByAccountID(context.Context, string, bool) error {
	return nil
}
func (m *mockPaymentRepo) GetNannyPayoutSettings(context.Context, uuid.UUID) (paymentrepo.NannyPayoutSettings, error) {
	return paymentrepo.NannyPayoutSettings{}, nil
}
func (m *mockPaymentRepo) UpdateNannyPayoutSettings(context.Context, uuid.UUID, string) (paymentrepo.NannyPayoutSettings, error) {
	return paymentrepo.NannyPayoutSettings{}, nil
}
func (m *mockPaymentRepo) GetNannyEarningsSummary(context.Context, uuid.UUID) (paymentrepo.NannyEarningsSummary, error) {
	return paymentrepo.NannyEarningsSummary{}, nil
}
func (m *mockPaymentRepo) ListNannyEarnings(context.Context, uuid.UUID, int, int) ([]paymentrepo.NannyEarningRecord, int, error) {
	return []paymentrepo.NannyEarningRecord{}, 0, nil
}
func (m *mockPaymentRepo) UpdateParentStripeCustomer(context.Context, uuid.UUID, string) error {
	return nil
}
func (m *mockPaymentRepo) UpdateParentDefaultPaymentMethod(context.Context, uuid.UUID, string) error {
	return nil
}
func (m *mockPaymentRepo) GetPaymentByBookingID(context.Context, uuid.UUID) (models.BookingPayment, error) {
	return m.payment, m.paymentErr
}
func (m *mockPaymentRepo) UpsertBookingPayment(_ context.Context, params paymentrepo.CreatePaymentParams) (models.BookingPayment, error) {
	m.upserted = params
	return models.BookingPayment{ID: uuid.New()}, m.upsertErr
}
func (m *mockPaymentRepo) UpdatePaymentStatusByIntentID(_ context.Context, id string, status models.PaymentStatus, _, _ string) error {
	m.updatedIntentID = id
	m.updatedIntentStatus = status
	return m.updateIntentErr
}
func (m *mockPaymentRepo) UpdatePaymentRefundedByChargeID(_ context.Context, chargeID, refundID string) error {
	m.updatedChargeID = chargeID
	m.updatedRefundID = refundID
	return m.updateRefundErr
}
func (m *mockPaymentRepo) HasProcessedStripeEvent(context.Context, string) (bool, error) {
	return m.processed, m.hasProcessedErr
}
func (m *mockPaymentRepo) RecordProcessedStripeEvent(_ context.Context, id, eventType string) error {
	m.recordedEventID = id
	m.recordedEventType = eventType
	return m.recordProcessedErr
}

func TestNormalizePaymentStatus(t *testing.T) {
	if got := normalizePaymentStatus(models.PaymentStatus("canceled")); got != models.PaymentCancelled {
		t.Fatalf("expected canceled to normalize to cancelled, got %s", got)
	}
	if got := normalizePaymentStatus(models.PaymentSucceeded); got != models.PaymentSucceeded {
		t.Fatalf("expected succeeded to remain succeeded, got %s", got)
	}
	if got := normalizePaymentStatus(models.PaymentStatus("unknown")); got != models.PaymentFailed {
		t.Fatalf("expected unknown to normalize to failed, got %s", got)
	}
}

func TestEnsureBookingPaymentReadyRequiresStripe(t *testing.T) {
	pipe := NewPaymentsPipe(&mockPaymentRepo{}, nil, nil, 0.1, "", "", "")
	err := pipe.EnsureBookingPaymentReady(context.Background(), uuid.New(), uuid.New())
	if err == nil {
		t.Fatal("expected missing Stripe client to fail payment readiness")
	}
}

func TestHandleStripeWebhook(t *testing.T) {
	ctx := context.Background()
	payload := []byte(`{"id":"evt_1","type":"payment_intent.succeeded","data":{"object":{"id":"pi_1","status":"succeeded","latest_charge":"ch_1"}}}`)
	signature := testStripeSignature(t, payload, "whsec_test")

	t.Run("updates payment and records event", func(t *testing.T) {
		repo := &mockPaymentRepo{}
		pipe := NewPaymentsPipe(repo, nil, nil, 0.1, "whsec_test", "", "")
		res := pipe.HandleStripeWebhook(ctx, payload, signature)
		if !res.Success {
			t.Fatalf("expected success, got %s", res.Message)
		}
		if repo.updatedIntentID != "pi_1" || repo.updatedIntentStatus != models.PaymentSucceeded {
			t.Fatalf("payment intent update not captured: id=%s status=%s", repo.updatedIntentID, repo.updatedIntentStatus)
		}
		if repo.recordedEventID != "evt_1" || repo.recordedEventType != "payment_intent.succeeded" {
			t.Fatalf("event not recorded: id=%s type=%s", repo.recordedEventID, repo.recordedEventType)
		}
	})

	t.Run("skips duplicate event", func(t *testing.T) {
		repo := &mockPaymentRepo{processed: true}
		pipe := NewPaymentsPipe(repo, nil, nil, 0.1, "whsec_test", "", "")
		res := pipe.HandleStripeWebhook(ctx, payload, signature)
		if !res.Success {
			t.Fatalf("expected duplicate success, got %s", res.Message)
		}
		if repo.updatedIntentID != "" || repo.recordedEventID != "" {
			t.Fatal("duplicate event should not update payment or record again")
		}
	})

	t.Run("does not record when update fails", func(t *testing.T) {
		repo := &mockPaymentRepo{updateIntentErr: errors.New("db down")}
		pipe := NewPaymentsPipe(repo, nil, nil, 0.1, "whsec_test", "", "")
		res := pipe.HandleStripeWebhook(ctx, payload, signature)
		if res.Success {
			t.Fatal("expected update failure")
		}
		if repo.recordedEventID != "" {
			t.Fatal("failed event should not be recorded as processed")
		}
	})
}
