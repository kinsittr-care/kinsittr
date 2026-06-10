package admin

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/kinsittr/kinsittr-api/models"
)

func (r *pgRepository) ListNannyActions(ctx context.Context, nannyProfileID uuid.UUID, page, limit int) ([]AdminAuditActionRecord, int, error) {
	page, limit = normalizePageLimit(page, limit, 20, 100)

	var total int
	if err := r.db.QueryRow(ctx, `
		SELECT COUNT(*)::int
		FROM (
			SELECT id FROM admin_nanny_actions WHERE nanny_profile_id = $1
			UNION ALL
			SELECT id FROM admin_account_actions WHERE target_profile_id = $1 AND target_role = $2
		) actions
	`, nannyProfileID, models.NannyUserRole).Scan(&total); err != nil {
		return nil, 0, err
	}

	rows, err := r.db.Query(ctx, `
		SELECT id, admin_user_id, admin_email, action, reason, previous_status, new_status, message_id, target_role, created_at
		FROM (
			SELECT ana.id, ana.admin_user_id, u.email AS admin_email, ana.action, ana.reason,
			       ana.previous_status::text AS previous_status, ana.new_status::text AS new_status,
			       NULL::uuid AS message_id, $2::text AS target_role, ana.created_at
			FROM admin_nanny_actions ana
			LEFT JOIN users u ON u.id = ana.admin_user_id
			WHERE ana.nanny_profile_id = $1
			UNION ALL
			SELECT aaa.id, aaa.admin_user_id, u.email AS admin_email, aaa.action, aaa.reason,
			       NULL::text AS previous_status, NULL::text AS new_status,
			       NULL::uuid AS message_id, aaa.target_role, aaa.created_at
			FROM admin_account_actions aaa
			LEFT JOIN users u ON u.id = aaa.admin_user_id
			WHERE aaa.target_profile_id = $1 AND aaa.target_role = $2
		) actions
		ORDER BY created_at DESC
		LIMIT $3 OFFSET $4
	`, nannyProfileID, models.NannyUserRole, limit, (page-1)*limit)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	return scanAdminAuditActions(rows, limit, total)
}

func (r *pgRepository) ListParentActions(ctx context.Context, parentProfileID uuid.UUID, page, limit int) ([]AdminAuditActionRecord, int, error) {
	page, limit = normalizePageLimit(page, limit, 20, 100)

	var total int
	if err := r.db.QueryRow(ctx, `
		SELECT COUNT(*)::int
		FROM admin_account_actions
		WHERE target_profile_id = $1 AND target_role = $2
	`, parentProfileID, models.ParentUserRole).Scan(&total); err != nil {
		return nil, 0, err
	}

	rows, err := r.db.Query(ctx, `
		SELECT aaa.id, aaa.admin_user_id, u.email AS admin_email, aaa.action, aaa.reason,
		       NULL::text AS previous_status, NULL::text AS new_status,
		       NULL::uuid AS message_id, aaa.target_role, aaa.created_at
		FROM admin_account_actions aaa
		LEFT JOIN users u ON u.id = aaa.admin_user_id
		WHERE aaa.target_profile_id = $1 AND aaa.target_role = $2
		ORDER BY aaa.created_at DESC
		LIMIT $3 OFFSET $4
	`, parentProfileID, models.ParentUserRole, limit, (page-1)*limit)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	return scanAdminAuditActions(rows, limit, total)
}

func (r *pgRepository) ListConversationActions(ctx context.Context, conversationID uuid.UUID, page, limit int) ([]AdminAuditActionRecord, int, error) {
	page, limit = normalizePageLimit(page, limit, 20, 100)

	var total int
	if err := r.db.QueryRow(ctx, `
		SELECT COUNT(*)::int
		FROM admin_conversation_actions
		WHERE conversation_id = $1
	`, conversationID).Scan(&total); err != nil {
		return nil, 0, err
	}

	rows, err := r.db.Query(ctx, `
		SELECT aca.id, aca.admin_user_id, u.email AS admin_email, aca.action, aca.reason,
		       NULL::text AS previous_status, NULL::text AS new_status,
		       aca.message_id, ''::text AS target_role, aca.created_at
		FROM admin_conversation_actions aca
		LEFT JOIN users u ON u.id = aca.admin_user_id
		WHERE aca.conversation_id = $1
		ORDER BY aca.created_at DESC
		LIMIT $2 OFFSET $3
	`, conversationID, limit, (page-1)*limit)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	return scanAdminAuditActions(rows, limit, total)
}

func scanAdminAuditActions(rows pgx.Rows, limit, total int) ([]AdminAuditActionRecord, int, error) {
	items := make([]AdminAuditActionRecord, 0, limit)
	for rows.Next() {
		var item AdminAuditActionRecord
		if err := rows.Scan(
			&item.ID,
			&item.AdminUserID,
			&item.AdminEmail,
			&item.Action,
			&item.Reason,
			&item.PreviousStatus,
			&item.NewStatus,
			&item.MessageID,
			&item.TargetRole,
			&item.CreatedAt,
		); err != nil {
			return nil, 0, err
		}
		items = append(items, item)
	}
	return items, total, rows.Err()
}
