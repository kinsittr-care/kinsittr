package config

import (
	"fmt"
	"os"
)

type Config struct {
	Port             string
	WebOrigin        string
	DatabaseURL      string
	JWTSecret        string
	JWTRefreshSecret string
	ResendAPIKey     string
	ContactToEmail   string
	ContactFromEmail string
}

func Load() (*Config, error) {
	cfg := &Config{
		Port:             getEnv("PORT", "4006"),
		WebOrigin:        getEnv("WEB_ORIGIN", "http://localhost:3000"),
		DatabaseURL:      os.Getenv("DATABASE_URL"),
		JWTSecret:        os.Getenv("JWT_SECRET"),
		JWTRefreshSecret: os.Getenv("JWT_REFRESH_SECRET"),
		ResendAPIKey:     os.Getenv("RESEND_API_KEY"),
		ContactToEmail:   os.Getenv("CONTACT_TO_EMAIL"),
		ContactFromEmail: os.Getenv("CONTACT_FROM_EMAIL"),
	}

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

func (c *Config) ContactConfigured() bool {
	return c.ResendAPIKey != "" && c.ContactToEmail != "" && c.ContactFromEmail != ""
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
