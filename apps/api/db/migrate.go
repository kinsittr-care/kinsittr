package db

import (
	"context"
	"crypto/sha256"
	"embed"
	"encoding/hex"
	"errors"
	"fmt"
	"io/fs"
	"log"
	"path"
	"sort"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

const migrationAdvisoryLockID int64 = 842601220

//go:embed migrations/*.sql
var migrationsFS embed.FS

type MigrationConfig struct {
	LockTimeout time.Duration
}

func RunMigrationsFromURL(ctx context.Context, databaseURL string, cfg MigrationConfig) error {
	if strings.TrimSpace(databaseURL) == "" {
		return fmt.Errorf("database URL is required")
	}

	pool, err := pgxpool.New(ctx, databaseURL)
	if err != nil {
		return err
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		return err
	}
	return RunMigrations(ctx, pool, cfg)
}

func RunMigrations(ctx context.Context, pool *pgxpool.Pool, cfg MigrationConfig) error {
	if pool == nil {
		return fmt.Errorf("database pool is required")
	}

	conn, err := pool.Acquire(ctx)
	if err != nil {
		return err
	}
	defer conn.Release()

	if err := acquireMigrationLock(ctx, conn, cfg.LockTimeout); err != nil {
		return err
	}
	defer func() {
		if _, unlockErr := conn.Exec(context.Background(), `SELECT pg_advisory_unlock($1)`, migrationAdvisoryLockID); unlockErr != nil {
			log.Printf("db_migration_unlock_failed err=%v", unlockErr)
		}
	}()

	if err := ensureMigrationTable(ctx, conn); err != nil {
		return err
	}

	files, err := migrationFiles()
	if err != nil {
		return err
	}
	if len(files) == 0 {
		log.Print("db_migrations_no_files")
		return nil
	}

	applied := 0
	for _, file := range files {
		sqlBytes, err := migrationsFS.ReadFile(file)
		if err != nil {
			return err
		}
		version := path.Base(file)
		checksum := migrationChecksum(sqlBytes)
		alreadyApplied, err := migrationApplied(ctx, conn, version, checksum)
		if err != nil {
			return err
		}
		if alreadyApplied {
			continue
		}
		if err := applyMigration(ctx, conn, string(sqlBytes), version, checksum); err != nil {
			return err
		}
		applied++
	}

	if applied == 0 {
		log.Print("db_migrations_no_pending")
		return nil
	}
	log.Printf("db_migrations_applied count=%d", applied)
	return nil
}

func BaselineMigrationsFromURL(ctx context.Context, databaseURL string, cfg MigrationConfig) error {
	if strings.TrimSpace(databaseURL) == "" {
		return fmt.Errorf("database URL is required")
	}

	pool, err := pgxpool.New(ctx, databaseURL)
	if err != nil {
		return err
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		return err
	}
	return BaselineMigrations(ctx, pool, cfg)
}

func BaselineMigrations(ctx context.Context, pool *pgxpool.Pool, cfg MigrationConfig) error {
	if pool == nil {
		return fmt.Errorf("database pool is required")
	}

	conn, err := pool.Acquire(ctx)
	if err != nil {
		return err
	}
	defer conn.Release()

	if err := acquireMigrationLock(ctx, conn, cfg.LockTimeout); err != nil {
		return err
	}
	defer func() {
		if _, unlockErr := conn.Exec(context.Background(), `SELECT pg_advisory_unlock($1)`, migrationAdvisoryLockID); unlockErr != nil {
			log.Printf("db_migration_unlock_failed err=%v", unlockErr)
		}
	}()

	if err := ensureMigrationTable(ctx, conn); err != nil {
		return err
	}

	files, err := migrationFiles()
	if err != nil {
		return err
	}

	baselined := 0
	for _, file := range files {
		sqlBytes, err := migrationsFS.ReadFile(file)
		if err != nil {
			return err
		}
		version := path.Base(file)
		checksum := migrationChecksum(sqlBytes)
		changed, err := baselineMigration(ctx, conn, version, checksum)
		if err != nil {
			return err
		}
		if changed {
			baselined++
		}
	}

	log.Printf("db_migrations_baselined count=%d", baselined)
	return nil
}

func ensureMigrationTable(ctx context.Context, conn *pgxpool.Conn) error {
	if _, err := conn.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version TEXT PRIMARY KEY,
			checksum TEXT NOT NULL DEFAULT '',
			applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)
	`); err != nil {
		return err
	}
	if _, err := conn.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS schema_migration_failures (
			version TEXT PRIMARY KEY,
			checksum TEXT NOT NULL,
			error TEXT NOT NULL,
			failed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)
	`); err != nil {
		return err
	}
	_, err := conn.Exec(ctx, `
		ALTER TABLE schema_migrations
		ADD COLUMN IF NOT EXISTS checksum TEXT NOT NULL DEFAULT ''
	`)
	return err
}

func acquireMigrationLock(ctx context.Context, conn *pgxpool.Conn, timeout time.Duration) error {
	if timeout <= 0 {
		timeout = 30 * time.Second
	}

	lockCtx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	ticker := time.NewTicker(250 * time.Millisecond)
	defer ticker.Stop()

	for {
		var locked bool
		if err := conn.QueryRow(lockCtx, `SELECT pg_try_advisory_lock($1)`, migrationAdvisoryLockID).Scan(&locked); err != nil {
			return err
		}
		if locked {
			return nil
		}

		select {
		case <-lockCtx.Done():
			return fmt.Errorf("migration lock timeout after %s", timeout)
		case <-ticker.C:
		}
	}
}

func migrationFiles() ([]string, error) {
	entries, err := fs.ReadDir(migrationsFS, "migrations")
	if err != nil {
		return nil, err
	}

	files := make([]string, 0, len(entries))
	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".sql") {
			continue
		}
		files = append(files, path.Join("migrations", entry.Name()))
	}
	sort.Strings(files)
	return files, nil
}

func migrationApplied(ctx context.Context, conn *pgxpool.Conn, version string, checksum string) (bool, error) {
	var storedChecksum string
	err := conn.QueryRow(ctx, `
		SELECT checksum
		FROM schema_migrations
		WHERE version = $1
	`, version).Scan(&storedChecksum)
	if errors.Is(err, pgx.ErrNoRows) {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	if storedChecksum == "" {
		log.Printf("db_migration_checksum_backfill version=%s", version)
		_, err := conn.Exec(ctx, `
			UPDATE schema_migrations
			SET checksum = $1
			WHERE version = $2 AND checksum = ''
		`, checksum, version)
		return true, err
	}
	if storedChecksum != checksum {
		return false, fmt.Errorf("migration checksum mismatch version=%s", version)
	}
	return true, nil
}

func baselineMigration(ctx context.Context, conn *pgxpool.Conn, version string, checksum string) (bool, error) {
	var storedChecksum string
	err := conn.QueryRow(ctx, `
		SELECT checksum
		FROM schema_migrations
		WHERE version = $1
	`, version).Scan(&storedChecksum)
	if errors.Is(err, pgx.ErrNoRows) {
		_, err := conn.Exec(ctx, `
			INSERT INTO schema_migrations (version, checksum)
			VALUES ($1, $2)
		`, version, checksum)
		return true, err
	}
	if err != nil {
		return false, err
	}
	if storedChecksum == checksum {
		return false, nil
	}
	if storedChecksum == "" {
		log.Printf("db_migration_checksum_backfill version=%s", version)
		_, err := conn.Exec(ctx, `
			UPDATE schema_migrations
			SET checksum = $1
			WHERE version = $2 AND checksum = ''
		`, checksum, version)
		return true, err
	}
	return false, fmt.Errorf("migration checksum mismatch version=%s", version)
}

func applyMigration(ctx context.Context, conn *pgxpool.Conn, sql string, version string, checksum string) error {
	tx, err := conn.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return err
	}

	if _, err := tx.Exec(ctx, sql); err != nil {
		_ = tx.Rollback(ctx)
		recordMigrationFailure(ctx, conn, version, checksum, err)
		return fmt.Errorf("apply migration %s: %w", version, err)
	}
	if _, err := tx.Exec(ctx, `
		INSERT INTO schema_migrations (version, checksum)
		VALUES ($1, $2)
	`, version, checksum); err != nil {
		_ = tx.Rollback(ctx)
		recordMigrationFailure(ctx, conn, version, checksum, err)
		return fmt.Errorf("record migration %s: %w", version, err)
	}
	if err := tx.Commit(ctx); err != nil {
		recordMigrationFailure(ctx, conn, version, checksum, err)
		return fmt.Errorf("commit migration %s: %w", version, err)
	}

	if _, err := conn.Exec(ctx, `DELETE FROM schema_migration_failures WHERE version = $1`, version); err != nil {
		log.Printf("db_migration_failure_cleanup_failed version=%s err=%v", version, err)
	}
	log.Printf("db_migration_applied version=%s", version)
	return nil
}

func recordMigrationFailure(ctx context.Context, conn *pgxpool.Conn, version string, checksum string, migrationErr error) {
	_, err := conn.Exec(ctx, `
		INSERT INTO schema_migration_failures (version, checksum, error, failed_at)
		VALUES ($1, $2, $3, NOW())
		ON CONFLICT (version) DO UPDATE
		SET checksum = EXCLUDED.checksum,
		    error = EXCLUDED.error,
		    failed_at = NOW()
	`, version, checksum, migrationErr.Error())
	if err != nil {
		log.Printf("db_migration_failure_record_failed version=%s err=%v", version, err)
	}
}

func migrationChecksum(contents []byte) string {
	sum := sha256.Sum256(contents)
	return hex.EncodeToString(sum[:])
}
