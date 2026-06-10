CREATE TABLE IF NOT EXISTS parent_settings (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    notify_messages BOOLEAN NOT NULL DEFAULT TRUE,
    notify_bookings BOOLEAN NOT NULL DEFAULT TRUE,
    notify_reminders BOOLEAN NOT NULL DEFAULT FALSE,
    notify_weekly_digest BOOLEAN NOT NULL DEFAULT TRUE,
    show_profile BOOLEAN NOT NULL DEFAULT TRUE,
    share_reviews BOOLEAN NOT NULL DEFAULT TRUE,
    analytics BOOLEAN NOT NULL DEFAULT FALSE,
    language TEXT NOT NULL DEFAULT 'English (Canada)',
    currency TEXT NOT NULL DEFAULT 'CAD',
    timezone TEXT NOT NULL DEFAULT 'Eastern Time (ET)',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS parent_settings_user_id_idx
    ON parent_settings (user_id);
