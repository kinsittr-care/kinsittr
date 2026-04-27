package controllers

import (
	"github.com/kinsittr/kinsittr-api/auth/pipes"
)

type AuthController struct {
	pipe *pipes.AuthPipe
}

func NewAuthController(pipe *pipes.AuthPipe) *AuthController {
	return &AuthController{pipe: pipe}
}
