package messages

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/kinsittr/kinsittr-api/models"
)

type ConversationRecord struct {
	models.Conversation
	BookingStatus              models.BookingStatus `json:"booking_status"`
	OtherParticipantName       string               `json:"other_participant_name"`
	OtherParticipantPublicSlug string               `json:"other_participant_public_slug"`
	OtherParticipantCity       string               `json:"other_participant_city"`
	OtherParticipantProvince   string               `json:"other_participant_province"`
	LastMessagePreview         string               `json:"last_message_preview"`
	LastMessageAt              *time.Time           `json:"last_message_at"`
	UnreadCount                int                  `json:"unread_count"`
	LastReadAt                 *time.Time           `json:"last_read_at"`
	LockedAt                   *time.Time           `json:"locked_at"`
}

type MessageListFilter struct {
	Page  int
	Limit int
}

type ConversationListFilter struct {
	Page   int
	Limit  int
	UserID uuid.UUID
}

type MessagesRepository interface {
	GetConversationByBookingID(ctx context.Context, bookingID uuid.UUID) (models.Conversation, error)
	CreateConversation(ctx context.Context, conversation models.Conversation) (models.Conversation, error)
	ListParentConversations(ctx context.Context, parentProfileID uuid.UUID, filter ConversationListFilter) ([]ConversationRecord, int, error)
	ListNannyConversations(ctx context.Context, nannyProfileID uuid.UUID, filter ConversationListFilter) ([]ConversationRecord, int, error)
	GetParentConversationByID(ctx context.Context, conversationID, parentProfileID, userID uuid.UUID) (ConversationRecord, error)
	GetNannyConversationByID(ctx context.Context, conversationID, nannyProfileID, userID uuid.UUID) (ConversationRecord, error)
	ListMessages(ctx context.Context, conversationID uuid.UUID, filter MessageListFilter) ([]models.Message, int, error)
	CreateMessage(ctx context.Context, message models.Message) (models.Message, error)
	MarkConversationRead(ctx context.Context, conversationID, userID uuid.UUID) (models.ConversationRead, error)
}

var MessagesRepo MessagesRepository

func InitMessagesRepo(db *pgxpool.Pool) {
	MessagesRepo = newPgRepository(db)
}
