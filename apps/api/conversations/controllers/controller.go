package controllers

import "github.com/kinsittr/kinsittr-api/conversations/pipes"

type ConversationsController struct {
	pipe *pipes.ConversationsPipe
}

func NewConversationsController(pipe *pipes.ConversationsPipe) *ConversationsController {
	return &ConversationsController{pipe: pipe}
}
