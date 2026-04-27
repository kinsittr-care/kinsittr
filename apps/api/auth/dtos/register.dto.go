package dtos

import "github.com/kinsittr/kinsittr-api/models"

type RegisterParentDTO struct {
	Firstname    string `json:"firstname"     validate:"required,min=2,max=100"`
	Lastname     string `json:"lastname"      validate:"required,min=2,max=100"`
	Email        string `json:"email"         validate:"required,email,max=255"`
	Password     string `json:"password"      validate:"required,min=8,max=72"`
	Phone        string `json:"phone"         validate:"omitempty,min=7,max=20"`
	DisplayName  string `json:"display_name"  validate:"required,min=2,max=100"`
	NumChildren  int    `json:"num_children"  validate:"required,min=1"`
	ChildrenAges []int  `json:"children_ages" validate:"required,min=1,dive,min=0,max=18"`
	City         string `json:"city"          validate:"required,max=100"`
	Province     string `json:"province"      validate:"required,max=50"`
}

type RegisterNannyDTO struct {
	Firstname   string             `json:"firstname"     validate:"required,min=2,max=100"`
	Lastname    string             `json:"lastname"      validate:"required,min=2,max=100"`
	Email       string             `json:"email"         validate:"required,email,max=255"`
	Password    string             `json:"password"      validate:"required,min=8,max=72"`
	Phone       string             `json:"phone"         validate:"omitempty,min=7,max=20"`
	DisplayName string             `json:"display_name"  validate:"required,min=2,max=100"`
	ServiceType models.ServiceType `json:"service_type"  validate:"required,oneof=nanny cleaner tutor"`
	Bio         string             `json:"bio"           validate:"required,min=20,max=1000"`
	RatePerHour float64            `json:"rate_per_hour" validate:"required,min=1"`
	City        string             `json:"city"          validate:"required,max=100"`
	Province    string             `json:"province"      validate:"required,max=50"`
}
