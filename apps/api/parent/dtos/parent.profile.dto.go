package dtos

type UpdateParentProfileDTO struct {
	DisplayName  string `json:"display_name" validate:"required,min=2,max=100"`
	NumChildren  int    `json:"num_children" validate:"required,min=1"`
	ChildrenAges []int  `json:"children_ages" validate:"required,min=1,dive,min=0,max=18"`
	City         string `json:"city" validate:"required,min=2,max=100"`
	Province     string `json:"province" validate:"required,min=2,max=100"`
}
