# API Endpoints

This file tracks the current API surface in `apps/api`.

Base URL prefix:
- `/api/v1`

Server route:
- `GET /health` — health check for the API server

## Implemented

### Auth
- `POST /api/v1/auth/parent/register` — register a parent account
- `POST /api/v1/auth/nanny/register` — register a nanny account
- `POST /api/v1/auth/login` — sign in an existing parent or nanny
- `POST /api/v1/auth/refresh` — rotate and return access/refresh tokens
- `POST /api/v1/auth/logout` — revoke the current refresh session
- `GET /api/v1/auth/me` — return the authenticated user session and role profile
- `PATCH /api/v1/auth/password` — change password and revoke refresh sessions
- `DELETE /api/v1/auth/account` — deactivate account and revoke refresh sessions

### Admin Auth
- `POST /api/v1/admin/auth/login` — sign in an admin
- `GET /api/v1/admin/auth/me` — return the current admin session
- `POST /api/v1/admin/auth/refresh` — rotate admin access/refresh tokens
- `POST /api/v1/admin/auth/logout` — revoke the current admin refresh session

### Contact
- `POST /api/v1/contact` — submit the public contact form

### Public Nannies
- `GET /api/v1/nannies` — list verified public nanny cards with pagination and filters
- `GET /api/v1/nannies/:id` — return one verified nanny public profile
- `GET /api/v1/nannies/:id/reviews` — list public reviews for one nanny

### Nanny
- `GET /api/v1/nanny/profile` — return the authenticated nanny's own profile
- `PATCH /api/v1/nanny/profile` — update the authenticated nanny's own profile
- `POST /api/v1/nanny/avatar` — upload or replace the authenticated nanny's public profile avatar
- `DELETE /api/v1/nanny/avatar` — remove the authenticated nanny's public profile avatar
- `GET /api/v1/nanny/bookings` — list bookings for the authenticated nanny
- `GET /api/v1/nanny/bookings/:id` — return one nanny booking
- `PATCH /api/v1/nanny/bookings/:id/approve` — approve a pending booking and open the conversation
- `PATCH /api/v1/nanny/bookings/:id/decline` — decline a pending booking
- `PATCH /api/v1/nanny/bookings/:id/complete` — mark an approved past booking as completed
- `POST /api/v1/nanny/bookings/:id/change-requests` — create a reschedule or approved-cancellation request
- `GET /api/v1/nanny/bookings/:id/change-requests` — list nanny-visible change requests for one booking
- `PATCH /api/v1/nanny/bookings/:id/change-requests/:requestId/accept` — accept the parent's pending change request
- `PATCH /api/v1/nanny/bookings/:id/change-requests/:requestId/decline` — decline the parent's pending change request
- `POST /api/v1/nanny/bookings/:id/review` — nanny reviews the parent after a completed booking
- `GET /api/v1/nanny/reviews` — list reviews written by the authenticated nanny

### Parent
- `GET /api/v1/parent/profile` — return the authenticated parent's profile details
- `PATCH /api/v1/parent/profile` — update the authenticated parent's profile details
- `GET /api/v1/parent/settings` — return notification, privacy, and preference settings
- `PATCH /api/v1/parent/settings` — update notification, privacy, and preference settings

### Bookings
- `POST /api/v1/bookings` — create a booking request from parent to nanny
- `GET /api/v1/bookings` — list bookings for the authenticated parent
- `GET /api/v1/bookings/:id` — return one parent booking
- `PATCH /api/v1/bookings/:id/cancel` — parent cancels a pending booking
- `POST /api/v1/bookings/:id/change-requests` — create a reschedule or approved-cancellation request
- `GET /api/v1/bookings/:id/change-requests` — list parent-visible change requests for one booking
- `PATCH /api/v1/bookings/:id/change-requests/:requestId/accept` — accept the nanny's pending change request
- `PATCH /api/v1/bookings/:id/change-requests/:requestId/decline` — decline the nanny's pending change request
- `POST /api/v1/bookings/:id/review` — parent reviews the nanny after a completed booking

### Reviews
- `GET /api/v1/reviews` — list reviews written by the authenticated parent

### Messaging
- `GET /api/v1/conversations` — list the current user's message threads
- `GET /api/v1/conversations/:id` — return one conversation's header and metadata
- `GET /api/v1/conversations/:id/messages` — list messages in one conversation
- `POST /api/v1/conversations/:id/messages` — send a message into one conversation
- `PATCH /api/v1/conversations/:id/read` — mark one conversation as read for the authenticated user

### Notifications
- `GET /api/v1/notifications` — list notifications for the authenticated parent or nanny
- `GET /api/v1/notifications/unread-count` — return unread notification count
- `PATCH /api/v1/notifications/:id/read` — mark one notification as read
- `PATCH /api/v1/notifications/read-all` — mark all notifications as read

### Admin Screening
- `GET /api/v1/admin/screening/nannies` — list nannies in the screening queue
- `PATCH /api/v1/admin/screening/nannies/:id/under-review` — start screening review
- `PATCH /api/v1/admin/screening/nannies/:id/steps` — update screening checklist steps
- `PATCH /api/v1/admin/screening/nannies/:id/reset` — reset rejected nanny for re-review with required reason

### Admin Moderation
- `GET /api/v1/admin/nannies` — list nannies for moderation
- `GET /api/v1/admin/nannies/:id` — return nanny moderation details
- `GET /api/v1/admin/nannies/:id/actions` — list nanny screening and account audit actions
- `PATCH /api/v1/admin/nannies/:id/verify` — verify a nanny after screening
- `PATCH /api/v1/admin/nannies/:id/reject` — reject a nanny with required reason
- `PATCH /api/v1/admin/nannies/:id/suspend` — suspend a nanny account with required reason
- `PATCH /api/v1/admin/nannies/:id/reactivate` — reactivate a suspended nanny account with required reason
- `GET /api/v1/admin/parents` — list parents for moderation
- `GET /api/v1/admin/parents/:id` — return parent moderation details
- `GET /api/v1/admin/parents/:id/actions` — list parent account audit actions
- `PATCH /api/v1/admin/parents/:id/suspend` — suspend a parent account with required reason
- `PATCH /api/v1/admin/parents/:id/reactivate` — reactivate a suspended parent account with required reason

### Admin Bookings
- `GET /api/v1/admin/bookings` — list bookings with filters
- `GET /api/v1/admin/bookings/:id` — return one admin booking detail
- `GET /api/v1/admin/bookings/:id/actions` — list admin actions for one booking
- `PATCH /api/v1/admin/bookings/:id/cancel` — force-cancel a booking with required reason
- `PATCH /api/v1/admin/bookings/:id/complete` — force-complete a booking with required reason

### Admin Conversations
- `GET /api/v1/admin/conversations` — list conversations for moderation
- `GET /api/v1/admin/conversations/:id/messages` — list messages in a conversation
- `GET /api/v1/admin/conversations/:id/actions` — list conversation moderation audit actions
- `PATCH /api/v1/admin/conversations/:id/lock` — lock a conversation with required reason
- `PATCH /api/v1/admin/conversations/:id/unlock` — unlock a conversation with required reason
- `PATCH /api/v1/admin/conversations/:id/messages/:message_id/hide` — hide one message with required reason

### Admin Reviews
- `GET /api/v1/admin/reviews` — list reviews for moderation
- `GET /api/v1/admin/reviews/:id` — return one review by `target=nanny|parent`
- `GET /api/v1/admin/reviews/:id/actions` — list admin actions for one review
- `PATCH /api/v1/admin/reviews/:id/flag` — hide/flag a review with required reason
- `PATCH /api/v1/admin/reviews/:id/unflag` — restore/unflag a review with required reason

### Admin Analytics
- `GET /api/v1/admin/analytics` — return admin metrics, trends, city breakdowns, and top nannies

### Admin Management
- `GET /api/v1/admin/admins` — list admin users
- `POST /api/v1/admin/admins/invite` — create an admin invite and send invite email when mail is configured
- `POST /api/v1/admin/admins/accept-invite` — accept an admin invite and create the admin account
- `PATCH /api/v1/admin/admins/:id/disable` — disable an admin account
- `PATCH /api/v1/admin/admins/:id/reactivate` — reactivate a disabled admin account with required reason

### Payments
- `GET /api/v1/nanny/payments/status` — return the authenticated nanny's Stripe Connect status
- `POST /api/v1/nanny/payments/connect` — create or reuse a Stripe Express account and return an onboarding link
- `POST /api/v1/nanny/bookings/:id/payment/retry` — retry payment and complete an eligible approved booking after billing is fixed
- `POST /api/v1/parent/billing/setup-intent` — create a Stripe SetupIntent for saving a parent card
- `GET /api/v1/parent/billing/payment-methods` — list the parent's saved payment methods
- `PUT /api/v1/parent/billing/payment-methods/:id` — update a payment method or set default
- `DELETE /api/v1/parent/billing/payment-methods/:id` — remove a saved payment method
- `POST /api/v1/webhooks/stripe` — process Stripe account, payment intent, and refund webhooks

## Yet To Implement

### Parent Children
- `GET /api/v1/parent/children` — list the authenticated parent's children
- `POST /api/v1/parent/children` — add a child to the authenticated parent's account
- `PUT /api/v1/parent/children/:id` — update one child record
- `DELETE /api/v1/parent/children/:id` — remove one child record

### Account / Security
- `GET /api/v1/account/export` — export the authenticated user's account data

### Auth Recovery
- `POST /api/v1/auth/forgot-password` — start password reset flow
- `POST /api/v1/auth/reset-password` — complete password reset with token/code

### Admin Follow-Ups
- Add admin roles and permissions for v1.1

## Notes

- Public nanny list supports `page`, `limit`, `city`, `province`, `min_rate`, `max_rate`, repeated `specialty`, `service_type`, and `sort`.
- Contact and admin invite email delivery require Resend configuration.
- Admin invite acceptance creates the admin account but does not issue auth tokens; the admin signs in after accepting.
