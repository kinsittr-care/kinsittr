package payments

import (
	"errors"
	"testing"

	"github.com/jackc/pgx/v5/pgconn"
)

func TestIsUniqueViolation(t *testing.T) {
	if !isUniqueViolation(&pgconn.PgError{Code: "23505"}) {
		t.Fatal("expected PostgreSQL unique violation to be detected")
	}
	if isUniqueViolation(&pgconn.PgError{Code: "23503"}) {
		t.Fatal("did not expect foreign key violation to be treated as unique violation")
	}
	if isUniqueViolation(errors.New("plain error")) {
		t.Fatal("did not expect plain error to be treated as unique violation")
	}
}
