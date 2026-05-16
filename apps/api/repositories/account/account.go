package account

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/kinsittr/kinsittr-api/models"
)

type AccountRepository interface {
	// users
	UserExistsByEmail(ctx context.Context, email string) (bool, error)
	CreateUser(ctx context.Context, user models.User) (models.User, error)
	GetUserByEmail(ctx context.Context, email string) (models.User, error)
	GetUserByID(ctx context.Context, userID uuid.UUID) (models.User, error)
	CreateParentAccount(ctx context.Context, user models.User, profile models.ParentProfile) (models.User, error)
	CreateNannyAccount(ctx context.Context, user models.User, profile models.NannyProfile) (models.User, error)
	UpdateUserPassword(ctx context.Context, userID uuid.UUID, passwordHash string) error
	DeactivateUser(ctx context.Context, userID uuid.UUID) error

	// refresh sessions
	CreateRefreshSession(ctx context.Context, session models.RefreshSession) error
	GetRefreshSessionByID(ctx context.Context, sessionID uuid.UUID) (models.RefreshSession, error)
	RotateRefreshSession(ctx context.Context, oldSessionID uuid.UUID, newSession models.RefreshSession) error
	DeleteRefreshSession(ctx context.Context, sessionID uuid.UUID) error
	DeleteRefreshSessionsByUserID(ctx context.Context, userID uuid.UUID) error
}

var AccountRepo AccountRepository

func InitAccountRepo(db *pgxpool.Pool) {
	AccountRepo = newPgRepository(db)
}
