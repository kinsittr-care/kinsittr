package controllers

import "github.com/kinsittr/kinsittr-api/parent/pipes"

type ParentController struct {
	pipe *pipes.ParentPipe
}

func NewParentController(pipe *pipes.ParentPipe) *ParentController {
	return &ParentController{pipe: pipe}
}
