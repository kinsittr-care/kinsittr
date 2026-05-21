package pipes

import (
	"time"

	"github.com/kinsittr/kinsittr-api/models"
	repository "github.com/kinsittr/kinsittr-api/repositories/admin"
)

type AdminAuditActionData struct {
	ID             string          `json:"id"`
	AdminUserID    *string         `json:"admin_user_id,omitempty"`
	AdminEmail     *string         `json:"admin_email,omitempty"`
	Action         string          `json:"action"`
	Reason         *string         `json:"reason,omitempty"`
	PreviousStatus *string         `json:"previous_status,omitempty"`
	NewStatus      *string         `json:"new_status,omitempty"`
	MessageID      *string         `json:"message_id,omitempty"`
	TargetRole     models.UserRole `json:"target_role,omitempty"`
	CreatedAt      time.Time       `json:"created_at"`
}

type AdminAuditActionListData struct {
	Items []AdminAuditActionData `json:"items"`
	Page  int                    `json:"page"`
	Limit int                    `json:"limit"`
	Total int                    `json:"total"`
}

func toAdminAuditActionData(record repository.AdminAuditActionRecord) AdminAuditActionData {
	var adminUserID *string
	if record.AdminUserID != nil {
		value := record.AdminUserID.String()
		adminUserID = &value
	}
	var messageID *string
	if record.MessageID != nil {
		value := record.MessageID.String()
		messageID = &value
	}
	return AdminAuditActionData{
		ID:             record.ID.String(),
		AdminUserID:    adminUserID,
		AdminEmail:     record.AdminEmail,
		Action:         record.Action,
		Reason:         record.Reason,
		PreviousStatus: record.PreviousStatus,
		NewStatus:      record.NewStatus,
		MessageID:      messageID,
		TargetRole:     record.TargetRole,
		CreatedAt:      record.CreatedAt,
	}
}

func toAdminAuditActionListData(itemsRaw []repository.AdminAuditActionRecord, page, limit, total int) *AdminAuditActionListData {
	items := make([]AdminAuditActionData, 0, len(itemsRaw))
	for _, item := range itemsRaw {
		items = append(items, toAdminAuditActionData(item))
	}
	return &AdminAuditActionListData{Items: items, Page: page, Limit: limit, Total: total}
}
