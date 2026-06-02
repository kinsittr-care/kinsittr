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
	"log"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"
)

const apiBase = "https://api.stripe.com/v1"
const webhookTolerance = 5 * time.Minute

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
	ID              string `json:"id"`
	InvoiceSettings struct {
		DefaultPaymentMethod string `json:"default_payment_method"`
	} `json:"invoice_settings"`
}

type SetupIntent struct {
	ID           string `json:"id"`
	ClientSecret string `json:"client_secret"`
}

type PaymentMethod struct {
	ID   string `json:"id"`
	Type string `json:"type"`
	Card struct {
		Brand    string `json:"brand"`
		Last4    string `json:"last4"`
		ExpMonth int    `json:"exp_month"`
		ExpYear  int    `json:"exp_year"`
	} `json:"card"`
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

func (c *Client) CreateExpressAccount(ctx context.Context, email, idempotencyKey string) (Account, error) {
	values := url.Values{}
	values.Set("type", "express")
	values.Set("country", "CA")
	values.Set("email", email)
	values.Set("capabilities[card_payments][requested]", "true")
	values.Set("capabilities[transfers][requested]", "true")
	return postForm[Account](ctx, c, "/accounts", values, requestOptions{IdempotencyKey: idempotencyKey})
}

func (c *Client) CreateAccountLink(ctx context.Context, accountID, refreshURL, returnURL string) (AccountLink, error) {
	values := url.Values{}
	values.Set("account", accountID)
	values.Set("refresh_url", refreshURL)
	values.Set("return_url", returnURL)
	values.Set("type", "account_onboarding")
	return postForm[AccountLink](ctx, c, "/account_links", values)
}

func (c *Client) CreateCustomer(ctx context.Context, email, name, idempotencyKey string) (Customer, error) {
	values := url.Values{}
	values.Set("email", email)
	values.Set("name", name)
	return postForm[Customer](ctx, c, "/customers", values, requestOptions{IdempotencyKey: idempotencyKey})
}

func (c *Client) CreateSetupIntent(ctx context.Context, customerID string) (SetupIntent, error) {
	values := url.Values{}
	values.Set("customer", customerID)
	values.Set("payment_method_types[]", "card")
	values.Set("usage", "off_session")
	return postForm[SetupIntent](ctx, c, "/setup_intents", values)
}

func (c *Client) FirstCardPaymentMethod(ctx context.Context, customerID string) (PaymentMethod, error) {
	methods, err := c.ListCardPaymentMethods(ctx, customerID)
	if err != nil {
		return PaymentMethod{}, err
	}
	if len(methods) == 0 {
		return PaymentMethod{}, errors.New("stripe_payment_method_not_found")
	}
	return methods[0], nil
}

func (c *Client) ListCardPaymentMethods(ctx context.Context, customerID string) ([]PaymentMethod, error) {
	values := url.Values{}
	values.Set("customer", customerID)
	values.Set("type", "card")
	values.Set("limit", "100")
	var response struct {
		Data []PaymentMethod `json:"data"`
	}
	if err := getForm(ctx, c, "/payment_methods", values, &response); err != nil {
		return nil, err
	}
	return response.Data, nil
}

func (c *Client) GetCustomer(ctx context.Context, customerID string) (Customer, error) {
	var customer Customer
	if err := getForm(ctx, c, "/customers/"+url.PathEscape(customerID), nil, &customer); err != nil {
		return Customer{}, err
	}
	return customer, nil
}

func (c *Client) UpdateCustomerDefaultPaymentMethod(ctx context.Context, customerID, paymentMethodID string) (Customer, error) {
	values := url.Values{}
	values.Set("invoice_settings[default_payment_method]", paymentMethodID)
	return postForm[Customer](ctx, c, "/customers/"+url.PathEscape(customerID), values)
}

func (c *Client) DetachPaymentMethod(ctx context.Context, paymentMethodID string) (PaymentMethod, error) {
	return postForm[PaymentMethod](ctx, c, "/payment_methods/"+url.PathEscape(paymentMethodID)+"/detach", url.Values{})
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
	return postForm[PaymentIntent](ctx, c, "/payment_intents", values, requestOptions{IdempotencyKey: "booking-charge-" + params.BookingID})
}

func (c *Client) CreateRefund(ctx context.Context, chargeID, idempotencyKey string) (Refund, error) {
	values := url.Values{}
	values.Set("charge", chargeID)
	return postForm[Refund](ctx, c, "/refunds", values, requestOptions{IdempotencyKey: idempotencyKey})
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
	timestampUnix, err := strconv.ParseInt(timestamp, 10, 64)
	if err != nil {
		return Event{}, errors.New("invalid_stripe_signature")
	}
	signedAt := time.Unix(timestampUnix, 0)
	if time.Since(signedAt) > webhookTolerance || time.Until(signedAt) > webhookTolerance {
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

type requestOptions struct {
	IdempotencyKey string
}

func postForm[T any](ctx context.Context, c *Client, path string, values url.Values, opts ...requestOptions) (T, error) {
	var output T
	if err := c.request(ctx, http.MethodPost, path, values, &output, mergeRequestOptions(opts...)); err != nil {
		return output, err
	}
	return output, nil
}

func getForm(ctx context.Context, c *Client, path string, values url.Values, output any) error {
	target := path
	if encoded := values.Encode(); encoded != "" {
		target += "?" + encoded
	}
	return c.request(ctx, http.MethodGet, target, nil, output, requestOptions{})
}

func mergeRequestOptions(opts ...requestOptions) requestOptions {
	var merged requestOptions
	for _, opt := range opts {
		if opt.IdempotencyKey != "" {
			merged.IdempotencyKey = opt.IdempotencyKey
		}
	}
	return merged
}

func (c *Client) request(ctx context.Context, method, path string, values url.Values, output any, opts requestOptions) error {
	logPath := sanitizeStripeLogPath(path)
	if !c.Configured() {
		log.Printf("stripe_request_failed method=%s path=%s result=not_configured", method, logPath)
		return errors.New("stripe_not_configured")
	}
	var body io.Reader
	if values != nil {
		body = bytes.NewBufferString(values.Encode())
	}
	req, err := http.NewRequestWithContext(ctx, method, apiBase+path, body)
	if err != nil {
		log.Printf("stripe_request_failed method=%s path=%s result=request_create_failed err=%v", method, logPath, err)
		return err
	}
	req.SetBasicAuth(c.secretKey, "")
	if opts.IdempotencyKey != "" {
		req.Header.Set("Idempotency-Key", opts.IdempotencyKey)
	}
	if values != nil {
		req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	}
	res, err := c.http.Do(req)
	if err != nil {
		log.Printf("stripe_request_failed method=%s path=%s result=request_failed err=%v", method, logPath, err)
		return err
	}
	defer res.Body.Close()
	payload, err := io.ReadAll(res.Body)
	if err != nil {
		log.Printf("stripe_request_failed method=%s path=%s result=response_read_failed err=%v", method, logPath, err)
		return err
	}
	if res.StatusCode >= 400 {
		log.Printf("stripe_request_failed method=%s path=%s result=provider_status status=%d", method, logPath, res.StatusCode)
		return fmt.Errorf("stripe_error_%d", res.StatusCode)
	}
	if err := json.Unmarshal(payload, output); err != nil {
		log.Printf("stripe_request_failed method=%s path=%s result=decode_failed err=%v", method, logPath, err)
		return err
	}
	return nil
}

func sanitizeStripeLogPath(path string) string {
	path = strings.SplitN(path, "?", 2)[0]
	switch {
	case strings.HasPrefix(path, "/customers/"):
		return "/customers/:id"
	case strings.HasPrefix(path, "/payment_methods/") && strings.HasSuffix(path, "/detach"):
		return "/payment_methods/:id/detach"
	default:
		return path
	}
}
