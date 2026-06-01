CREATE TABLE IF NOT EXISTS password_recovery_tokens (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    request_ip TEXT NOT NULL DEFAULT '',
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_recovery_tokens_user_id
ON password_recovery_tokens(user_id);

CREATE INDEX IF NOT EXISTS idx_password_recovery_tokens_hash
ON password_recovery_tokens(token_hash);

CREATE INDEX IF NOT EXISTS idx_password_recovery_tokens_active_user
ON password_recovery_tokens(user_id, expires_at)
WHERE used_at IS NULL;
