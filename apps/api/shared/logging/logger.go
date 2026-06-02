package logging

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"
)

const bytesPerMegabyte = 1024 * 1024

type Config struct {
	Enabled     bool
	Dir         string
	File        string
	MaxSizeMB   int
	MaxBackups  int
	AlsoConsole bool
}

type rotatingFileWriter struct {
	mu         sync.Mutex
	path       string
	maxBytes   int64
	maxBackups int
	file       *os.File
	size       int64
}

func Configure(cfg Config) (io.Closer, error) {
	log.SetFlags(log.LstdFlags | log.Lmicroseconds | log.Lshortfile)

	if !cfg.Enabled {
		log.SetOutput(os.Stdout)
		return nil, nil
	}

	writer, err := newRotatingFileWriter(cfg)
	if err != nil {
		return nil, err
	}

	if cfg.AlsoConsole {
		log.SetOutput(io.MultiWriter(os.Stdout, writer))
	} else {
		log.SetOutput(writer)
	}

	return writer, nil
}

func newRotatingFileWriter(cfg Config) (*rotatingFileWriter, error) {
	dir := strings.TrimSpace(cfg.Dir)
	if dir == "" {
		dir = "logs"
	}

	file := strings.TrimSpace(cfg.File)
	if file == "" {
		file = "api.log"
	}

	maxSizeMB := cfg.MaxSizeMB
	if maxSizeMB <= 0 {
		maxSizeMB = 20
	}

	maxBackups := cfg.MaxBackups
	if maxBackups < 0 {
		maxBackups = 0
	}

	if err := os.MkdirAll(dir, 0o755); err != nil {
		return nil, err
	}

	writer := &rotatingFileWriter{
		path:       filepath.Join(dir, file),
		maxBytes:   int64(maxSizeMB) * bytesPerMegabyte,
		maxBackups: maxBackups,
	}
	if err := writer.open(); err != nil {
		return nil, err
	}
	return writer, nil
}

func (w *rotatingFileWriter) Write(p []byte) (int, error) {
	w.mu.Lock()
	defer w.mu.Unlock()

	if w.file == nil {
		if err := w.open(); err != nil {
			return 0, err
		}
	}

	if w.size > 0 && w.size+int64(len(p)) > w.maxBytes {
		if err := w.rotate(); err != nil {
			return 0, err
		}
	}

	n, err := w.file.Write(p)
	w.size += int64(n)
	return n, err
}

func (w *rotatingFileWriter) Close() error {
	w.mu.Lock()
	defer w.mu.Unlock()

	if w.file == nil {
		return nil
	}
	err := w.file.Close()
	w.file = nil
	return err
}

func (w *rotatingFileWriter) open() error {
	file, err := os.OpenFile(w.path, os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0o644)
	if err != nil {
		return err
	}

	info, err := file.Stat()
	if err != nil {
		file.Close()
		return err
	}

	w.file = file
	w.size = info.Size()
	return nil
}

func (w *rotatingFileWriter) rotate() error {
	if w.file != nil {
		if err := w.file.Close(); err != nil {
			return err
		}
		w.file = nil
	}

	backupPath := w.backupPath()
	if err := os.Rename(w.path, backupPath); err != nil && !os.IsNotExist(err) {
		return err
	}
	if err := w.pruneBackups(); err != nil {
		return err
	}
	return w.open()
}

func (w *rotatingFileWriter) backupPath() string {
	dir := filepath.Dir(w.path)
	ext := filepath.Ext(w.path)
	base := strings.TrimSuffix(filepath.Base(w.path), ext)
	timestamp := time.Now().UTC().Format("20060102T150405.000000000")
	return filepath.Join(dir, fmt.Sprintf("%s-%s%s", base, timestamp, ext))
}

func (w *rotatingFileWriter) pruneBackups() error {
	if w.maxBackups == 0 {
		return nil
	}

	pattern := backupGlob(w.path)
	matches, err := filepath.Glob(pattern)
	if err != nil {
		return err
	}
	if len(matches) <= w.maxBackups {
		return nil
	}

	sort.Strings(matches)
	for _, match := range matches[:len(matches)-w.maxBackups] {
		if err := os.Remove(match); err != nil && !os.IsNotExist(err) {
			return err
		}
	}
	return nil
}

func backupGlob(path string) string {
	dir := filepath.Dir(path)
	ext := filepath.Ext(path)
	base := strings.TrimSuffix(filepath.Base(path), ext)
	return filepath.Join(dir, base+"-*"+ext)
}

func EmailHash(email string) string {
	email = strings.ToLower(strings.TrimSpace(email))
	if email == "" {
		return ""
	}
	sum := sha256.Sum256([]byte(email))
	return hex.EncodeToString(sum[:8])
}

func EmailDomain(email string) string {
	email = strings.ToLower(strings.TrimSpace(email))
	_, domain, ok := strings.Cut(email, "@")
	if !ok {
		return ""
	}
	return domain
}

func EmailLogFields(email string) (string, string) {
	return EmailHash(email), EmailDomain(email)
}
