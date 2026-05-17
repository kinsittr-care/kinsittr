package pipes

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/conversations/dtos"
	convmessages "github.com/kinsittr/kinsittr-api/conversations/messages"
	"github.com/kinsittr/kinsittr-api/models"
	messagesrepo "github.com/kinsittr/kinsittr-api/repositories/messages"
	"github.com/kinsittr/kinsittr-api/repositories/profile"
)

type mockMessagesRepo struct {
	parentConversations      []messagesrepo.ConversationRecord
	parentConversationsTotal int
	parentConversationsErr   error
	nannyConversations       []messagesrepo.ConversationRecord
	nannyConversationsTotal  int
	nannyConversationsErr    error
	parentConversation       messagesrepo.ConversationRecord
	parentConversationErr    error
	nannyConversation        messagesrepo.ConversationRecord
	nannyConversationErr     error
	messages                 []models.Message
	messagesTotal            int
	messagesErr              error
	createdMessage           models.Message
	createMessageErr         error
	lastMessage              models.Message
	readConversationID       uuid.UUID
	readUserID               uuid.UUID
	markReadErr              error
}

func (m *mockMessagesRepo) GetConversationByBookingID(_ context.Context, _ uuid.UUID) (models.Conversation, error) {
	return models.Conversation{}, nil
}

func (m *mockMessagesRepo) CreateConversation(_ context.Context, conversation models.Conversation) (models.Conversation, error) {
	return conversation, nil
}

func (m *mockMessagesRepo) ListParentConversations(_ context.Context, _ uuid.UUID, _ messagesrepo.ConversationListFilter) ([]messagesrepo.ConversationRecord, int, error) {
	return m.parentConversations, m.parentConversationsTotal, m.parentConversationsErr
}

func (m *mockMessagesRepo) ListNannyConversations(_ context.Context, _ uuid.UUID, _ messagesrepo.ConversationListFilter) ([]messagesrepo.ConversationRecord, int, error) {
	return m.nannyConversations, m.nannyConversationsTotal, m.nannyConversationsErr
}

func (m *mockMessagesRepo) GetParentConversationByID(_ context.Context, _, _, _ uuid.UUID) (messagesrepo.ConversationRecord, error) {
	return m.parentConversation, m.parentConversationErr
}

func (m *mockMessagesRepo) GetNannyConversationByID(_ context.Context, _, _, _ uuid.UUID) (messagesrepo.ConversationRecord, error) {
	return m.nannyConversation, m.nannyConversationErr
}

func (m *mockMessagesRepo) ListMessages(_ context.Context, _ uuid.UUID, _ messagesrepo.MessageListFilter) ([]models.Message, int, error) {
	return m.messages, m.messagesTotal, m.messagesErr
}

func (m *mockMessagesRepo) CreateMessage(_ context.Context, message models.Message) (models.Message, error) {
	m.lastMessage = message
	if m.createdMessage.ID != uuid.Nil {
		return m.createdMessage, m.createMessageErr
	}
	return message, m.createMessageErr
}

func (m *mockMessagesRepo) MarkConversationRead(_ context.Context, conversationID, userID uuid.UUID) (models.ConversationRead, error) {
	m.readConversationID = conversationID
	m.readUserID = userID
	return models.ConversationRead{ConversationID: conversationID, UserID: userID, LastReadAt: time.Now().UTC()}, m.markReadErr
}

type mockProfileRepo struct {
	parentProfile    models.ParentProfile
	parentProfileErr error
	nannyProfile     models.NannyProfile
	nannyProfileErr  error
}

func (m *mockProfileRepo) CreateNannyProfile(_ context.Context, p models.NannyProfile) (models.NannyProfile, error) {
	return p, nil
}
func (m *mockProfileRepo) CreateParentProfile(_ context.Context, p models.ParentProfile) (models.ParentProfile, error) {
	return p, nil
}
func (m *mockProfileRepo) GetNannyProfileByUserID(_ context.Context, _ uuid.UUID) (models.NannyProfile, error) {
	return m.nannyProfile, m.nannyProfileErr
}
func (m *mockProfileRepo) GetParentProfileByUserID(_ context.Context, _ uuid.UUID) (models.ParentProfile, error) {
	return m.parentProfile, m.parentProfileErr
}
func (m *mockProfileRepo) UpdateNannyProfile(_ context.Context, p models.NannyProfile) (models.NannyProfile, error) {
	return p, nil
}
func (m *mockProfileRepo) UpdateParentProfile(_ context.Context, p models.ParentProfile) (models.ParentProfile, error) {
	return p, nil
}
func (m *mockProfileRepo) GetOrCreateParentSettings(_ context.Context, userID uuid.UUID) (models.ParentSettings, error) {
	return models.ParentSettings{ID: uuid.New(), UserID: userID}, nil
}
func (m *mockProfileRepo) UpdateParentSettings(_ context.Context, settings models.ParentSettings) (models.ParentSettings, error) {
	if settings.ID == uuid.Nil {
		settings.ID = uuid.New()
	}
	return settings, nil
}
func (m *mockProfileRepo) DeleteNannyProfile(_ context.Context, _ uuid.UUID) error  { return nil }
func (m *mockProfileRepo) DeleteParentProfile(_ context.Context, _ uuid.UUID) error { return nil }

var _ profile.ProfileRepository = (*mockProfileRepo)(nil)

func newConversationsPipe(repo *mockMessagesRepo, profileRepo *mockProfileRepo) *ConversationsPipe {
	return NewConversationsPipe(repo, profileRepo)
}

func validConversationRecord() messagesrepo.ConversationRecord {
	now := time.Now().UTC()
	return messagesrepo.ConversationRecord{
		Conversation: models.Conversation{
			ID:              uuid.New(),
			BookingID:       uuid.New(),
			ParentProfileID: uuid.New(),
			NannyProfileID:  uuid.New(),
			CreatedAt:       now,
			UpdatedAt:       now,
		},
		BookingStatus:            models.ApprovedBookingStatus,
		OtherParticipantName:     "Taylor Smith",
		OtherParticipantCity:     "Toronto",
		OtherParticipantProvince: "ON",
		LastMessagePreview:       "Hello there",
		LastMessageAt:            &now,
	}
}

func validMessage(role models.UserRole) models.Message {
	now := time.Now().UTC()
	return models.Message{
		ID:             uuid.New(),
		ConversationID: uuid.New(),
		SenderUserID:   uuid.New(),
		SenderRole:     role,
		Body:           "Hello there",
		CreatedAt:      now,
		UpdatedAt:      now,
	}
}

func TestConversationsPipeList(t *testing.T) {
	t.Run("parent success normalizes pagination and returns conversations", func(t *testing.T) {
		record := validConversationRecord()
		repo := &mockMessagesRepo{
			parentConversations:      []messagesrepo.ConversationRecord{record},
			parentConversationsTotal: 1,
		}
		pipe := newConversationsPipe(repo, &mockProfileRepo{
			parentProfile: models.ParentProfile{ID: record.ParentProfileID},
		})

		res := pipe.List(context.Background(), uuid.New(), models.ParentUserRole, dtos.ListConversationsQueryDTO{})

		if !res.Success {
			t.Fatalf("expected success, got %s", res.Message)
		}
		if string(res.Message) != convmessages.Conversation_Listed {
			t.Fatalf("unexpected message: %s", res.Message)
		}
		if res.Data == nil || len(res.Data.Items) != 1 {
			t.Fatalf("expected one conversation, got %+v", res.Data)
		}
		if res.Data.Page != 1 || res.Data.Limit != 20 || res.Data.Total != 1 {
			t.Fatalf("unexpected pagination: %+v", res.Data)
		}
		if res.Data.Items[0].OtherParticipantName != record.OtherParticipantName {
			t.Fatalf("expected mapped participant name, got %+v", res.Data.Items[0])
		}
	})

	t.Run("unsupported role is forbidden", func(t *testing.T) {
		pipe := newConversationsPipe(&mockMessagesRepo{}, &mockProfileRepo{})

		res := pipe.List(context.Background(), uuid.New(), models.AdminUserRole, dtos.ListConversationsQueryDTO{})

		if res.Success || string(res.Message) != convmessages.Forbidden_Conversation_Access {
			t.Fatalf("expected %s, got success=%v message=%s", convmessages.Forbidden_Conversation_Access, res.Success, res.Message)
		}
	})
}

func TestConversationsPipeGetByID(t *testing.T) {
	t.Run("parent success returns conversation", func(t *testing.T) {
		record := validConversationRecord()
		pipe := newConversationsPipe(&mockMessagesRepo{
			parentConversation: record,
		}, &mockProfileRepo{
			parentProfile: models.ParentProfile{ID: record.ParentProfileID},
		})

		res := pipe.GetByID(context.Background(), uuid.New(), models.ParentUserRole, record.ID)

		if !res.Success || string(res.Message) != convmessages.Conversation_Found {
			t.Fatalf("expected success %s, got success=%v message=%s", convmessages.Conversation_Found, res.Success, res.Message)
		}
		if res.Data == nil || res.Data.ID != record.ID.String() {
			t.Fatalf("unexpected data: %+v", res.Data)
		}
	})

	t.Run("missing conversation returns not found", func(t *testing.T) {
		pipe := newConversationsPipe(&mockMessagesRepo{}, &mockProfileRepo{
			parentProfile: models.ParentProfile{ID: uuid.New()},
		})

		res := pipe.GetByID(context.Background(), uuid.New(), models.ParentUserRole, uuid.New())

		if res.Success || string(res.Message) != convmessages.Conversation_Not_Found {
			t.Fatalf("expected %s, got success=%v message=%s", convmessages.Conversation_Not_Found, res.Success, res.Message)
		}
	})
}

func TestConversationsPipeListMessages(t *testing.T) {
	t.Run("nanny success returns messages and pagination", func(t *testing.T) {
		record := validConversationRecord()
		message := validMessage(models.ParentUserRole)
		repo := &mockMessagesRepo{
			nannyConversation: record,
			messages:          []models.Message{message},
			messagesTotal:     1,
		}
		pipe := newConversationsPipe(repo, &mockProfileRepo{
			nannyProfile: models.NannyProfile{ID: record.NannyProfileID},
		})

		res := pipe.ListMessages(context.Background(), uuid.New(), models.NannyUserRole, record.ID, dtos.ListMessagesQueryDTO{})

		if !res.Success || string(res.Message) != convmessages.Messages_Listed {
			t.Fatalf("expected success %s, got success=%v message=%s", convmessages.Messages_Listed, res.Success, res.Message)
		}
		if res.Data == nil || len(res.Data.Items) != 1 {
			t.Fatalf("expected one message, got %+v", res.Data)
		}
		if res.Data.Page != 1 || res.Data.Limit != 50 || res.Data.Total != 1 {
			t.Fatalf("unexpected pagination: %+v", res.Data)
		}
	})

	t.Run("profile repo error returns invalid request", func(t *testing.T) {
		pipe := newConversationsPipe(&mockMessagesRepo{}, &mockProfileRepo{
			nannyProfileErr: errors.New("db down"),
		})

		res := pipe.ListMessages(context.Background(), uuid.New(), models.NannyUserRole, uuid.New(), dtos.ListMessagesQueryDTO{})

		if res.Success || string(res.Message) != convmessages.Invalid_Message_Request {
			t.Fatalf("expected %s, got success=%v message=%s", convmessages.Invalid_Message_Request, res.Success, res.Message)
		}
	})
}

func TestConversationsPipeSendMessage(t *testing.T) {
	t.Run("success trims body and creates message", func(t *testing.T) {
		record := validConversationRecord()
		created := validMessage(models.ParentUserRole)
		created.ConversationID = record.ID
		userID := uuid.New()
		repo := &mockMessagesRepo{
			parentConversation: record,
			createdMessage:     created,
		}
		pipe := newConversationsPipe(repo, &mockProfileRepo{
			parentProfile: models.ParentProfile{ID: record.ParentProfileID},
		})

		res := pipe.SendMessage(context.Background(), userID, models.ParentUserRole, record.ID, dtos.SendMessageDTO{
			Body: "  Hello there  ",
		})

		if !res.Success || string(res.Message) != convmessages.Message_Sent {
			t.Fatalf("expected success %s, got success=%v message=%s", convmessages.Message_Sent, res.Success, res.Message)
		}
		if repo.lastMessage.Body != "Hello there" {
			t.Fatalf("expected trimmed body, got %q", repo.lastMessage.Body)
		}
		if repo.lastMessage.SenderUserID != userID {
			t.Fatalf("expected sender user id %s, got %s", userID, repo.lastMessage.SenderUserID)
		}
		if repo.readConversationID != record.ID || repo.readUserID != userID {
			t.Fatalf("expected sender conversation read marker, got conversation=%s user=%s", repo.readConversationID, repo.readUserID)
		}
	})

	t.Run("whitespace only body is rejected", func(t *testing.T) {
		record := validConversationRecord()
		pipe := newConversationsPipe(&mockMessagesRepo{
			parentConversation: record,
		}, &mockProfileRepo{
			parentProfile: models.ParentProfile{ID: record.ParentProfileID},
		})

		res := pipe.SendMessage(context.Background(), uuid.New(), models.ParentUserRole, record.ID, dtos.SendMessageDTO{
			Body: "   ",
		})

		if res.Success || string(res.Message) != convmessages.Invalid_Message_Request {
			t.Fatalf("expected %s, got success=%v message=%s", convmessages.Invalid_Message_Request, res.Success, res.Message)
		}
	})
}

func TestConversationsPipeMarkRead(t *testing.T) {
	t.Run("parent success marks conversation read", func(t *testing.T) {
		record := validConversationRecord()
		userID := uuid.New()
		repo := &mockMessagesRepo{
			parentConversation: record,
		}
		pipe := newConversationsPipe(repo, &mockProfileRepo{
			parentProfile: models.ParentProfile{ID: record.ParentProfileID},
		})

		res := pipe.MarkRead(context.Background(), userID, models.ParentUserRole, record.ID)

		if !res.Success || string(res.Message) != convmessages.Conversation_Read {
			t.Fatalf("expected success %s, got success=%v message=%s", convmessages.Conversation_Read, res.Success, res.Message)
		}
		if repo.readConversationID != record.ID || repo.readUserID != userID {
			t.Fatalf("expected read marker for conversation=%s user=%s, got conversation=%s user=%s", record.ID, userID, repo.readConversationID, repo.readUserID)
		}
		if res.Data == nil || res.Data.UnreadCount != 0 || res.Data.LastReadAt == nil {
			t.Fatalf("expected read conversation data, got %+v", res.Data)
		}
	})

	t.Run("missing conversation returns not found", func(t *testing.T) {
		pipe := newConversationsPipe(&mockMessagesRepo{}, &mockProfileRepo{
			parentProfile: models.ParentProfile{ID: uuid.New()},
		})

		res := pipe.MarkRead(context.Background(), uuid.New(), models.ParentUserRole, uuid.New())

		if res.Success || string(res.Message) != convmessages.Conversation_Not_Found {
			t.Fatalf("expected %s, got success=%v message=%s", convmessages.Conversation_Not_Found, res.Success, res.Message)
		}
	})
}
