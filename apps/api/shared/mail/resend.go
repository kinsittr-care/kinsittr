package mail

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	api_logging "github.com/kinsittr/kinsittr-api/shared/logging"
)

const resendURL = "https://api.resend.com/emails"

type ResendProvider struct {
	apiKey     string
	fromEmail  string
	httpClient *http.Client
}

func NewResendProvider(apiKey string, fromEmail string) *ResendProvider {
	return &ResendProvider{
		apiKey:    apiKey,
		fromEmail: fromEmail,
		httpClient: &http.Client{
			Timeout: 15 * time.Second,
		},
	}
}

func (p *ResendProvider) Send(ctx context.Context, message Message) error {
	toHash, toDomain := api_logging.EmailLogFields(message.ToEmail)
	payload := map[string]any{
		"from":    p.fromEmail,
		"to":      []string{message.ToEmail},
		"subject": message.Subject,
		"text":    message.TextContent,
		"html":    message.HTMLContent,
	}

	if replyTo := strings.TrimSpace(message.ReplyTo); replyTo != "" {
		payload["reply_to"] = replyTo
	}

	body, err := json.Marshal(payload)
	if err != nil {
		log.Printf("mail_resend_send_failed to_email_hash=%s to_email_domain=%s result=marshal_failed err=%v", toHash, toDomain, err)
		return fmt.Errorf("marshal resend payload: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, resendURL, bytes.NewReader(body))
	if err != nil {
		log.Printf("mail_resend_send_failed to_email_hash=%s to_email_domain=%s result=request_create_failed err=%v", toHash, toDomain, err)
		return fmt.Errorf("create resend request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+p.apiKey)
	req.Header.Set("Content-Type", "application/json")

	res, err := p.httpClient.Do(req)
	if err != nil {
		log.Printf("mail_resend_send_failed to_email_hash=%s to_email_domain=%s result=request_failed err=%v", toHash, toDomain, err)
		return fmt.Errorf("send resend request: %w", err)
	}
	defer res.Body.Close()

	if res.StatusCode >= http.StatusBadRequest {
		log.Printf("mail_resend_send_failed to_email_hash=%s to_email_domain=%s result=provider_status status=%d", toHash, toDomain, res.StatusCode)
		return fmt.Errorf("resend returned status %d", res.StatusCode)
	}

	return nil
}
