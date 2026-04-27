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

	// profiles
	CreateNannyProfile(ctx context.Context, profile models.NannyProfile) (models.NannyProfile, error)
	CreateParentProfile(ctx context.Context, profile models.ParentProfile) (models.ParentProfile, error)
	GetNannyProfileByUserID(ctx context.Context, userID uuid.UUID) (models.NannyProfile, error)
	GetParentProfileByUserID(ctx context.Context, userID uuid.UUID) (models.ParentProfile, error)
	UpdateNannyProfile(ctx context.Context, profile models.NannyProfile) (models.NannyProfile, error)
	UpdateParentProfile(ctx context.Context, profile models.ParentProfile) (models.ParentProfile, error)
	DeleteNannyProfile(ctx context.Context, userID uuid.UUID) error
	DeleteParentProfile(ctx context.Context, userID uuid.UUID) error

	// refresh sessions
	CreateRefreshSession(ctx context.Context, session models.RefreshSession) error
	GetRefreshSessionByID(ctx context.Context, sessionID uuid.UUID) (models.RefreshSession, error)
	RotateRefreshSession(ctx context.Context, oldSessionID uuid.UUID, newSession models.RefreshSession) error
	DeleteRefreshSession(ctx context.Context, sessionID uuid.UUID) error
}

var AccountRepo AccountRepository

func InitAccountRepo(db *pgxpool.Pool) {
	AccountRepo = newPgRepository(db)
}
