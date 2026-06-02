package main

import (
	"bufio"
	"context"
	"flag"
	"log"
	"os"
	"strings"
	"time"

	"github.com/kinsittr/kinsittr-api/db"
)

func main() {
	baseline := flag.Bool("baseline", false, "record embedded migrations as applied without running SQL")
	flag.Parse()

	loadDotEnv(".env")

	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL is required")
	}

	cfg := db.MigrationConfig{
		LockTimeout: durationEnv("MIGRATION_LOCK_TIMEOUT", 30*time.Second),
	}

	if *baseline {
		if err := db.BaselineMigrationsFromURL(context.Background(), databaseURL, cfg); err != nil {
			log.Fatal(err)
		}
		return
	}

	if err := db.RunMigrationsFromURL(context.Background(), databaseURL, cfg); err != nil {
		log.Fatal(err)
	}
}

func durationEnv(key string, fallback time.Duration) time.Duration {
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

func loadDotEnv(path string) {
	file, err := os.Open(path)
	if err != nil {
		return
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		key, value, ok := strings.Cut(line, "=")
		if !ok {
			continue
		}
		key = strings.TrimSpace(key)
		if key == "" || os.Getenv(key) != "" {
			continue
		}
		os.Setenv(key, strings.Trim(strings.TrimSpace(value), `"'`))
	}
	if err := scanner.Err(); err != nil {
		log.Printf("dotenv_read_failed path=%s err=%v", path, err)
	}
}
