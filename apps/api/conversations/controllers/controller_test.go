package controllers

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/conversations/pipes"
	"github.com/kinsittr/kinsittr-api/models"
	messagesrepo "github.com/kinsittr/kinsittr-api/repositories/messages"
)

type mockMessagesRepo struct {
	parentConversations      []messagesrepo.ConversationRecord
	parentConversationsTotal int
	parentConversation       messagesrepo.ConversationRecord
	messages                 []models.Message
	messagesTotal            int
	createdMessage           models.Message
}

func (m *mockMessagesRepo) GetConversationByBookingID(_ context.Context, _ uuid.UUID) (models.Conversation, error) {
	return models.Conversation{}, nil
}
func (m *mockMessagesRepo) CreateConversation(_ context.Context, conversation models.Conversation) (models.Conversation, error) {
	return conversation, nil
}
func (m *mockMessagesRepo) ListParentConversations(_ context.Context, _ uuid.UUID, _ messagesrepo.ConversationListFilter) ([]messagesrepo.ConversationRecord, int, error) {
	return m.parentConversations, m.parentConversationsTotal, nil
}
func (m *mockMessagesRepo) ListNannyConversations(_ context.Context, _ uuid.UUID, _ messagesrepo.ConversationListFilter) ([]messagesrepo.ConversationRecord, int, error) {
	return nil, 0, nil
}
func (m *mockMessagesRepo) GetParentConversationByID(_ context.Context, _, _ uuid.UUID) (messagesrepo.ConversationRecord, error) {
	return m.parentConversation, nil
}
func (m *mockMessagesRepo) GetNannyConversationByID(_ context.Context, _, _ uuid.UUID) (messagesrepo.ConversationRecord, error) {
	return messagesrepo.ConversationRecord{}, nil
}
func (m *mockMessagesRepo) ListMessages(_ context.Context, _ uuid.UUID, _ messagesrepo.MessageListFilter) ([]models.Message, int, error) {
	return m.messages, m.messagesTotal, nil
}
func (m *mockMessagesRepo) CreateMessage(_ context.Context, message models.Message) (models.Message, error) {
	if m.createdMessage.ID != uuid.Nil {
		return m.createdMessage, nil
	}
	return message, nil
}

type mockProfileRepo struct {
	parentProfile models.ParentProfile
	nannyProfile  models.NannyProfile
}

func (m *mockProfileRepo) CreateNannyProfile(_ context.Context, p models.NannyProfile) (models.NannyProfile, error) {
	return p, nil
}
func (m *mockProfileRepo) CreateParentProfile(_ context.Context, p models.ParentProfile) (models.ParentProfile, error) {
	return p, nil
}
func (m *mockProfileRepo) GetNannyProfileByUserID(_ context.Context, _ uuid.UUID) (models.NannyProfile, error) {
	return m.nannyProfile, nil
}
func (m *mockProfileRepo) GetParentProfileByUserID(_ context.Context, _ uuid.UUID) (models.ParentProfile, error) {
	return m.parentProfile, nil
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

type apiResponse struct {
	Success bool            `json:"success"`
	Message string          `json:"message"`
	Data    json.RawMessage `json:"data"`
}

func newConversationControllerForTests(record messagesrepo.ConversationRecord, message models.Message) *ConversationsController {
	repo := &mockMessagesRepo{
		parentConversations:      []messagesrepo.ConversationRecord{record},
		parentConversationsTotal: 1,
		parentConversation:       record,
		messages:                 []models.Message{message},
		messagesTotal:            1,
		createdMessage:           message,
	}
	profileRepo := &mockProfileRepo{
		parentProfile: models.ParentProfile{ID: record.ParentProfileID},
	}
	pipe := pipes.NewConversationsPipe(repo, profileRepo)
	return NewConversationsController(pipe)
}

func doJSONRequest(t *testing.T, app *fiber.App, method, path string, body any) (*apiResponse, int) {
	t.Helper()

	var payload []byte
	var err error
	if body != nil {
		payload, err = json.Marshal(body)
		if err != nil {
			t.Fatalf("failed to marshal body: %v", err)
		}
	}

	req := httptest.NewRequest(method, path, bytes.NewReader(payload))
	req.Header.Set("Content-Type", "application/json")
	resp, err := app.Test(req, -1)
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	defer resp.Body.Close()

	var parsed apiResponse
	if err := json.NewDecoder(resp.Body).Decode(&parsed); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	return &parsed, resp.StatusCode
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

func validMessage(conversationID uuid.UUID) models.Message {
	now := time.Now().UTC()
	return models.Message{
		ID:             uuid.New(),
		ConversationID: conversationID,
		SenderUserID:   uuid.New(),
		SenderRole:     models.ParentUserRole,
		Body:           "Hello there",
		CreatedAt:      now,
		UpdatedAt:      now,
	}
}

func withAuth(userID uuid.UUID, role models.UserRole) fiber.Handler {
	return func(c *fiber.Ctx) error {
		c.Locals("auth.user_id", userID)
		c.Locals("auth.role", role)
		return c.Next()
	}
}

func TestConversationsControllerList(t *testing.T) {
	record := validConversationRecord()
	controller := newConversationControllerForTests(record, validMessage(record.ID))

	t.Run("missing auth locals returns 401", func(t *testing.T) {
		app := fiber.New()
		app.Get("/conversations", controller.List)
		res, status := doJSONRequest(t, app, http.MethodGet, "/conversations", nil)
		if status != http.StatusUnauthorized || res.Message != "invalid_or_expired_token" {
			t.Fatalf("unexpected response: status=%d body=%+v", status, res)
		}
	})

	t.Run("valid request returns 200", func(t *testing.T) {
		app := fiber.New()
		app.Use(withAuth(uuid.New(), models.ParentUserRole))
		app.Get("/conversations", controller.List)
		res, status := doJSONRequest(t, app, http.MethodGet, "/conversations?page=2&limit=5", nil)
		if status != http.StatusOK || !res.Success || res.Message != "conversations_listed" {
			t.Fatalf("unexpected response: status=%d body=%+v", status, res)
		}
	})
}

func TestConversationsControllerGetByID(t *testing.T) {
	record := validConversationRecord()
	controller := newConversationControllerForTests(record, validMessage(record.ID))

	t.Run("invalid uuid returns 400", func(t *testing.T) {
		app := fiber.New()
		app.Use(withAuth(uuid.New(), models.ParentUserRole))
		app.Get("/conversations/:id", controller.GetByID)
		res, status := doJSONRequest(t, app, http.MethodGet, "/conversations/not-a-uuid", nil)
		if status != http.StatusBadRequest || res.Message != "invalid_message_request" {
			t.Fatalf("unexpected response: status=%d body=%+v", status, res)
		}
	})

	t.Run("valid request returns 200", func(t *testing.T) {
		app := fiber.New()
		app.Use(withAuth(uuid.New(), models.ParentUserRole))
		app.Get("/conversations/:id", controller.GetByID)
		res, status := doJSONRequest(t, app, http.MethodGet, "/conversations/"+record.ID.String(), nil)
		if status != http.StatusOK || !res.Success || res.Message != "conversation_found" {
			t.Fatalf("unexpected response: status=%d body=%+v", status, res)
		}
	})
}

func TestConversationsControllerListMessages(t *testing.T) {
	record := validConversationRecord()
	controller := newConversationControllerForTests(record, validMessage(record.ID))

	app := fiber.New()
	app.Use(withAuth(uuid.New(), models.ParentUserRole))
	app.Get("/conversations/:id/messages", controller.ListMessages)

	res, status := doJSONRequest(t, app, http.MethodGet, "/conversations/"+record.ID.String()+"/messages?page=1&limit=25", nil)
	if status != http.StatusOK || !res.Success || res.Message != "messages_listed" {
		t.Fatalf("unexpected response: status=%d body=%+v", status, res)
	}
}

func TestConversationsControllerSendMessage(t *testing.T) {
	record := validConversationRecord()
	controller := newConversationControllerForTests(record, validMessage(record.ID))

	t.Run("validation failure returns 400", func(t *testing.T) {
		app := fiber.New()
		app.Use(withAuth(uuid.New(), models.ParentUserRole))
		app.Post("/conversations/:id/messages", controller.SendMessage)
		res, status := doJSONRequest(t, app, http.MethodPost, "/conversations/"+record.ID.String()+"/messages", map[string]any{
			"body": "",
		})
		if status != http.StatusBadRequest || res.Success {
			t.Fatalf("unexpected response: status=%d body=%+v", status, res)
		}
	})

	t.Run("valid request returns 201", func(t *testing.T) {
		app := fiber.New()
		app.Use(withAuth(uuid.New(), models.ParentUserRole))
		app.Post("/conversations/:id/messages", controller.SendMessage)
		res, status := doJSONRequest(t, app, http.MethodPost, "/conversations/"+record.ID.String()+"/messages", map[string]any{
			"body": "Hello there",
		})
		if status != http.StatusCreated || !res.Success || res.Message != "message_sent" {
			t.Fatalf("unexpected response: status=%d body=%+v", status, res)
		}
	})
}
