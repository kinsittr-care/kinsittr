CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('parent', 'nanny')),
    type TEXT NOT NULL,
    title TEXT NOT NULL CHECK (char_length(trim(title)) > 0),
    body TEXT NOT NULL CHECK (char_length(trim(body)) > 0),
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_role_created_at
ON notifications(user_id, role, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_role_unread
ON notifications(user_id, role)
WHERE read_at IS NULL;
