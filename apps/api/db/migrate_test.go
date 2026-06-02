package db

import (
	"context"
	"fmt"
	"os"
	"path"
	"sort"
	"strings"
	"testing"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

func TestMigrationFilesAreSortedSQLFiles(t *testing.T) {
	files, err := migrationFiles()
	if err != nil {
		t.Fatalf("expected migration files, got error: %v", err)
	}
	if len(files) == 0 {
		t.Fatal("expected at least one migration file")
	}
	if path.Base(files[0]) != "0000_base_schema.sql" {
		t.Fatalf("expected base schema migration first, got %q", files[0])
	}
	if !sort.StringsAreSorted(files) {
		t.Fatalf("expected migration files to be sorted, got %v", files)
	}
	for _, file := range files {
		if path.Dir(file) != "migrations" {
			t.Fatalf("expected embedded migration path, got %q", file)
		}
		if !strings.HasSuffix(file, ".sql") {
			t.Fatalf("expected SQL migration file, got %q", file)
		}
	}
}

func TestMigrationChecksum(t *testing.T) {
	first := migrationChecksum([]byte("SELECT 1;"))
	second := migrationChecksum([]byte("SELECT 1;"))
	changed := migrationChecksum([]byte("SELECT 2;"))

	if first == "" {
		t.Fatal("expected non-empty checksum")
	}
	if first != second {
		t.Fatalf("expected deterministic checksum, got %q and %q", first, second)
	}
	if first == changed {
		t.Fatal("expected checksum to change when migration contents change")
	}
}

func TestRunMigrationsWithPostgres(t *testing.T) {
	databaseURL := os.Getenv("MIGRATION_TEST_DATABASE_URL")
	if databaseURL == "" {
		databaseURL = os.Getenv("DATABASE_URL")
	}
	if databaseURL == "" {
		t.Skip("set MIGRATION_TEST_DATABASE_URL or DATABASE_URL to run migration integration test")
	}

	ctx := context.Background()
	adminPool, err := pgxpool.New(ctx, databaseURL)
	if err != nil {
		t.Fatalf("connect postgres: %v", err)
	}
	defer adminPool.Close()

	schema := fmt.Sprintf("migration_test_%d", time.Now().UnixNano())
	if _, err := adminPool.Exec(ctx, fmt.Sprintf(`CREATE SCHEMA %s`, schema)); err != nil {
		t.Fatalf("create test schema: %v", err)
	}
	defer adminPool.Exec(context.Background(), fmt.Sprintf(`DROP SCHEMA IF EXISTS %s CASCADE`, schema))

	poolConfig, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		t.Fatalf("parse database url: %v", err)
	}
	if poolConfig.ConnConfig.RuntimeParams == nil {
		poolConfig.ConnConfig.RuntimeParams = map[string]string{}
	}
	poolConfig.ConnConfig.RuntimeParams["search_path"] = schema + ",public"

	pool, err := pgxpool.NewWithConfig(ctx, poolConfig)
	if err != nil {
		t.Fatalf("connect test schema: %v", err)
	}
	defer pool.Close()

	if err := RunMigrations(ctx, pool, MigrationConfig{LockTimeout: time.Second}); err != nil {
		t.Fatalf("run migrations: %v", err)
	}

	expectedTables := []string{
		"users",
		"parent_profiles",
		"nanny_profiles",
		"bookings",
		"schema_migrations",
	}
	for _, table := range expectedTables {
		var exists bool
		if err := adminPool.QueryRow(ctx, `
			SELECT EXISTS (
				SELECT 1
				FROM information_schema.tables
				WHERE table_schema = $1 AND table_name = $2
			)
		`, schema, table).Scan(&exists); err != nil {
			t.Fatalf("check table %s: %v", table, err)
		}
		if !exists {
			t.Fatalf("expected table %s to exist in schema %s", table, schema)
		}
	}

	files, err := migrationFiles()
	if err != nil {
		t.Fatalf("migration files: %v", err)
	}
	var applied int
	if err := pool.QueryRow(ctx, `SELECT COUNT(*) FROM schema_migrations`).Scan(&applied); err != nil {
		t.Fatalf("count applied migrations: %v", err)
	}
	if applied != len(files) {
		t.Fatalf("expected %d applied migrations, got %d", len(files), applied)
	}
}
