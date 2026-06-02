package config

import (
	"fmt"
	"os"
	"strconv"
	"time"
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
	CloudinaryCloudName     string
	CloudinaryAPIKey        string
	CloudinaryAPISecret     string
	AutoMigrate             bool
	MigrationLockTimeout    time.Duration
	RecoveryCleanupInterval time.Duration
	RecoveryTokenRetention  time.Duration
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
		CloudinaryCloudName:     os.Getenv("CLOUDINARY_CLOUD_NAME"),
		CloudinaryAPIKey:        os.Getenv("CLOUDINARY_API_KEY"),
		CloudinaryAPISecret:     os.Getenv("CLOUDINARY_API_SECRET"),
		AutoMigrate:             getBoolEnv("AUTO_MIGRATE", false),
		MigrationLockTimeout:    getDurationEnv("MIGRATION_LOCK_TIMEOUT", 30*time.Second),
		RecoveryCleanupInterval: getDurationEnv("RECOVERY_CLEANUP_INTERVAL", time.Hour),
		RecoveryTokenRetention:  getDurationEnv("RECOVERY_TOKEN_RETENTION", 24*time.Hour),
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

func (c *Config) CloudinaryConfigured() bool {
	return c.CloudinaryCloudName != "" && c.CloudinaryAPIKey != "" && c.CloudinaryAPISecret != ""
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

func getBoolEnv(key string, fallback bool) bool {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	parsed, err := strconv.ParseBool(value)
	if err != nil {
		return fallback
	}
	return parsed
}

func getDurationEnv(key string, fallback time.Duration) time.Duration {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	parsed, err := time.ParseDuration(value)
	if err != nil || parsed <= 0 {
		return fallback
	}
	return parsed
}
