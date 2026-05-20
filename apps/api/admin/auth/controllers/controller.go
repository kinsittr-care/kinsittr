package controllers

import "github.com/kinsittr/kinsittr-api/admin/auth/pipes"

type AdminAuthController struct {
	pipe *pipes.AdminAuthPipe
}

func NewAdminAuthController(pipe *pipes.AdminAuthPipe) *AdminAuthController {
	return &AdminAuthController{pipe: pipe}
}
