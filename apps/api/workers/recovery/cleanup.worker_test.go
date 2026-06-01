package recovery

import (
	"context"
	"testing"
	"time"
)

type mockCleanupRepo struct {
	before time.Time
	calls  int
}

func (m *mockCleanupRepo) DeleteStalePasswordRecoveryTokens(_ context.Context, before time.Time) (int64, error) {
	m.before = before
	m.calls++
	return 0, nil
}

func TestRunCleanup(t *testing.T) {
	repo := &mockCleanupRepo{}
	retention := 24 * time.Hour
	start := time.Now().UTC()

	runCleanup(context.Background(), repo, retention)

	if repo.calls != 1 {
		t.Fatalf("expected one cleanup call, got %d", repo.calls)
	}
	if repo.before.Before(start.Add(-retention-time.Second)) || repo.before.After(time.Now().UTC().Add(-retention+time.Second)) {
		t.Fatalf("expected cleanup cutoff near retention window, got %s", repo.before)
	}
}
