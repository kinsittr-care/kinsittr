package config

import (
	"fmt"
	"os"
)

type Config struct {
	Port             string
	WebOrigin        string
	ResendAPIKey     string
	ContactToEmail   string
	ContactFromEmail string
}

func Load() (*Config, error) {
	cfg := &Config{
		Port:             getEnv("PORT", "4006"),
		WebOrigin:        getEnv("WEB_ORIGIN", "http://localhost:3000"),
		ResendAPIKey:     os.Getenv("RESEND_API_KEY"),
		ContactToEmail:   os.Getenv("CONTACT_TO_EMAIL"),
		ContactFromEmail: os.Getenv("CONTACT_FROM_EMAIL"),
	}

	if cfg.ResendAPIKey == "" {
		return nil, fmt.Errorf("RESEND_API_KEY is required")
	}
	if cfg.ContactToEmail == "" {
		return nil, fmt.Errorf("CONTACT_TO_EMAIL is required")
	}
	if cfg.ContactFromEmail == "" {
		return nil, fmt.Errorf("CONTACT_FROM_EMAIL is required")
	}

	return cfg, nil
}

func getEnv(key string, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}

	return fallback
}
