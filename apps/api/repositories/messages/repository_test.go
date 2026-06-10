package messages

// Integration tests for MessagesRepository.
// Run with: go test -tags integration ./repositories/messages/...
//
// Requires a running Postgres instance. Set DATABASE_URL in the environment
// or use testcontainers-go to spin one up automatically.
//
// Cases to cover:
//
//   GetConversationByBookingID
//     - returns the conversation when the booking already has one
//     - returns zero-value when no conversation exists for the booking
//
//   CreateConversation
//     - inserts a conversation for an approved booking
//     - is idempotent on duplicate booking_id via ON CONFLICT
//     - returns the existing conversation row on repeated create
//
//   ListParentConversations / ListNannyConversations
//     - paginate correctly (page, limit)
//     - order by latest message activity descending
//     - fall back to conversation updated_at when no messages exist
//     - return total count separate from the current page slice
//     - truncate last_message_preview to the configured SQL length
//
//   GetParentConversationByID / GetNannyConversationByID
//     - return the conversation when it belongs to the requesting profile
//     - return zero-value when it belongs to a different profile
//     - include booking status and other participant metadata
//
//   ListMessages
//     - paginates correctly (page, limit)
//     - orders messages oldest → newest
//     - returns total count separate from the current page slice
//
//   CreateMessage
//     - inserts the message and returns it with timestamps
//     - updates the parent conversation updated_at in the same transaction
//     - rolls back when the conversation update fails
