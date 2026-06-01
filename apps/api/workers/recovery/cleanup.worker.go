package recovery

import (
	"context"
	"log"
	"time"
)

type CleanupRepository interface {
	DeleteStalePasswordRecoveryTokens(ctx context.Context, before time.Time) (int64, error)
}

type CleanupConfig struct {
	Interval  time.Duration
	Retention time.Duration
}

func StartCleanup(ctx context.Context, repo CleanupRepository, cfg CleanupConfig) {
	if repo == nil {
		return
	}
	if cfg.Interval <= 0 {
		cfg.Interval = time.Hour
	}
	if cfg.Retention <= 0 {
		cfg.Retention = 24 * time.Hour
	}

	go func() {
		runCleanup(ctx, repo, cfg.Retention)

		ticker := time.NewTicker(cfg.Interval)
		defer ticker.Stop()

		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				runCleanup(ctx, repo, cfg.Retention)
			}
		}
	}()
}

func runCleanup(ctx context.Context, repo CleanupRepository, retention time.Duration) {
	deleted, err := repo.DeleteStalePasswordRecoveryTokens(ctx, time.Now().UTC().Add(-retention))
	if err != nil {
		log.Printf("password recovery cleanup failed: %v", err)
		return
	}
	if deleted > 0 {
		log.Printf("password recovery cleanup deleted %d stale tokens", deleted)
	}
}
