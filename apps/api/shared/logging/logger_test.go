package logging

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestRotatingFileWriterRotatesAndPrunesBackups(t *testing.T) {
	dir := t.TempDir()
	writer, err := newRotatingFileWriter(Config{
		Enabled:    true,
		Dir:        dir,
		File:       "api.log",
		MaxSizeMB:  1,
		MaxBackups: 1,
	})
	if err != nil {
		t.Fatalf("create writer: %v", err)
	}
	writer.maxBytes = 10
	defer writer.Close()

	for i := 0; i < 3; i++ {
		if _, err := writer.Write([]byte(strings.Repeat("x", 8))); err != nil {
			t.Fatalf("write %d: %v", i, err)
		}
	}

	active, err := os.Stat(filepath.Join(dir, "api.log"))
	if err != nil {
		t.Fatalf("stat active log: %v", err)
	}
	if active.Size() == 0 {
		t.Fatal("expected active log to contain data")
	}

	backups, err := filepath.Glob(filepath.Join(dir, "api-*.log"))
	if err != nil {
		t.Fatalf("glob backups: %v", err)
	}
	if len(backups) != 1 {
		t.Fatalf("expected one backup after pruning, got %d", len(backups))
	}
}

func TestBackupGlob(t *testing.T) {
	got := backupGlob(filepath.Join("logs", "api.log"))
	want := filepath.Join("logs", "api-*.log")
	if got != want {
		t.Fatalf("expected %q, got %q", want, got)
	}
}

func TestEmailLogFields(t *testing.T) {
	hash, domain := EmailLogFields(" Test@Example.COM ")
	if hash == "" {
		t.Fatal("expected email hash")
	}
	if domain != "example.com" {
		t.Fatalf("expected normalized domain, got %q", domain)
	}
	if strings.Contains(hash, "test") || strings.Contains(hash, "example") {
		t.Fatalf("expected hash not to contain email fragments, got %q", hash)
	}
}
