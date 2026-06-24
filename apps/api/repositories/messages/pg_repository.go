package messages

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/kinsittr/kinsittr-api/models"
)

type pgRepository struct {
	db *pgxpool.Pool
}

func newPgRepository(db *pgxpool.Pool) *pgRepository {
	return &pgRepository{db: db}
}

const nannyPublicSlugExpr = `COALESCE(NULLIF(TRIM(BOTH '-' FROM LOWER(REGEXP_REPLACE(TRIM(np.display_name), '[^a-zA-Z0-9]+', '-', 'g'))), ''), 'nanny') || '-' || SUBSTRING(MD5(np.id::text), 1, 8)`

func normalizeConversationFilter(filter ConversationListFilter) ConversationListFilter {
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

func normalizeMessageFilter(filter MessageListFilter) MessageListFilter {
	if filter.Page < 1 {
		filter.Page = 1
	}
	if filter.Limit < 1 {
		filter.Limit = 50
	}
	if filter.Limit > 100 {
		filter.Limit = 100
	}
	return filter
}

func (r *pgRepository) GetConversationByBookingID(ctx context.Context, bookingID uuid.UUID) (models.Conversation, error) {
	var conversation models.Conversation
	err := r.db.QueryRow(ctx, `
		SELECT id, booking_id, parent_profile_id, nanny_profile_id, created_at, updated_at
		FROM conversations
		WHERE booking_id = $1
	`, bookingID).Scan(
		&conversation.ID,
		&conversation.BookingID,
		&conversation.ParentProfileID,
		&conversation.NannyProfileID,
		&conversation.CreatedAt,
		&conversation.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return models.Conversation{}, nil
	}
	return conversation, err
}

func (r *pgRepository) CreateConversation(ctx context.Context, conversation models.Conversation) (models.Conversation, error) {
	var created models.Conversation
	err := r.db.QueryRow(ctx, `
		INSERT INTO conversations (id, booking_id, parent_profile_id, nanny_profile_id)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (booking_id) DO UPDATE SET updated_at = conversations.updated_at
		RETURNING id, booking_id, parent_profile_id, nanny_profile_id, created_at, updated_at
	`, conversation.ID, conversation.BookingID, conversation.ParentProfileID, conversation.NannyProfileID).Scan(
		&created.ID,
		&created.BookingID,
		&created.ParentProfileID,
		&created.NannyProfileID,
		&created.CreatedAt,
		&created.UpdatedAt,
	)
	return created, err
}

func (r *pgRepository) listConversations(ctx context.Context, column string, profileID uuid.UUID, filter ConversationListFilter) ([]ConversationRecord, int, error) {
	filter = normalizeConversationFilter(filter)

	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM conversations c
		INNER JOIN bookings b ON b.id = c.booking_id
		INNER JOIN parent_profiles pp ON pp.id = c.parent_profile_id
		INNER JOIN nanny_profiles np ON np.id = c.nanny_profile_id
		WHERE c.%s = $1
	`, column)
	var total int
	if err := r.db.QueryRow(ctx, countQuery, profileID).Scan(&total); err != nil {
		return nil, 0, err
	}

	query := fmt.Sprintf(`
		SELECT c.id, c.booking_id, c.parent_profile_id, c.nanny_profile_id, c.created_at, c.updated_at,
		       b.status,
		       CASE WHEN $1 = c.parent_profile_id THEN np.display_name ELSE pp.display_name END AS other_name,
		       CASE WHEN $1 = c.parent_profile_id THEN `+nannyPublicSlugExpr+` ELSE '' END AS other_public_slug,
		       CASE WHEN $1 = c.parent_profile_id THEN np.city ELSE pp.city END AS other_city,
		       CASE WHEN $1 = c.parent_profile_id THEN np.province ELSE pp.province END AS other_province,
			       COALESCE(LEFT(lm.body, 100), '') AS last_message_preview,
			       lm.created_at,
			       COALESCE(unread.unread_count, 0) AS unread_count,
			       cr.last_read_at,
			       c.locked_at
			FROM conversations c
			INNER JOIN bookings b ON b.id = c.booking_id
			INNER JOIN parent_profiles pp ON pp.id = c.parent_profile_id
			INNER JOIN nanny_profiles np ON np.id = c.nanny_profile_id
			LEFT JOIN conversation_reads cr ON cr.conversation_id = c.id AND cr.user_id = $2
			LEFT JOIN LATERAL (
			    SELECT body, created_at
			    FROM messages m
			    WHERE m.conversation_id = c.id
			      AND m.hidden_at IS NULL
			    ORDER BY m.created_at DESC
			    LIMIT 1
			) lm ON true
			LEFT JOIN LATERAL (
			    SELECT COUNT(*)::int AS unread_count
			    FROM messages m
			    WHERE m.conversation_id = c.id
			      AND m.hidden_at IS NULL
			      AND m.sender_user_id <> $2
			      AND (cr.last_read_at IS NULL OR m.created_at > cr.last_read_at)
			) unread ON true
			WHERE c.%s = $1
			ORDER BY COALESCE(lm.created_at, c.updated_at) DESC, c.created_at DESC
			LIMIT $3 OFFSET $4
		`, column)

	rows, err := r.db.Query(ctx, query, profileID, filter.UserID, filter.Limit, (filter.Page-1)*filter.Limit)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	items := make([]ConversationRecord, 0)
	for rows.Next() {
		var record ConversationRecord
		if err := rows.Scan(
			&record.ID,
			&record.BookingID,
			&record.ParentProfileID,
			&record.NannyProfileID,
			&record.CreatedAt,
			&record.UpdatedAt,
			&record.BookingStatus,
			&record.OtherParticipantName,
			&record.OtherParticipantPublicSlug,
			&record.OtherParticipantCity,
			&record.OtherParticipantProvince,
			&record.LastMessagePreview,
			&record.LastMessageAt,
			&record.UnreadCount,
			&record.LastReadAt,
			&record.LockedAt,
		); err != nil {
			return nil, 0, err
		}
		items = append(items, record)
	}

	return items, total, rows.Err()
}

func (r *pgRepository) ListParentConversations(ctx context.Context, parentProfileID uuid.UUID, filter ConversationListFilter) ([]ConversationRecord, int, error) {
	return r.listConversations(ctx, "parent_profile_id", parentProfileID, filter)
}

func (r *pgRepository) ListNannyConversations(ctx context.Context, nannyProfileID uuid.UUID, filter ConversationListFilter) ([]ConversationRecord, int, error) {
	return r.listConversations(ctx, "nanny_profile_id", nannyProfileID, filter)
}

func (r *pgRepository) getConversationByID(ctx context.Context, conversationID uuid.UUID, column string, profileID, userID uuid.UUID) (ConversationRecord, error) {
	var record ConversationRecord
	query := fmt.Sprintf(`
		SELECT c.id, c.booking_id, c.parent_profile_id, c.nanny_profile_id, c.created_at, c.updated_at,
		       b.status,
		       CASE WHEN $2 = c.parent_profile_id THEN np.display_name ELSE pp.display_name END AS other_name,
		       CASE WHEN $2 = c.parent_profile_id THEN `+nannyPublicSlugExpr+` ELSE '' END AS other_public_slug,
		       CASE WHEN $2 = c.parent_profile_id THEN np.city ELSE pp.city END AS other_city,
		       CASE WHEN $2 = c.parent_profile_id THEN np.province ELSE pp.province END AS other_province,
		       COALESCE(LEFT(lm.body, 100), '') AS last_message_preview,
		       lm.created_at,
		       COALESCE(unread.unread_count, 0) AS unread_count,
		       cr.last_read_at,
		       c.locked_at
		FROM conversations c
		INNER JOIN bookings b ON b.id = c.booking_id
		INNER JOIN parent_profiles pp ON pp.id = c.parent_profile_id
		INNER JOIN nanny_profiles np ON np.id = c.nanny_profile_id
		LEFT JOIN conversation_reads cr ON cr.conversation_id = c.id AND cr.user_id = $3
		LEFT JOIN LATERAL (
		    SELECT body, created_at
		    FROM messages m
		    WHERE m.conversation_id = c.id
		      AND m.hidden_at IS NULL
		    ORDER BY m.created_at DESC
		    LIMIT 1
		) lm ON true
		LEFT JOIN LATERAL (
		    SELECT COUNT(*)::int AS unread_count
		    FROM messages m
		    WHERE m.conversation_id = c.id
		      AND m.hidden_at IS NULL
		      AND m.sender_user_id <> $3
		      AND (cr.last_read_at IS NULL OR m.created_at > cr.last_read_at)
		) unread ON true
		WHERE c.id = $1 AND c.%s = $2
	`, column)

	err := r.db.QueryRow(ctx, query, conversationID, profileID, userID).Scan(
		&record.ID,
		&record.BookingID,
		&record.ParentProfileID,
		&record.NannyProfileID,
		&record.CreatedAt,
		&record.UpdatedAt,
		&record.BookingStatus,
		&record.OtherParticipantName,
		&record.OtherParticipantPublicSlug,
		&record.OtherParticipantCity,
		&record.OtherParticipantProvince,
		&record.LastMessagePreview,
		&record.LastMessageAt,
		&record.UnreadCount,
		&record.LastReadAt,
		&record.LockedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return ConversationRecord{}, nil
	}
	return record, err
}

func (r *pgRepository) GetParentConversationByID(ctx context.Context, conversationID, parentProfileID, userID uuid.UUID) (ConversationRecord, error) {
	return r.getConversationByID(ctx, conversationID, "parent_profile_id", parentProfileID, userID)
}

func (r *pgRepository) GetNannyConversationByID(ctx context.Context, conversationID, nannyProfileID, userID uuid.UUID) (ConversationRecord, error) {
	return r.getConversationByID(ctx, conversationID, "nanny_profile_id", nannyProfileID, userID)
}

func (r *pgRepository) ListMessages(ctx context.Context, conversationID uuid.UUID, filter MessageListFilter) ([]models.Message, int, error) {
	filter = normalizeMessageFilter(filter)

	var total int
	if err := r.db.QueryRow(ctx, `SELECT COUNT(*) FROM messages WHERE conversation_id = $1 AND hidden_at IS NULL`, conversationID).Scan(&total); err != nil {
		return nil, 0, err
	}

	rows, err := r.db.Query(ctx, `
		SELECT latest_messages.id, latest_messages.conversation_id, latest_messages.sender_user_id,
		       latest_messages.sender_role, latest_messages.body, latest_messages.created_at,
		       latest_messages.updated_at
		FROM (
			SELECT messages.id, messages.conversation_id, messages.sender_user_id, messages.sender_role,
			       messages.body, messages.created_at, messages.updated_at
			FROM messages
			WHERE conversation_id = $1 AND hidden_at IS NULL
			ORDER BY created_at DESC
			LIMIT $2 OFFSET $3
		) latest_messages
		ORDER BY created_at ASC
	`, conversationID, filter.Limit, (filter.Page-1)*filter.Limit)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	items := make([]models.Message, 0)
	for rows.Next() {
		var message models.Message
		if err := rows.Scan(
			&message.ID,
			&message.ConversationID,
			&message.SenderUserID,
			&message.SenderRole,
			&message.Body,
			&message.CreatedAt,
			&message.UpdatedAt,
		); err != nil {
			return nil, 0, err
		}
		items = append(items, message)
	}

	return items, total, rows.Err()
}

func (r *pgRepository) CreateMessage(ctx context.Context, message models.Message) (models.Message, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return models.Message{}, err
	}
	defer tx.Rollback(ctx)

	var created models.Message
	err = tx.QueryRow(ctx, `
		INSERT INTO messages (id, conversation_id, sender_user_id, sender_role, body)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, conversation_id, sender_user_id, sender_role, body, created_at, updated_at
	`, message.ID, message.ConversationID, message.SenderUserID, message.SenderRole, message.Body).Scan(
		&created.ID,
		&created.ConversationID,
		&created.SenderUserID,
		&created.SenderRole,
		&created.Body,
		&created.CreatedAt,
		&created.UpdatedAt,
	)
	if err != nil {
		return models.Message{}, err
	}

	if _, err := tx.Exec(ctx, `UPDATE conversations SET updated_at = NOW() WHERE id = $1`, message.ConversationID); err != nil {
		return models.Message{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return models.Message{}, err
	}

	return created, nil
}

func (r *pgRepository) MarkConversationRead(ctx context.Context, conversationID, userID uuid.UUID) (models.ConversationRead, error) {
	var read models.ConversationRead
	err := r.db.QueryRow(ctx, `
		INSERT INTO conversation_reads (conversation_id, user_id)
		VALUES ($1, $2)
		ON CONFLICT (conversation_id, user_id)
		DO UPDATE SET last_read_at = NOW(), updated_at = NOW()
		RETURNING conversation_id, user_id, last_read_at, created_at, updated_at
	`, conversationID, userID).Scan(
		&read.ConversationID,
		&read.UserID,
		&read.LastReadAt,
		&read.CreatedAt,
		&read.UpdatedAt,
	)
	return read, err
}
