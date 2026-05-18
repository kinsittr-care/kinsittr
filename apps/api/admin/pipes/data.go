package pipes

import (
	"time"

	"github.com/kinsittr/kinsittr-api/models"
	repository "github.com/kinsittr/kinsittr-api/repositories/admin"
)

type ScreeningStepsData struct {
	DocsReviewed      bool `json:"docs_reviewed"`
	ReferencesChecked bool `json:"references_checked"`
	InterviewDone     bool `json:"interview_done"`
}

type AdminNannyData struct {
	ID                 string                    `json:"id"`
	UserID             string                    `json:"user_id"`
	UserEmail          string                    `json:"user_email"`
	UserFirstname      string                    `json:"user_firstname"`
	UserLastname       string                    `json:"user_lastname"`
	UserIsActive       bool                      `json:"user_is_active"`
	DisplayName        string                    `json:"display_name"`
	Bio                string                    `json:"bio"`
	Specialties        []string                  `json:"specialties"`
	RatePerHour        float64                   `json:"rate_per_hour"`
	ServiceType        models.ServiceType        `json:"service_type"`
	Currency           models.Currency           `json:"currency"`
	VerificationStatus models.VerificationStatus `json:"verification_status"`
	VerifiedAt         *time.Time                `json:"verified_at,omitempty"`
	StripeAccountID    *string                   `json:"stripe_account_id,omitempty"`
	StripeOnboarded    bool                      `json:"stripe_onboarded"`
	RatingAvg          float64                   `json:"rating_avg"`
	RatingCount        int                       `json:"rating_count"`
	City               string                    `json:"city"`
	Province           string                    `json:"province"`
	ScreeningSteps     ScreeningStepsData        `json:"screening_steps"`
	WaitingDays        int                       `json:"waiting_days"`
	CreatedAt          time.Time                 `json:"created_at"`
	UpdatedAt          time.Time                 `json:"updated_at"`
}

type AdminNannyListData struct {
	Items []AdminNannyData `json:"items"`
	Page  int              `json:"page"`
	Limit int              `json:"limit"`
	Total int              `json:"total"`
}

type AdminParentData struct {
	ID               string    `json:"id"`
	UserID           string    `json:"user_id"`
	UserEmail        string    `json:"user_email"`
	UserFirstname    string    `json:"user_firstname"`
	UserLastname     string    `json:"user_lastname"`
	UserIsActive     bool      `json:"user_is_active"`
	DisplayName      string    `json:"display_name"`
	NumChildren      int       `json:"num_children"`
	ChildrenAges     []int     `json:"children_ages"`
	City             string    `json:"city"`
	Province         string    `json:"province"`
	StripeCustomerID string    `json:"stripe_customer_id"`
	BookingCount     int       `json:"booking_count"`
	TotalSpend       float64   `json:"total_spend"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

type AdminParentListData struct {
	Items []AdminParentData `json:"items"`
	Page  int               `json:"page"`
	Limit int               `json:"limit"`
	Total int               `json:"total"`
}

type AdminParentDetailData struct {
	Parent   AdminParentData      `json:"parent"`
	Bookings AdminBookingListData `json:"bookings"`
}

type AdminBookingData struct {
	ID                string               `json:"id"`
	ParentProfileID   string               `json:"parent_profile_id"`
	NannyProfileID    string               `json:"nanny_profile_id"`
	ParentDisplayName string               `json:"parent_display_name"`
	ParentCity        string               `json:"parent_city"`
	ParentProvince    string               `json:"parent_province"`
	NannyDisplayName  string               `json:"nanny_display_name"`
	NannyCity         string               `json:"nanny_city"`
	NannyProvince     string               `json:"nanny_province"`
	Date              string               `json:"date"`
	StartTime         string               `json:"start_time"`
	Duration          int                  `json:"duration"`
	TotalAmount       float64              `json:"total_amount"`
	Status            models.BookingStatus `json:"status"`
	CreatedAt         time.Time            `json:"created_at"`
	UpdatedAt         time.Time            `json:"updated_at"`
}

type AdminBookingListData struct {
	Items []AdminBookingData `json:"items"`
	Page  int                `json:"page"`
	Limit int                `json:"limit"`
	Total int                `json:"total"`
}

type AdminBookingActionData struct {
	ID             string               `json:"id"`
	BookingID      string               `json:"booking_id"`
	AdminUserID    *string              `json:"admin_user_id,omitempty"`
	AdminEmail     *string              `json:"admin_email,omitempty"`
	Action         string               `json:"action"`
	PreviousStatus models.BookingStatus `json:"previous_status"`
	NewStatus      models.BookingStatus `json:"new_status"`
	Reason         string               `json:"reason"`
	CreatedAt      time.Time            `json:"created_at"`
}

type AdminBookingActionListData struct {
	Items []AdminBookingActionData `json:"items"`
	Page  int                      `json:"page"`
	Limit int                      `json:"limit"`
	Total int                      `json:"total"`
}

type AdminConversationParticipantData struct {
	ProfileID   string `json:"profile_id"`
	DisplayName string `json:"display_name"`
	Email       string `json:"email"`
	City        string `json:"city"`
	Province    string `json:"province"`
}

type AdminConversationData struct {
	ID                 string                           `json:"id"`
	BookingID          string                           `json:"booking_id"`
	BookingStatus      models.BookingStatus             `json:"booking_status"`
	Parent             AdminConversationParticipantData `json:"parent"`
	Nanny              AdminConversationParticipantData `json:"nanny"`
	LastMessagePreview string                           `json:"last_message_preview"`
	LastMessageAt      *time.Time                       `json:"last_message_at"`
	MessageCount       int                              `json:"message_count"`
	LockedAt           *time.Time                       `json:"locked_at,omitempty"`
	LockedBy           *string                          `json:"locked_by,omitempty"`
	LockReason         *string                          `json:"lock_reason,omitempty"`
	CreatedAt          time.Time                        `json:"created_at"`
	UpdatedAt          time.Time                        `json:"updated_at"`
}

type AdminConversationListData struct {
	Items []AdminConversationData `json:"items"`
	Page  int                     `json:"page"`
	Limit int                     `json:"limit"`
	Total int                     `json:"total"`
}

type AdminMessageData struct {
	ID              string          `json:"id"`
	ConversationID  string          `json:"conversation_id"`
	SenderUserID    string          `json:"sender_user_id"`
	SenderRole      models.UserRole `json:"sender_role"`
	SenderEmail     string          `json:"sender_email"`
	SenderFirstname string          `json:"sender_firstname"`
	SenderLastname  string          `json:"sender_lastname"`
	Body            string          `json:"body"`
	HiddenAt        *time.Time      `json:"hidden_at,omitempty"`
	HiddenBy        *string         `json:"hidden_by,omitempty"`
	HiddenReason    *string         `json:"hidden_reason,omitempty"`
	CreatedAt       time.Time       `json:"created_at"`
	UpdatedAt       time.Time       `json:"updated_at"`
}

type AdminMessageListData struct {
	Conversation AdminConversationData `json:"conversation"`
	Items        []AdminMessageData    `json:"items"`
	Page         int                   `json:"page"`
	Limit        int                   `json:"limit"`
	Total        int                   `json:"total"`
}

type AdminCityBookingMetricData struct {
	City  string `json:"city"`
	Count int    `json:"count"`
}

type AdminAnalyticsTimeSeriesData struct {
	Period        string  `json:"period"`
	BookingsCount int     `json:"bookings_count"`
	Revenue       float64 `json:"revenue"`
}

type AdminTopNannyData struct {
	NannyProfileID string  `json:"nanny_profile_id"`
	DisplayName    string  `json:"display_name"`
	City           string  `json:"city"`
	Province       string  `json:"province"`
	CompletedCount int     `json:"completed_count"`
	Revenue        float64 `json:"revenue"`
	RatingAvg      float64 `json:"rating_avg"`
}

type AdminRegistrationTrendData struct {
	Period      string `json:"period"`
	ParentCount int    `json:"parent_count"`
	NannyCount  int    `json:"nanny_count"`
}

type AdminAnalyticsData struct {
	TotalRevenue        float64                        `json:"total_revenue"`
	PlatformFee         float64                        `json:"platform_fee"`
	PlatformFeeRate     float64                        `json:"platform_fee_rate"`
	ActiveBookings      int                            `json:"active_bookings"`
	BookingsThisWeek    int                            `json:"bookings_this_week"`
	VerifiedNannies     int                            `json:"verified_nannies"`
	PendingNannies      int                            `json:"pending_nannies"`
	AverageBookingValue float64                        `json:"average_booking_value"`
	BookingsByCity      []AdminCityBookingMetricData   `json:"bookings_by_city"`
	TimeSeries          []AdminAnalyticsTimeSeriesData `json:"time_series"`
	TopNannies          []AdminTopNannyData            `json:"top_nannies"`
	RegistrationTrends  []AdminRegistrationTrendData   `json:"registration_trends"`
}

type AdminUserData struct {
	ID        string          `json:"id"`
	Firstname string          `json:"firstname"`
	Lastname  string          `json:"lastname"`
	Email     string          `json:"email"`
	Role      models.UserRole `json:"role"`
	IsActive  bool            `json:"is_active"`
	CreatedAt time.Time       `json:"created_at"`
	UpdatedAt time.Time       `json:"updated_at"`
}

type AdminUserListData struct {
	Items []AdminUserData `json:"items"`
	Page  int             `json:"page"`
	Limit int             `json:"limit"`
	Total int             `json:"total"`
}

func toAdminNannyData(record repository.NannyRecord) AdminNannyData {
	waitingDays := int(time.Since(record.CreatedAt).Hours() / 24)
	if waitingDays < 0 {
		waitingDays = 0
	}
	return AdminNannyData{
		ID:                 record.ID.String(),
		UserID:             record.UserID.String(),
		UserEmail:          record.UserEmail,
		UserFirstname:      record.UserFirstname,
		UserLastname:       record.UserLastname,
		UserIsActive:       record.UserIsActive,
		DisplayName:        record.DisplayName,
		Bio:                record.Bio,
		Specialties:        record.Specialties,
		RatePerHour:        record.RatePerHour,
		ServiceType:        record.ServiceType,
		Currency:           record.Currency,
		VerificationStatus: record.VerificationStatus,
		VerifiedAt:         record.VerifiedAt,
		StripeAccountID:    record.StripeAccountID,
		StripeOnboarded:    record.StripeOnboarded,
		RatingAvg:          record.RatingAvg,
		RatingCount:        record.RatingCount,
		City:               record.City,
		Province:           record.Province,
		ScreeningSteps: ScreeningStepsData{
			DocsReviewed:      record.DocsReviewed,
			ReferencesChecked: record.ReferencesChecked,
			InterviewDone:     record.InterviewDone,
		},
		WaitingDays: waitingDays,
		CreatedAt:   record.CreatedAt,
		UpdatedAt:   record.UpdatedAt,
	}
}

func toAdminParentData(record repository.ParentRecord) AdminParentData {
	return AdminParentData{
		ID:               record.ID.String(),
		UserID:           record.UserID.String(),
		UserEmail:        record.UserEmail,
		UserFirstname:    record.UserFirstname,
		UserLastname:     record.UserLastname,
		UserIsActive:     record.UserIsActive,
		DisplayName:      record.DisplayName,
		NumChildren:      record.NumChildren,
		ChildrenAges:     record.ChildrenAges,
		City:             record.City,
		Province:         record.Province,
		StripeCustomerID: record.StripeCustomerID,
		BookingCount:     record.BookingCount,
		TotalSpend:       record.TotalSpend,
		CreatedAt:        record.CreatedAt,
		UpdatedAt:        record.UpdatedAt,
	}
}

func toAdminBookingData(record repository.BookingRecord) AdminBookingData {
	return AdminBookingData{
		ID:                record.ID.String(),
		ParentProfileID:   record.ParentProfileID.String(),
		NannyProfileID:    record.NannyProfileID.String(),
		ParentDisplayName: record.ParentDisplayName,
		ParentCity:        record.ParentCity,
		ParentProvince:    record.ParentProvince,
		NannyDisplayName:  record.NannyDisplayName,
		NannyCity:         record.NannyCity,
		NannyProvince:     record.NannyProvince,
		Date:              record.Date.Format("2006-01-02"),
		StartTime:         record.StartTime.Format("15:04"),
		Duration:          record.Duration,
		TotalAmount:       record.TotalAmount,
		Status:            record.Status,
		CreatedAt:         record.CreatedAt,
		UpdatedAt:         record.UpdatedAt,
	}
}

func toAdminBookingActionData(record repository.AdminBookingActionRecord) AdminBookingActionData {
	var adminUserID *string
	if record.AdminUserID != nil {
		value := record.AdminUserID.String()
		adminUserID = &value
	}
	return AdminBookingActionData{
		ID:             record.ID.String(),
		BookingID:      record.BookingID.String(),
		AdminUserID:    adminUserID,
		AdminEmail:     record.AdminEmail,
		Action:         string(record.Action),
		PreviousStatus: record.PreviousStatus,
		NewStatus:      record.NewStatus,
		Reason:         record.Reason,
		CreatedAt:      record.CreatedAt,
	}
}

func toAdminConversationData(record repository.ConversationRecord) AdminConversationData {
	var lockedBy *string
	if record.LockedBy != nil {
		value := record.LockedBy.String()
		lockedBy = &value
	}
	return AdminConversationData{
		ID:            record.ID.String(),
		BookingID:     record.BookingID.String(),
		BookingStatus: record.BookingStatus,
		Parent: AdminConversationParticipantData{
			ProfileID:   record.ParentProfileID.String(),
			DisplayName: record.ParentDisplayName,
			Email:       record.ParentEmail,
			City:        record.ParentCity,
			Province:    record.ParentProvince,
		},
		Nanny: AdminConversationParticipantData{
			ProfileID:   record.NannyProfileID.String(),
			DisplayName: record.NannyDisplayName,
			Email:       record.NannyEmail,
			City:        record.NannyCity,
			Province:    record.NannyProvince,
		},
		LastMessagePreview: record.LastMessagePreview,
		LastMessageAt:      record.LastMessageAt,
		MessageCount:       record.MessageCount,
		LockedAt:           record.LockedAt,
		LockedBy:           lockedBy,
		LockReason:         record.LockReason,
		CreatedAt:          record.CreatedAt,
		UpdatedAt:          record.UpdatedAt,
	}
}

func toAdminMessageData(record repository.MessageRecord) AdminMessageData {
	var hiddenBy *string
	if record.HiddenBy != nil {
		value := record.HiddenBy.String()
		hiddenBy = &value
	}
	return AdminMessageData{
		ID:              record.ID.String(),
		ConversationID:  record.ConversationID.String(),
		SenderUserID:    record.SenderUserID.String(),
		SenderRole:      record.SenderRole,
		SenderEmail:     record.SenderEmail,
		SenderFirstname: record.SenderFirstname,
		SenderLastname:  record.SenderLastname,
		Body:            record.Body,
		HiddenAt:        record.HiddenAt,
		HiddenBy:        hiddenBy,
		HiddenReason:    record.HiddenReason,
		CreatedAt:       record.CreatedAt,
		UpdatedAt:       record.UpdatedAt,
	}
}

func toAdminUserData(record repository.AdminUserRecord) AdminUserData {
	return AdminUserData{
		ID:        record.ID.String(),
		Firstname: record.Firstname,
		Lastname:  record.Lastname,
		Email:     record.Email,
		Role:      record.Role,
		IsActive:  record.IsActive,
		CreatedAt: record.CreatedAt,
		UpdatedAt: record.UpdatedAt,
	}
}

func toAnalyticsData(summary repository.AnalyticsSummary, platformFeeRate float64) AdminAnalyticsData {
	cities := make([]AdminCityBookingMetricData, 0, len(summary.BookingsByCity))
	for _, city := range summary.BookingsByCity {
		cities = append(cities, AdminCityBookingMetricData{City: city.City, Count: city.Count})
	}
	timeSeries := make([]AdminAnalyticsTimeSeriesData, 0, len(summary.TimeSeries))
	for _, item := range summary.TimeSeries {
		timeSeries = append(timeSeries, AdminAnalyticsTimeSeriesData{
			Period:        item.Period.Format("2006-01-02"),
			BookingsCount: item.BookingsCount,
			Revenue:       item.Revenue,
		})
	}
	topNannies := make([]AdminTopNannyData, 0, len(summary.TopNannies))
	for _, item := range summary.TopNannies {
		topNannies = append(topNannies, AdminTopNannyData{
			NannyProfileID: item.NannyProfileID,
			DisplayName:    item.DisplayName,
			City:           item.City,
			Province:       item.Province,
			CompletedCount: item.CompletedCount,
			Revenue:        item.Revenue,
			RatingAvg:      item.RatingAvg,
		})
	}
	registrationTrends := make([]AdminRegistrationTrendData, 0, len(summary.RegistrationTrends))
	for _, item := range summary.RegistrationTrends {
		registrationTrends = append(registrationTrends, AdminRegistrationTrendData{
			Period:      item.Period.Format("2006-01-02"),
			ParentCount: item.ParentCount,
			NannyCount:  item.NannyCount,
		})
	}
	return AdminAnalyticsData{
		TotalRevenue:        summary.TotalRevenue,
		PlatformFee:         summary.TotalRevenue * platformFeeRate,
		PlatformFeeRate:     platformFeeRate,
		ActiveBookings:      summary.ActiveBookings,
		BookingsThisWeek:    summary.BookingsThisWeek,
		VerifiedNannies:     summary.VerifiedNannies,
		PendingNannies:      summary.PendingNannies,
		AverageBookingValue: summary.AverageBookingValue,
		BookingsByCity:      cities,
		TimeSeries:          timeSeries,
		TopNannies:          topNannies,
		RegistrationTrends:  registrationTrends,
	}
}
