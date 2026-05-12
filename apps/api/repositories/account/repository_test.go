package account

// Integration tests for AccountRepository.
// Run with: go test -tags integration ./repositories/account/...
//
// Cases to cover:
//
//   CreateUser
//     - inserts a user and returns it with the generated ID
//     - returns an error on duplicate email
//
//   GetUserByEmail
//     - returns the user when found
//     - returns zero-value when email does not exist
//
//   GetUserByID
//     - returns the user when found
//     - returns zero-value for unknown ID
//
//   CreateRefreshSession
//     - inserts a session row
//
//   GetRefreshSession
//     - returns the session when found and not expired
//     - returns zero-value for an unknown session ID
//
//   DeleteRefreshSession
//     - removes the session so subsequent gets return zero-value
