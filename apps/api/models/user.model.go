package models

import (
	"time"

	"github.com/google/uuid"
)

type UserRole string

const (
	ParentUserRole UserRole = "parent"
	NannyUserRole  UserRole = "nanny"
	AdminUserRole  UserRole = "admin"
)

type ServiceType string

const (
	NannyServiceType ServiceType = "nanny"
	// CleanerServiceType ServiceType = "cleaner"
	// TutorServiceType   ServiceType = "tutor"
)

type User struct {
	ID          uuid.UUID `json:"id"`
	Firstname   string    `json:"firstname"`
	Lastname    string    `json:"lastname"`
	Email       string    `json:"email"`
	Password    string    `json:"-"`
	Role        UserRole  `json:"role"`
	Phone       string    `json:"phone"`
	IsActive    bool      `json:"is_active"`
	CountryCode string    `json:"country_code"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
