package notifications

import (
	"context"
	"log"
	"time"
)

type BookingReminderRepository interface {
	CreateBookingReminder24h(ctx context.Context, windowStart, windowEnd time.Time) (int64, error)
}

type BookingReminderConfig struct {
	Interval  time.Duration
	Lookahead time.Duration
	Window    time.Duration
}

func StartBookingReminders(ctx context.Context, repo BookingReminderRepository, cfg BookingReminderConfig) {
	if repo == nil {
		return
	}
	if cfg.Interval <= 0 {
		cfg.Interval = time.Hour
	}
	if cfg.Lookahead <= 0 {
		cfg.Lookahead = 24 * time.Hour
	}
	if cfg.Window <= 0 {
		cfg.Window = cfg.Interval
	}

	go func() {
		runBookingReminders(ctx, repo, cfg.Lookahead, cfg.Window)

		ticker := time.NewTicker(cfg.Interval)
		defer ticker.Stop()

		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				runBookingReminders(ctx, repo, cfg.Lookahead, cfg.Window)
			}
		}
	}()
}

func runBookingReminders(ctx context.Context, repo BookingReminderRepository, lookahead, window time.Duration) {
	start := time.Now().UTC().Add(lookahead)
	end := start.Add(window)
	created, err := repo.CreateBookingReminder24h(ctx, start, end)
	if err != nil {
		log.Printf("booking reminder worker failed: %v", err)
		return
	}
	if created > 0 {
		log.Printf("booking reminder worker created %d notifications", created)
	}
}
