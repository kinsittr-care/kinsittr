package notifications

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/kinsittr/kinsittr-api/models"
)

type pgRepository struct {
	db *pgxpool.Pool
}

func (r *pgRepository) CreateBookingReminder24h(ctx context.Context, windowStart, windowEnd time.Time) (int64, error) {
	tag, err := r.db.Exec(ctx, `
		WITH due_bookings AS (
			SELECT b.id, b.start_time, pp.user_id AS parent_user_id, np.user_id AS nanny_user_id
			FROM bookings b
			INNER JOIN parent_profiles pp ON pp.id = b.parent_profile_id
			INNER JOIN nanny_profiles np ON np.id = b.nanny_profile_id
			WHERE b.status = 'approved'
			  AND b.start_time >= $1
			  AND b.start_time < $2
		),
		parent_reminders AS (
			INSERT INTO notifications (id, user_id, role, type, title, body, data)
			SELECT (
				   substr(md5(db.id::text || ':parent:booking_reminder_24h'), 1, 8) || '-' ||
				   substr(md5(db.id::text || ':parent:booking_reminder_24h'), 9, 4) || '-' ||
				   substr(md5(db.id::text || ':parent:booking_reminder_24h'), 13, 4) || '-' ||
				   substr(md5(db.id::text || ':parent:booking_reminder_24h'), 17, 4) || '-' ||
				   substr(md5(db.id::text || ':parent:booking_reminder_24h'), 21, 12)
			       )::uuid, db.parent_user_id, 'parent', $3,
			       'Booking starts in 24 hours',
			       'Your booking starts in about 24 hours.',
			       jsonb_build_object('booking_id', db.id::text)
			FROM due_bookings db
			WHERE NOT EXISTS (
				SELECT 1 FROM notifications n
				WHERE n.user_id = db.parent_user_id
				  AND n.role = 'parent'
				  AND n.type = $3
				  AND n.data->>'booking_id' = db.id::text
			)
			RETURNING 1
		),
		nanny_reminders AS (
			INSERT INTO notifications (id, user_id, role, type, title, body, data)
			SELECT (
				   substr(md5(db.id::text || ':nanny:booking_reminder_24h'), 1, 8) || '-' ||
				   substr(md5(db.id::text || ':nanny:booking_reminder_24h'), 9, 4) || '-' ||
				   substr(md5(db.id::text || ':nanny:booking_reminder_24h'), 13, 4) || '-' ||
				   substr(md5(db.id::text || ':nanny:booking_reminder_24h'), 17, 4) || '-' ||
				   substr(md5(db.id::text || ':nanny:booking_reminder_24h'), 21, 12)
			       )::uuid, db.nanny_user_id, 'nanny', $3,
			       'Booking starts in 24 hours',
			       'Your booking starts in about 24 hours.',
			       jsonb_build_object('booking_id', db.id::text)
			FROM due_bookings db
			WHERE NOT EXISTS (
				SELECT 1 FROM notifications n
				WHERE n.user_id = db.nanny_user_id
				  AND n.role = 'nanny'
				  AND n.type = $3
				  AND n.data->>'booking_id' = db.id::text
			)
			RETURNING 1
		)
		SELECT 1
		FROM parent_reminders
		UNION ALL
		SELECT 1
		FROM nanny_reminders
	`, windowStart, windowEnd, models.BookingReminder24hNotificationType)
	if err != nil {
		return 0, err
	}
	return tag.RowsAffected(), nil
}

func newPgRepository(db *pgxpool.Pool) *pgRepository {
	return &pgRepository{db: db}
}

func normalizeFilter(filter ListNotificationsFilter) ListNotificationsFilter {
	if filter.Page < 1 {
		filter.Page = 1
	}
	if filter.Limit < 1 {
		filter.Limit = 20
	}
	if filter.Limit > 100 {
		filter.Limit = 100
	}
	return filter
}

func scanNotification(row pgx.Row) (models.Notification, error) {
	var notification models.Notification
	err := row.Scan(
		&notification.ID,
		&notification.UserID,
		&notification.Role,
		&notification.Type,
		&notification.Title,
		&notification.Body,
		&notification.Data,
		&notification.ReadAt,
		&notification.CreatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return models.Notification{}, nil
	}
	return notification, err
}

func (r *pgRepository) Create(ctx context.Context, notification models.Notification) (models.Notification, error) {
	if notification.ID == uuid.Nil {
		notification.ID = uuid.New()
	}
	if len(notification.Data) == 0 {
		notification.Data = []byte("{}")
	}

	return scanNotification(r.db.QueryRow(ctx, `
		INSERT INTO notifications (id, user_id, role, type, title, body, data)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, user_id, role, type, title, body, data, read_at, created_at
	`, notification.ID, notification.UserID, notification.Role, notification.Type, notification.Title, notification.Body, notification.Data))
}

func (r *pgRepository) CreateForParentProfileID(ctx context.Context, parentProfileID uuid.UUID, notification models.Notification) (models.Notification, error) {
	var userID uuid.UUID
	if err := r.db.QueryRow(ctx, `SELECT user_id FROM parent_profiles WHERE id = $1`, parentProfileID).Scan(&userID); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return models.Notification{}, nil
		}
		return models.Notification{}, err
	}
	notification.UserID = userID
	notification.Role = models.ParentUserRole
	return r.Create(ctx, notification)
}

func (r *pgRepository) CreateForNannyProfileID(ctx context.Context, nannyProfileID uuid.UUID, notification models.Notification) (models.Notification, error) {
	var userID uuid.UUID
	if err := r.db.QueryRow(ctx, `SELECT user_id FROM nanny_profiles WHERE id = $1`, nannyProfileID).Scan(&userID); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return models.Notification{}, nil
		}
		return models.Notification{}, err
	}
	notification.UserID = userID
	notification.Role = models.NannyUserRole
	return r.Create(ctx, notification)
}

func (r *pgRepository) List(ctx context.Context, userID uuid.UUID, role models.UserRole, filter ListNotificationsFilter) ([]models.Notification, int, error) {
	filter = normalizeFilter(filter)
	args := []any{userID, role}
	where := "user_id = $1 AND role = $2"
	if filter.UnreadOnly {
		where += " AND read_at IS NULL"
	}

	var total int
	countQuery := fmt.Sprintf(`SELECT COUNT(*) FROM notifications WHERE %s`, where)
	if err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	args = append(args, filter.Limit, (filter.Page-1)*filter.Limit)
	query := fmt.Sprintf(`
		SELECT id, user_id, role, type, title, body, data, read_at, created_at
		FROM notifications
		WHERE %s
		ORDER BY created_at DESC
		LIMIT $%d OFFSET $%d
	`, where, len(args)-1, len(args))

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	items := make([]models.Notification, 0)
	for rows.Next() {
		notification, err := scanNotification(rows)
		if err != nil {
			return nil, 0, err
		}
		items = append(items, notification)
	}
	return items, total, rows.Err()
}

func (r *pgRepository) CountUnread(ctx context.Context, userID uuid.UUID, role models.UserRole) (int, error) {
	var total int
	err := r.db.QueryRow(ctx, `
		SELECT COUNT(*)
		FROM notifications
		WHERE user_id = $1 AND role = $2 AND read_at IS NULL
	`, userID, role).Scan(&total)
	return total, err
}

func (r *pgRepository) MarkRead(ctx context.Context, userID uuid.UUID, role models.UserRole, notificationID uuid.UUID) (models.Notification, error) {
	return scanNotification(r.db.QueryRow(ctx, `
		UPDATE notifications
		SET read_at = COALESCE(read_at, NOW())
		WHERE id = $1 AND user_id = $2 AND role = $3
		RETURNING id, user_id, role, type, title, body, data, read_at, created_at
	`, notificationID, userID, role))
}

func (r *pgRepository) MarkAllRead(ctx context.Context, userID uuid.UUID, role models.UserRole) (int, error) {
	tag, err := r.db.Exec(ctx, `
		UPDATE notifications
		SET read_at = COALESCE(read_at, NOW())
		WHERE user_id = $1 AND role = $2 AND read_at IS NULL
	`, userID, role)
	if err != nil {
		return 0, err
	}
	return int(tag.RowsAffected()), nil
}
