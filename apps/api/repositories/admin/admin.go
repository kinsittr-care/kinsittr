package admin

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/kinsittr/kinsittr-api/models"
)

type ListNanniesFilter struct {
	Page   int
	Limit  int
	Search string
	Status models.VerificationStatus
	City   string
}

type ListParentsFilter struct {
	Page   int
	Limit  int
	Search string
	City   string
}

type NannyRecord struct {
	models.NannyProfile
	UserEmail         string
	UserFirstname     string
	UserLastname      string
	UserIsActive      bool
	DocsReviewed      bool
	ReferencesChecked bool
	InterviewDone     bool
}

type ParentRecord struct {
	models.ParentProfile
	UserEmail     string
	UserFirstname string
	UserLastname  string
	UserIsActive  bool
	BookingCount  int
	TotalSpend    float64
}

type UpdateScreeningStepsParams struct {
	DocsReviewed      *bool
	ReferencesChecked *bool
	InterviewDone     *bool
}

type ListBookingsFilter struct {
	Page     int
	Limit    int
	Search   string
	Status   models.BookingStatus
	DateFrom *time.Time
	DateTo   *time.Time
}

type ListConversationsFilter struct {
	Page   int
	Limit  int
	Search string
	Status models.BookingStatus
}

type AdminBookingActionParams struct {
	BookingID   uuid.UUID
	AdminUserID uuid.UUID
	Reason      string
}

type AdminNannyActionParams struct {
	NannyProfileID uuid.UUID
	AdminUserID    uuid.UUID
	Action         models.AdminNannyActionType
	Reason         string
	FromStatuses   []string
	ToStatus       models.VerificationStatus
}

type AdminConversationActionParams struct {
	ConversationID uuid.UUID
	MessageID      uuid.UUID
	AdminUserID    uuid.UUID
	Action         models.AdminConversationActionType
	Reason         string
}

type InviteAdminParams struct {
	ID           uuid.UUID
	Firstname    string
	Lastname     string
	Email        string
	PasswordHash string
}

type AdminAccountActionParams struct {
	ProfileID   uuid.UUID
	AdminUserID uuid.UUID
	Reason      string
}

type BookingRecord struct {
	models.Booking
	NannyDisplayName  string
	NannyCity         string
	NannyProvince     string
	ParentDisplayName string
	ParentCity        string
	ParentProvince    string
}

type AdminBookingActionRecord struct {
	models.AdminBookingAction
	AdminEmail *string
}

type ConversationRecord struct {
	models.Conversation
	BookingStatus      models.BookingStatus
	ParentDisplayName  string
	ParentEmail        string
	ParentCity         string
	ParentProvince     string
	NannyDisplayName   string
	NannyEmail         string
	NannyCity          string
	NannyProvince      string
	LastMessagePreview string
	LastMessageAt      *time.Time
	MessageCount       int
	LockedAt           *time.Time
	LockedBy           *uuid.UUID
	LockReason         *string
}

type MessageRecord struct {
	models.Message
	SenderEmail     string
	SenderFirstname string
	SenderLastname  string
	HiddenAt        *time.Time
	HiddenBy        *uuid.UUID
	HiddenReason    *string
}

type AdminUserRecord struct {
	models.User
}

type AnalyticsRangeFilter struct {
	DateFrom        *time.Time
	DateTo          *time.Time
	Bucket          string
	CityLimit       int
	TopNanniesLimit int
}

type CityBookingMetric struct {
	City  string
	Count int
}

type AnalyticsSummary struct {
	TotalRevenue        float64
	ActiveBookings      int
	BookingsThisWeek    int
	VerifiedNannies     int
	PendingNannies      int
	AverageBookingValue float64
	BookingsByCity      []CityBookingMetric
	TimeSeries          []AnalyticsTimeSeriesMetric
	TopNannies          []TopNannyMetric
	RegistrationTrends  []RegistrationTrendMetric
}

type AnalyticsTimeSeriesMetric struct {
	Period        time.Time
	BookingsCount int
	Revenue       float64
}

type TopNannyMetric struct {
	NannyProfileID string
	DisplayName    string
	City           string
	Province       string
	CompletedCount int
	Revenue        float64
	RatingAvg      float64
}

type RegistrationTrendMetric struct {
	Period      time.Time
	ParentCount int
	NannyCount  int
}

type AdminRepository interface {
	ListNannies(ctx context.Context, filter ListNanniesFilter) ([]NannyRecord, int, error)
	GetNannyByID(ctx context.Context, nannyProfileID uuid.UUID) (NannyRecord, error)
	UpdateScreeningSteps(ctx context.Context, nannyProfileID uuid.UUID, params UpdateScreeningStepsParams) (NannyRecord, error)
	UpdateNannyVerificationStatus(ctx context.Context, nannyProfileID uuid.UUID, status models.VerificationStatus) (NannyRecord, error)
	UpdateNannyVerificationStatusWithAction(ctx context.Context, params AdminNannyActionParams) (NannyRecord, error)
	ResetNannyScreening(ctx context.Context, nannyProfileID uuid.UUID) (NannyRecord, error)
	ResetNannyScreeningWithAction(ctx context.Context, params AdminNannyActionParams) (NannyRecord, error)
	SuspendNannyAccount(ctx context.Context, params AdminAccountActionParams) (NannyRecord, error)
	ListParents(ctx context.Context, filter ListParentsFilter) ([]ParentRecord, int, error)
	GetParentByID(ctx context.Context, parentProfileID uuid.UUID) (ParentRecord, error)
	SuspendParentAccount(ctx context.Context, params AdminAccountActionParams) (ParentRecord, error)
	ListParentBookingHistory(ctx context.Context, parentProfileID uuid.UUID, filter ListBookingsFilter) ([]BookingRecord, int, error)
	ListBookings(ctx context.Context, filter ListBookingsFilter) ([]BookingRecord, int, error)
	GetBookingByID(ctx context.Context, bookingID uuid.UUID) (BookingRecord, error)
	CancelBooking(ctx context.Context, params AdminBookingActionParams) (BookingRecord, error)
	CompleteBooking(ctx context.Context, params AdminBookingActionParams) (BookingRecord, error)
	ListBookingActions(ctx context.Context, bookingID uuid.UUID, page, limit int) ([]AdminBookingActionRecord, int, error)
	ListConversations(ctx context.Context, filter ListConversationsFilter) ([]ConversationRecord, int, error)
	GetConversationByID(ctx context.Context, conversationID uuid.UUID) (ConversationRecord, error)
	ListConversationMessages(ctx context.Context, conversationID uuid.UUID, page, limit int) ([]MessageRecord, int, error)
	LockConversation(ctx context.Context, params AdminConversationActionParams) (ConversationRecord, error)
	UnlockConversation(ctx context.Context, params AdminConversationActionParams) (ConversationRecord, error)
	HideMessage(ctx context.Context, params AdminConversationActionParams) (MessageRecord, error)
	ListAdmins(ctx context.Context, page, limit int) ([]AdminUserRecord, int, error)
	CreateAdmin(ctx context.Context, params InviteAdminParams) (AdminUserRecord, error)
	DisableAdmin(ctx context.Context, adminUserID uuid.UUID) (AdminUserRecord, error)
	GetAnalyticsSummary(ctx context.Context, filter AnalyticsRangeFilter) (AnalyticsSummary, error)
}

var AdminRepo AdminRepository

func InitAdminRepo(db *pgxpool.Pool) {
	AdminRepo = newPgRepository(db)
}
