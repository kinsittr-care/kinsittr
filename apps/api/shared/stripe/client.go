package stripe

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"
)

const apiBase = "https://api.stripe.com/v1"

type Client struct {
	secretKey string
	http      *http.Client
}

type Account struct {
	ID               string `json:"id"`
	ChargesEnabled   bool   `json:"charges_enabled"`
	PayoutsEnabled   bool   `json:"payouts_enabled"`
	DetailsSubmitted bool   `json:"details_submitted"`
}

type AccountLink struct {
	URL string `json:"url"`
}

type Customer struct {
	ID string `json:"id"`
}

type SetupIntent struct {
	ID           string `json:"id"`
	ClientSecret string `json:"client_secret"`
}

type PaymentMethod struct {
	ID string `json:"id"`
}

type PaymentIntent struct {
	ID           string `json:"id"`
	Status       string `json:"status"`
	ClientSecret string `json:"client_secret"`
	LatestCharge string `json:"latest_charge"`
	LastError    *struct {
		Message string `json:"message"`
	} `json:"last_payment_error"`
}

type Refund struct {
	ID     string `json:"id"`
	Status string `json:"status"`
}

type Event struct {
	ID   string `json:"id"`
	Type string `json:"type"`
	Data struct {
		Object json.RawMessage `json:"object"`
	} `json:"data"`
}

func NewClient(secretKey string) *Client {
	return &Client{secretKey: secretKey, http: &http.Client{Timeout: 15 * time.Second}}
}

func (c *Client) Configured() bool {
	return strings.TrimSpace(c.secretKey) != ""
}

func (c *Client) CreateExpressAccount(ctx context.Context, email string) (Account, error) {
	values := url.Values{}
	values.Set("type", "express")
	values.Set("country", "CA")
	values.Set("email", email)
	values.Set("capabilities[card_payments][requested]", "true")
	values.Set("capabilities[transfers][requested]", "true")
	return postForm[Account](ctx, c, "/accounts", values)
}

func (c *Client) CreateAccountLink(ctx context.Context, accountID, refreshURL, returnURL string) (AccountLink, error) {
	values := url.Values{}
	values.Set("account", accountID)
	values.Set("refresh_url", refreshURL)
	values.Set("return_url", returnURL)
	values.Set("type", "account_onboarding")
	return postForm[AccountLink](ctx, c, "/account_links", values)
}

func (c *Client) CreateCustomer(ctx context.Context, email, name string) (Customer, error) {
	values := url.Values{}
	values.Set("email", email)
	values.Set("name", name)
	return postForm[Customer](ctx, c, "/customers", values)
}

func (c *Client) CreateSetupIntent(ctx context.Context, customerID string) (SetupIntent, error) {
	values := url.Values{}
	values.Set("customer", customerID)
	values.Set("payment_method_types[]", "card")
	values.Set("usage", "off_session")
	return postForm[SetupIntent](ctx, c, "/setup_intents", values)
}

func (c *Client) FirstCardPaymentMethod(ctx context.Context, customerID string) (PaymentMethod, error) {
	values := url.Values{}
	values.Set("customer", customerID)
	values.Set("type", "card")
	values.Set("limit", "1")
	var response struct {
		Data []PaymentMethod `json:"data"`
	}
	if err := getForm(ctx, c, "/payment_methods", values, &response); err != nil {
		return PaymentMethod{}, err
	}
	if len(response.Data) == 0 {
		return PaymentMethod{}, errors.New("stripe_payment_method_not_found")
	}
	return response.Data[0], nil
}

func (c *Client) CreateDestinationPaymentIntent(ctx context.Context, params PaymentIntentParams) (PaymentIntent, error) {
	values := url.Values{}
	values.Set("amount", strconv.FormatInt(params.AmountCents, 10))
	values.Set("currency", strings.ToLower(params.Currency))
	values.Set("customer", params.CustomerID)
	values.Set("payment_method", params.PaymentMethodID)
	values.Set("confirm", "true")
	values.Set("off_session", "true")
	values.Set("application_fee_amount", strconv.FormatInt(params.ApplicationFeeCents, 10))
	values.Set("transfer_data[destination]", params.DestinationAccountID)
	values.Set("metadata[booking_id]", params.BookingID)
	return postForm[PaymentIntent](ctx, c, "/payment_intents", values)
}

func (c *Client) CreateRefund(ctx context.Context, chargeID string) (Refund, error) {
	values := url.Values{}
	values.Set("charge", chargeID)
	return postForm[Refund](ctx, c, "/refunds", values)
}

type PaymentIntentParams struct {
	AmountCents          int64
	ApplicationFeeCents  int64
	Currency             string
	CustomerID           string
	PaymentMethodID      string
	DestinationAccountID string
	BookingID            string
}

func VerifyWebhook(payload []byte, header, secret string) (Event, error) {
	if strings.TrimSpace(secret) == "" {
		return Event{}, errors.New("stripe_webhook_secret_missing")
	}
	timestamp, signature := parseSignatureHeader(header)
	if timestamp == "" || signature == "" {
		return Event{}, errors.New("invalid_stripe_signature")
	}
	signedPayload := []byte(timestamp + "." + string(payload))
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(signedPayload)
	expected := hex.EncodeToString(mac.Sum(nil))
	if !hmac.Equal([]byte(expected), []byte(signature)) {
		return Event{}, errors.New("invalid_stripe_signature")
	}
	var event Event
	if err := json.Unmarshal(payload, &event); err != nil {
		return Event{}, err
	}
	return event, nil
}

func parseSignatureHeader(header string) (string, string) {
	var timestamp string
	var signature string
	for _, part := range strings.Split(header, ",") {
		keyValue := strings.SplitN(part, "=", 2)
		if len(keyValue) != 2 {
			continue
		}
		switch strings.TrimSpace(keyValue[0]) {
		case "t":
			timestamp = strings.TrimSpace(keyValue[1])
		case "v1":
			signature = strings.TrimSpace(keyValue[1])
		}
	}
	return timestamp, signature
}

func postForm[T any](ctx context.Context, c *Client, path string, values url.Values) (T, error) {
	var output T
	if err := c.request(ctx, http.MethodPost, path, values, &output); err != nil {
		return output, err
	}
	return output, nil
}

func getForm(ctx context.Context, c *Client, path string, values url.Values, output any) error {
	target := path
	if encoded := values.Encode(); encoded != "" {
		target += "?" + encoded
	}
	return c.request(ctx, http.MethodGet, target, nil, output)
}

func (c *Client) request(ctx context.Context, method, path string, values url.Values, output any) error {
	if !c.Configured() {
		return errors.New("stripe_not_configured")
	}
	var body io.Reader
	if values != nil {
		body = bytes.NewBufferString(values.Encode())
	}
	req, err := http.NewRequestWithContext(ctx, method, apiBase+path, body)
	if err != nil {
		return err
	}
	req.SetBasicAuth(c.secretKey, "")
	if values != nil {
		req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	}
	res, err := c.http.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()
	payload, err := io.ReadAll(res.Body)
	if err != nil {
		return err
	}
	if res.StatusCode >= 400 {
		return fmt.Errorf("stripe_error_%d: %s", res.StatusCode, string(payload))
	}
	return json.Unmarshal(payload, output)
}
