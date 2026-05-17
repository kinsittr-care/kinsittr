package pipes

import (
	"strings"
	"time"

	convmessages "github.com/kinsittr/kinsittr-api/conversations/messages"
	"github.com/kinsittr/kinsittr-api/models"
	messagesrepo "github.com/kinsittr/kinsittr-api/repositories/messages"
	"github.com/kinsittr/kinsittr-api/repositories/notifications"
	"github.com/kinsittr/kinsittr-api/repositories/profile"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

type ConversationData struct {
	ID                       string               `json:"id"`
	BookingID                string               `json:"booking_id"`
	ParentProfileID          string               `json:"parent_profile_id"`
	NannyProfileID           string               `json:"nanny_profile_id"`
	BookingStatus            models.BookingStatus `json:"booking_status"`
	OtherParticipantName     string               `json:"other_participant_name"`
	OtherParticipantCity     string               `json:"other_participant_city,omitempty"`
	OtherParticipantProvince string               `json:"other_participant_province,omitempty"`
	LastMessagePreview       string               `json:"last_message_preview,omitempty"`
	LastMessageAt            *time.Time           `json:"last_message_at,omitempty"`
	UnreadCount              int                  `json:"unread_count"`
	LastReadAt               *time.Time           `json:"last_read_at,omitempty"`
	CreatedAt                time.Time            `json:"created_at"`
	UpdatedAt                time.Time            `json:"updated_at"`
}

type ConversationListData struct {
	Items []ConversationData `json:"items"`
	Page  int                `json:"page"`
	Limit int                `json:"limit"`
	Total int                `json:"total"`
}

type MessageData struct {
	ID             string          `json:"id"`
	ConversationID string          `json:"conversation_id"`
	SenderUserID   string          `json:"sender_user_id"`
	SenderRole     models.UserRole `json:"sender_role"`
	Body           string          `json:"body"`
	CreatedAt      time.Time       `json:"created_at"`
	UpdatedAt      time.Time       `json:"updated_at"`
}

type MessageListData struct {
	Items []MessageData `json:"items"`
	Page  int           `json:"page"`
	Limit int           `json:"limit"`
	Total int           `json:"total"`
}

type ConversationsPipe struct {
	repo        messagesrepo.MessagesRepository
	profileRepo profile.ProfileRepository
	notifyRepo  notifications.NotificationsRepository
}

func NewConversationsPipe(repo messagesrepo.MessagesRepository, profileRepo profile.ProfileRepository, notifyRepo ...notifications.NotificationsRepository) *ConversationsPipe {
	var notificationsRepo notifications.NotificationsRepository
	if len(notifyRepo) > 0 {
		notificationsRepo = notifyRepo[0]
	}
	return &ConversationsPipe{repo: repo, profileRepo: profileRepo, notifyRepo: notificationsRepo}
}

func toConversationData(record messagesrepo.ConversationRecord) ConversationData {
	return ConversationData{
		ID:                       record.ID.String(),
		BookingID:                record.BookingID.String(),
		ParentProfileID:          record.ParentProfileID.String(),
		NannyProfileID:           record.NannyProfileID.String(),
		BookingStatus:            record.BookingStatus,
		OtherParticipantName:     record.OtherParticipantName,
		OtherParticipantCity:     record.OtherParticipantCity,
		OtherParticipantProvince: record.OtherParticipantProvince,
		LastMessagePreview:       record.LastMessagePreview,
		LastMessageAt:            record.LastMessageAt,
		UnreadCount:              record.UnreadCount,
		LastReadAt:               record.LastReadAt,
		CreatedAt:                record.CreatedAt,
		UpdatedAt:                record.UpdatedAt,
	}
}

func toMessageData(message models.Message) MessageData {
	return MessageData{
		ID:             message.ID.String(),
		ConversationID: message.ConversationID.String(),
		SenderUserID:   message.SenderUserID.String(),
		SenderRole:     message.SenderRole,
		Body:           message.Body,
		CreatedAt:      message.CreatedAt,
		UpdatedAt:      message.UpdatedAt,
	}
}

func normalizePageLimit(page, limit, defaultLimit int) (int, int) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = defaultLimit
	}
	if limit > 100 {
		limit = 100
	}
	return page, limit
}

func trimmedBody(body string) string {
	return strings.TrimSpace(body)
}

func pipeError[T any](message string) *shared.PipeRes[T] {
	return &shared.PipeRes[T]{
		Success: false,
		Message: shared.CreatePipeMessage(message),
	}
}

func pipeSuccess[T any](message string, data *T) *shared.PipeRes[T] {
	return &shared.PipeRes[T]{
		Success: true,
		Message: shared.CreatePipeMessage(message),
		Data:    data,
	}
}

func conversationNotFound[T any]() *shared.PipeRes[T] {
	return pipeError[T](convmessages.Conversation_Not_Found)
}
