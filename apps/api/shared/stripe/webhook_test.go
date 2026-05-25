package stripe

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"strconv"
	"testing"
	"time"
)

func signedHeader(t *testing.T, payload []byte, secret string, timestamp time.Time) string {
	t.Helper()
	ts := strconv.FormatInt(timestamp.Unix(), 10)
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(ts + "." + string(payload)))
	return "t=" + ts + ",v1=" + hex.EncodeToString(mac.Sum(nil))
}

func TestVerifyWebhook(t *testing.T) {
	secret := "whsec_test"
	payload := []byte(`{"id":"evt_123","type":"payment_intent.succeeded","data":{"object":{"id":"pi_123"}}}`)

	t.Run("valid signature within tolerance", func(t *testing.T) {
		event, err := VerifyWebhook(payload, signedHeader(t, payload, secret, time.Now()), secret)
		if err != nil {
			t.Fatalf("expected valid signature, got %v", err)
		}
		if event.ID != "evt_123" || event.Type != "payment_intent.succeeded" {
			t.Fatalf("unexpected event: %#v", event)
		}
	})

	t.Run("old timestamp fails", func(t *testing.T) {
		_, err := VerifyWebhook(payload, signedHeader(t, payload, secret, time.Now().Add(-10*time.Minute)), secret)
		if err == nil {
			t.Fatal("expected old timestamp to fail")
		}
	})

	t.Run("bad signature fails", func(t *testing.T) {
		_, err := VerifyWebhook(payload, "t=123,v1=bad", secret)
		if err == nil {
			t.Fatal("expected invalid signature to fail")
		}
	})
}
