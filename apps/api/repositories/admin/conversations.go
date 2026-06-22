package admin

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/kinsittr/kinsittr-api/models"
)

func buildConversationsWhere(filter ListConversationsFilter) (string, []any) {
	clauses := []string{"1 = 1"}
	args := []any{}
	if filter.Status != "" {
		args = append(args, filter.Status)
		clauses = append(clauses, fmt.Sprintf("b.status = $%d", len(args)))
	}
	if strings.TrimSpace(filter.Search) != "" {
		args = append(args, "%"+strings.ToLower(strings.TrimSpace(filter.Search))+"%")
		clauses = append(clauses, fmt.Sprintf(`(
			LOWER(pp.display_name) LIKE $%d
			OR LOWER(np.display_name) LIKE $%d
			OR LOWER(pu.email) LIKE $%d
			OR LOWER(nu.email) LIKE $%d
			OR LOWER(pp.city) LIKE $%d
			OR LOWER(np.city) LIKE $%d
		)`, len(args), len(args), len(args), len(args), len(args), len(args)))
	}
	return strings.Join(clauses, " AND "), args
}

func scanConversationRecord(row pgx.Row) (ConversationRecord, error) {
	var record ConversationRecord
	err := row.Scan(
		&record.ID,
		&record.BookingID,
		&record.ParentProfileID,
		&record.NannyProfileID,
		&record.CreatedAt,
		&record.UpdatedAt,
		&record.BookingStatus,
		&record.ParentDisplayName,
		&record.ParentEmail,
		&record.ParentCity,
		&record.ParentProvince,
		&record.NannyDisplayName,
		&record.NannyEmail,
		&record.NannyCity,
		&record.NannyProvince,
		&record.LastMessagePreview,
		&record.LastMessageAt,
		&record.MessageCount,
		&record.LockedAt,
		&record.LockedBy,
		&record.LockReason,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return ConversationRecord{}, nil
	}
	return record, err
}

const conversationRecordSelect = `
	SELECT c.id, c.booking_id, c.parent_profile_id, c.nanny_profile_id, c.created_at, c.updated_at,
	       b.status,
	       pp.display_name, pu.email, pp.city, pp.province,
	       np.display_name, nu.email, np.city, np.province,
	       COALESCE(LEFT(lm.body, 100), '') AS last_message_preview,
	       lm.created_at,
	       COALESCE(mc.message_count, 0) AS message_count,
	       c.locked_at, c.locked_by, c.lock_reason
	FROM conversations c
	INNER JOIN bookings b ON b.id = c.booking_id
	INNER JOIN parent_profiles pp ON pp.id = c.parent_profile_id
	INNER JOIN users pu ON pu.id = pp.user_id
	INNER JOIN nanny_profiles np ON np.id = c.nanny_profile_id
	INNER JOIN users nu ON nu.id = np.user_id
	LEFT JOIN LATERAL (
		SELECT body, created_at
		FROM messages m
		WHERE m.conversation_id = c.id
		  AND m.hidden_at IS NULL
		ORDER BY m.created_at DESC
		LIMIT 1
	) lm ON true
	LEFT JOIN LATERAL (
		SELECT COUNT(*)::int AS message_count
		FROM messages m
		WHERE m.conversation_id = c.id
		  AND m.hidden_at IS NULL
	) mc ON true
`

func (r *pgRepository) ListConversations(ctx context.Context, filter ListConversationsFilter) ([]ConversationRecord, int, error) {
	filter.Page, filter.Limit = normalizePageLimit(filter.Page, filter.Limit, 20, 100)
	where, args := buildConversationsWhere(filter)

	var total int
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM conversations c
		INNER JOIN bookings b ON b.id = c.booking_id
		INNER JOIN parent_profiles pp ON pp.id = c.parent_profile_id
		INNER JOIN users pu ON pu.id = pp.user_id
		INNER JOIN nanny_profiles np ON np.id = c.nanny_profile_id
		INNER JOIN users nu ON nu.id = np.user_id
		WHERE %s
	`, where)
	if err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	args = append(args, filter.Limit, (filter.Page-1)*filter.Limit)
	query := fmt.Sprintf(`
		%s
		WHERE %s
		ORDER BY COALESCE(lm.created_at, c.updated_at) DESC, c.created_at DESC
		LIMIT $%d OFFSET $%d
	`, conversationRecordSelect, where, len(args)-1, len(args))
	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	items := make([]ConversationRecord, 0, filter.Limit)
	for rows.Next() {
		record, err := scanConversationRecord(rows)
		if err != nil {
			return nil, 0, err
		}
		items = append(items, record)
	}
	return items, total, rows.Err()
}

func (r *pgRepository) GetConversationByID(ctx context.Context, conversationID uuid.UUID) (ConversationRecord, error) {
	return scanConversationRecord(r.db.QueryRow(ctx, conversationRecordSelect+` WHERE c.id = $1`, conversationID))
}

func (r *pgRepository) ListConversationMessages(ctx context.Context, conversationID uuid.UUID, page, limit int) ([]MessageRecord, int, error) {
	page, limit = normalizePageLimit(page, limit, 50, 100)

	var total int
	if err := r.db.QueryRow(ctx, `SELECT COUNT(*) FROM messages WHERE conversation_id = $1`, conversationID).Scan(&total); err != nil {
		return nil, 0, err
	}

	rows, err := r.db.Query(ctx, `
		SELECT m.id, m.conversation_id, m.sender_user_id, m.sender_role, m.body, m.created_at, m.updated_at,
		       u.email, u.firstname, u.lastname, m.hidden_at, m.hidden_by, m.hidden_reason
		FROM (
			SELECT messages.id, messages.conversation_id, messages.sender_user_id, messages.sender_role,
			       messages.body, messages.created_at, messages.updated_at,
			       messages.hidden_at, messages.hidden_by, messages.hidden_reason
			FROM messages
			WHERE conversation_id = $1
			ORDER BY created_at DESC
			LIMIT $2 OFFSET $3
		) m
		INNER JOIN users u ON u.id = m.sender_user_id
		ORDER BY m.created_at ASC
	`, conversationID, limit, (page-1)*limit)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	items := make([]MessageRecord, 0, limit)
	for rows.Next() {
		var message MessageRecord
		if err := rows.Scan(
			&message.ID,
			&message.ConversationID,
			&message.SenderUserID,
			&message.SenderRole,
			&message.Body,
			&message.CreatedAt,
			&message.UpdatedAt,
			&message.SenderEmail,
			&message.SenderFirstname,
			&message.SenderLastname,
			&message.HiddenAt,
			&message.HiddenBy,
			&message.HiddenReason,
		); err != nil {
			return nil, 0, err
		}
		items = append(items, message)
	}
	return items, total, rows.Err()
}

func scanMessageRecord(row pgx.Row) (MessageRecord, error) {
	var message MessageRecord
	err := row.Scan(
		&message.ID,
		&message.ConversationID,
		&message.SenderUserID,
		&message.SenderRole,
		&message.Body,
		&message.CreatedAt,
		&message.UpdatedAt,
		&message.SenderEmail,
		&message.SenderFirstname,
		&message.SenderLastname,
		&message.HiddenAt,
		&message.HiddenBy,
		&message.HiddenReason,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return MessageRecord{}, nil
	}
	return message, err
}

func (r *pgRepository) LockConversation(ctx context.Context, params AdminConversationActionParams) (ConversationRecord, error) {
	if _, err := r.db.Exec(ctx, `
		UPDATE conversations
		SET locked_at = COALESCE(locked_at, NOW()),
		    locked_by = $2,
		    lock_reason = $3,
		    updated_at = NOW()
		WHERE id = $1
	`, params.ConversationID, params.AdminUserID, params.Reason); err != nil {
		return ConversationRecord{}, err
	}
	if _, err := r.db.Exec(ctx, `
		INSERT INTO admin_conversation_actions (id, conversation_id, admin_user_id, action, reason)
		VALUES ($1, $2, $3, $4, $5)
	`, uuid.New(), params.ConversationID, params.AdminUserID, string(models.AdminLockConversationAction), params.Reason); err != nil {
		return ConversationRecord{}, err
	}
	return r.GetConversationByID(ctx, params.ConversationID)
}

func (r *pgRepository) UnlockConversation(ctx context.Context, params AdminConversationActionParams) (ConversationRecord, error) {
	if _, err := r.db.Exec(ctx, `
		UPDATE conversations
		SET locked_at = NULL,
		    locked_by = NULL,
		    lock_reason = NULL,
		    updated_at = NOW()
		WHERE id = $1
	`, params.ConversationID); err != nil {
		return ConversationRecord{}, err
	}
	if _, err := r.db.Exec(ctx, `
		INSERT INTO admin_conversation_actions (id, conversation_id, admin_user_id, action, reason)
		VALUES ($1, $2, $3, $4, $5)
	`, uuid.New(), params.ConversationID, params.AdminUserID, string(models.AdminUnlockConversationAction), params.Reason); err != nil {
		return ConversationRecord{}, err
	}
	return r.GetConversationByID(ctx, params.ConversationID)
}

func (r *pgRepository) HideMessage(ctx context.Context, params AdminConversationActionParams) (MessageRecord, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return MessageRecord{}, err
	}
	defer tx.Rollback(ctx)

	tag, err := tx.Exec(ctx, `
		UPDATE messages
		SET hidden_at = COALESCE(hidden_at, NOW()),
		    hidden_by = $3,
		    hidden_reason = $4,
		    updated_at = NOW()
		WHERE id = $2 AND conversation_id = $1
	`, params.ConversationID, params.MessageID, params.AdminUserID, params.Reason)
	if err != nil {
		return MessageRecord{}, err
	}
	if tag.RowsAffected() == 0 {
		if err := tx.Commit(ctx); err != nil {
			return MessageRecord{}, err
		}
		return MessageRecord{}, nil
	}

	if _, err := tx.Exec(ctx, `
		INSERT INTO admin_conversation_actions (id, conversation_id, message_id, admin_user_id, action, reason)
		VALUES ($1, $2, $3, $4, $5, $6)
	`, uuid.New(), params.ConversationID, params.MessageID, params.AdminUserID, string(models.AdminHideMessageAction), params.Reason); err != nil {
		return MessageRecord{}, err
	}
	if err := tx.Commit(ctx); err != nil {
		return MessageRecord{}, err
	}

	return scanMessageRecord(r.db.QueryRow(ctx, `
		SELECT m.id, m.conversation_id, m.sender_user_id, m.sender_role, m.body, m.created_at, m.updated_at,
		       u.email, u.firstname, u.lastname, m.hidden_at, m.hidden_by, m.hidden_reason
		FROM messages m
		INNER JOIN users u ON u.id = m.sender_user_id
		WHERE m.id = $1 AND m.conversation_id = $2
	`, params.MessageID, params.ConversationID))
}
