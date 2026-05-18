CREATE TABLE IF NOT EXISTS admin_invites (
    id UUID PRIMARY KEY,
    firstname TEXT NOT NULL CHECK (char_length(trim(firstname)) > 0),
    lastname TEXT NOT NULL CHECK (char_length(trim(lastname)) > 0),
    email TEXT NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    accepted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    accepted_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_invites_email ON admin_invites(email);
CREATE INDEX IF NOT EXISTS idx_admin_invites_token_hash ON admin_invites(token_hash);

CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_invites_one_open_email
ON admin_invites(email)
WHERE accepted_at IS NULL;
