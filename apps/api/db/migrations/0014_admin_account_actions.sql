CREATE TABLE IF NOT EXISTS admin_account_actions (
    id UUID PRIMARY KEY,
    target_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_profile_id UUID NOT NULL,
    target_role TEXT NOT NULL CHECK (target_role IN ('parent', 'nanny')),
    admin_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL CHECK (action = 'suspend'),
    reason TEXT NOT NULL CHECK (char_length(trim(reason)) > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_account_actions_target_user_id ON admin_account_actions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_account_actions_target_profile_id ON admin_account_actions(target_profile_id);
CREATE INDEX IF NOT EXISTS idx_admin_account_actions_admin_user_id ON admin_account_actions(admin_user_id);
