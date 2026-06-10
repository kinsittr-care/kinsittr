# KinSittr

KinSittr is a childcare marketplace for Canadian families and verified nannies. The repository contains the public marketing site, parent and nanny product surfaces, an admin console, and the Go API that powers authentication, profiles, bookings, messaging, notifications, reviews, and moderation.

## Repository Structure

```text
apps/
  api/        Go + Fiber API
  web/        Next.js 16 app
packages/     Shared workspace packages and config
todos/        Planning notes and implementation backlog
```

## Product Flow

Parents discover KinSittr through the marketing pages, create an account, complete their profile, and browse verified nannies. The browse experience is backed by public nanny search with server-side filters for location, rate, predefined specialties, and sorting. Once a parent finds a nanny, they can request a booking and track it through pending, approved, declined, cancelled, completed, and change-request states. Booking history uses dedicated detail pages so parents can open and review individual bookings without crowding the list view.

Nannies register with a lightweight account flow, then complete their profile in-app before their public listing is useful for verification and discovery. They manage their own profile, select up to three allowed specialties, review booking requests, approve or decline work, complete approved bookings after the service window, and participate in conversations created from approved bookings.

Messaging starts from bookings rather than open-ended chat. A conversation is created when a booking is approved, and both sides can view threads, send messages, mark conversations as read, and receive notifications for relevant activity.

Reviews are tied to completed bookings. Parents can review nannies, and nannies can review parents. Reviews are intentionally irreversible from the user side after submission; moderation happens through the admin console. Nanny ratings are not seeded with fake defaults; public rating displays stay empty until parent reviews exist, while admin views can distinguish unrated/new profiles.

Admins operate the trust and support layer. The admin console handles nanny screening, nanny and parent moderation, booking intervention, conversation moderation, review moderation, analytics, and admin account management. Moderation actions that change account or content state require reasons and write audit records.

## Backend Flow

The API is organized by feature area. Controllers parse requests and delegate to pipes. Pipes contain validation, authorization-sensitive business flow, repository calls, notifications, email triggers, and response shaping. Repositories own PostgreSQL reads/writes and are split by domain to keep files bounded.

Shared infrastructure includes JWT auth, refresh-session storage, role middleware, PostgreSQL migrations, Resend-backed mail delivery, and reusable response/validation helpers. Email currently powers contact submissions and admin invite delivery when Resend configuration is present.

File uploads in v1 are limited to nanny public profile avatars through Cloudinary. Verification or screening documents should use a separate private document upload flow rather than the public avatar path.

## Frontend Flow

The web app uses Next.js App Router with TanStack Query for API state. API integrations live under `apps/web/src/utils/api`, while shared response and domain types live under `apps/web/src/types/api`.

The parent and nanny app areas use feature components for dashboards, bookings, messages, notifications, reviews, billing, and profile management. The admin area keeps route-level views focused on state and API wiring, with smaller table, panel, filter, and display components moved into `components/admin/compositions`. Admin analytics and moderation screens use responsive layouts for mobile, tablet, and desktop breakpoints.

KinSittr is currently Canada-focused. Parent preferences and billing surfaces use CAD, and location/profile flows are built around Canadian cities and provinces with limited testing overrides for local development.

## Local Development

### Web

```bash
cd apps/web
yarn install
yarn dev
```

The web app expects the API at `NEXT_PUBLIC_API_URL`, defaulting to `http://localhost:4006`.

### API

```bash
cd apps/api
go run .
```

The API exposes a health check and mounts versioned app routes under the v1 API prefix. [ENDPOINTS.md](./ENDPOINTS.md) is the canonical inventory for implemented and planned API endpoints.

## Database

SQL migrations live in:

```text
apps/api/db/migrations/
```

The API can apply embedded migrations on startup when `AUTO_MIGRATE=true`. Applied files are tracked in `schema_migrations` with checksums, failures are recorded in `schema_migration_failures`, and the runner uses a PostgreSQL advisory lock so only one API instance migrates at a time. `MIGRATION_LOCK_TIMEOUT` controls how long startup waits for the lock.

For deployment pipelines, migrations can be run without starting the HTTP server:

```bash
cd apps/api
go run ./cmd/migrate
```

The migration command loads `apps/api/.env` when run from `apps/api`. For an existing database that was migrated manually before `schema_migrations` existed, baseline the current embedded migration set once instead of re-running old SQL:

```bash
cd apps/api
go run ./cmd/migrate --baseline
```

Baseline mode records embedded migration filenames and checksums only; it does not validate that the live schema matches those files. Use it only after confirming the database already has the expected schema.

Keep `AUTO_MIGRATE=false` in production if migrations are handled by a separate deploy step, especially for existing databases that were migrated manually before `schema_migrations` existed.

Migration files run inside database transactions. Avoid non-transactional PostgreSQL statements such as `CREATE INDEX CONCURRENTLY`, `DROP INDEX CONCURRENTLY`, and `VACUUM` unless the runner is extended for non-transactional migrations.

The schema currently covers users, parent and nanny profiles, refresh sessions, bookings, booking change requests, conversations, messages, notifications, reviews, screening records, admin actions, and admin invites.

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
