package controllers

import "github.com/kinsittr/kinsittr-api/nanny/pipes"

type NannyController struct {
	pipe *pipes.NannyPipe
}

func NewNannyController(pipe *pipes.NannyPipe) *NannyController {
	return &NannyController{pipe: pipe}
}
