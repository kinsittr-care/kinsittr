package config

import (
	"fmt"
	"os"
	"strconv"
)

type Config struct {
	Port                    string
	WebOrigin               string
	DatabaseURL             string
	JWTSecret               string
	JWTRefreshSecret        string
	ResendAPIKey            string
	ContactToEmail          string
	ContactFromEmail        string
	PlatformFeeRate         float64
	StripeSecretKey         string
	StripeWebhookSecret     string
	StripeConnectRefreshURL string
	StripeConnectReturnURL  string
}

func Load() (*Config, error) {
	cfg := &Config{
		Port:                    getEnv("PORT", "4006"),
		WebOrigin:               getEnv("WEB_ORIGIN", "http://localhost:3000"),
		DatabaseURL:             os.Getenv("DATABASE_URL"),
		JWTSecret:               os.Getenv("JWT_SECRET"),
		JWTRefreshSecret:        os.Getenv("JWT_REFRESH_SECRET"),
		ResendAPIKey:            os.Getenv("RESEND_API_KEY"),
		ContactToEmail:          os.Getenv("CONTACT_TO_EMAIL"),
		ContactFromEmail:        os.Getenv("CONTACT_FROM_EMAIL"),
		StripeSecretKey:         os.Getenv("STRIPE_SECRET_KEY"),
		StripeWebhookSecret:     os.Getenv("STRIPE_WEBHOOK_SECRET"),
		StripeConnectRefreshURL: getEnv("STRIPE_CONNECT_REFRESH_URL", getEnv("WEB_ORIGIN", "http://localhost:3000")+"/nanny/payments"),
		StripeConnectReturnURL:  getEnv("STRIPE_CONNECT_RETURN_URL", getEnv("WEB_ORIGIN", "http://localhost:3000")+"/nanny/payments"),
	}
	cfg.PlatformFeeRate = getFloatEnv("PLATFORM_FEE_RATE", 0.10)

	if cfg.DatabaseURL == "" {
		return nil, fmt.Errorf("DATABASE_URL is required")
	}
	if cfg.JWTSecret == "" {
		return nil, fmt.Errorf("JWT_SECRET is required")
	}
	if cfg.JWTRefreshSecret == "" {
		return nil, fmt.Errorf("JWT_REFRESH_SECRET is required")
	}

	return cfg, nil
}

func (c *Config) StripeConfigured() bool {
	return c.StripeSecretKey != ""
}

func (c *Config) ContactConfigured() bool {
	return c.ResendAPIKey != "" && c.ContactToEmail != "" && c.ContactFromEmail != ""
}

func (c *Config) MailConfigured() bool {
	return c.ResendAPIKey != "" && c.ContactFromEmail != ""
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func getFloatEnv(key string, fallback float64) float64 {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	parsed, err := strconv.ParseFloat(value, 64)
	if err != nil {
		return fallback
	}
	return parsed
}
