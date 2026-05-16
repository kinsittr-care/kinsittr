# KinSittr

KinSittr is a Canadian childcare platform connecting families with verified nannies. The product currently includes the marketing site, parent and nanny web apps, and a Go API for auth, profiles, bookings, contact, and conversations.

## Repository Structure

```text
apps/
  api/        Go + Fiber API
  web/        Next.js 16 app
packages/     Shared workspace packages and config
todos/        Planning notes and implementation backlog
```

## Current Product Surface

### Web App (`apps/web`)

Built with Next.js 16 App Router, React Query, Tailwind CSS v4, and the project design system.

Key routes:

| Route | Description |
|---|---|
| `/` | Landing page |
| `/about` | Story, values, and team |
| `/safety` | Verification process and trust signals |
| `/verification` | Nanny application walkthrough |
| `/nanny-resources` | Benefits, pay, and guides for caregivers |
| `/contact` | Public contact form |
| `/auth/parent` | Parent auth flow |
| `/auth/nanny` | Nanny auth flow |
| `/parent` | Parent nanny browsing flow |
| `/parent/bookings` | Parent booking list and booking details |
| `/parent/messages` | Parent conversations and messages |
| `/parent/profile` | Parent profile, children ages, and booking history |
| `/parent/settings` | Parent preferences and account security |
| `/nanny` | Nanny dashboard |
| `/nanny/requests` | Nanny booking requests and approve/decline actions |
| `/nanny/messages` | Nanny conversations and messages |
| `/nanny/profile` | Nanny own profile management |

### API (`apps/api`)

Built with Go, Fiber, pgx, PostgreSQL, JWT auth, and Resend for contact email when configured.

Implemented API areas:

| Area | Routes |
|---|---|
| Auth | parent/nanny register, login, refresh, logout, `me`, change password, deactivate account |
| Contact | public contact form email |
| Public nannies | verified nanny list, public nanny profile |
| Nanny profile | own profile read/update |
| Parent profile | own profile read/update |
| Parent settings | notification/privacy/preference settings |
| Bookings | parent create/list/get/cancel, nanny list/get/approve/decline |
| Conversations | list/get messages, send messages, mark conversation read |


## Local Development

### Web

```bash
cd apps/web
yarn install
yarn dev
```

The web app expects the API at `NEXT_PUBLIC_API_URL`, defaulting to `http://localhost:4006`.

### API

Run the API:

```bash
cd apps/api
go run .
```

The API exposes `GET /health` and mounts app routes under `/api/v1`.

## Database

SQL migrations live in:

```text
apps/api/db/migrations/
```

Apply them in order against the configured PostgreSQL database. The current schema includes users, profiles, refresh sessions, bookings, conversations, messages, parent settings, and conversation read state.

## Verification

API:

```bash
cd apps/api
GOCACHE=/private/tmp/kinsittr-go-cache go test ./...
```

Web:

```bash
cd apps/web
yarn lint
yarn build
```

`yarn build` may need network access because `next/font` fetches Google Fonts during production builds.
