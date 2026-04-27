package mail

import "context"

type Message struct {
	ToEmail     string
	ReplyTo     string
	Subject     string
	TextContent string
	HTMLContent string
}

type Provider interface {
	Send(ctx context.Context, message Message) error
}
