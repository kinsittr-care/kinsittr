CREATE TABLE IF NOT EXISTS admin_nanny_actions (
    id UUID PRIMARY KEY,
    nanny_profile_id UUID NOT NULL REFERENCES nanny_profiles(id) ON DELETE CASCADE,
    admin_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL CHECK (action IN ('verify', 'reject', 'reset', 'under_review')),
    previous_status TEXT NOT NULL,
    new_status TEXT NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (action NOT IN ('reject', 'reset') OR char_length(trim(COALESCE(reason, ''))) > 0)
);

CREATE INDEX IF NOT EXISTS idx_admin_nanny_actions_nanny_profile_id ON admin_nanny_actions(nanny_profile_id);
CREATE INDEX IF NOT EXISTS idx_admin_nanny_actions_admin_user_id ON admin_nanny_actions(admin_user_id);

ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS locked_by UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS lock_reason TEXT;

ALTER TABLE messages
ADD COLUMN IF NOT EXISTS hidden_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS hidden_by UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS hidden_reason TEXT;

CREATE TABLE IF NOT EXISTS admin_conversation_actions (
    id UUID PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    admin_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL CHECK (action IN ('lock', 'unlock', 'hide_message')),
    reason TEXT NOT NULL CHECK (char_length(trim(reason)) > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_conversation_actions_conversation_id ON admin_conversation_actions(conversation_id);
CREATE INDEX IF NOT EXISTS idx_admin_conversation_actions_message_id ON admin_conversation_actions(message_id);
CREATE INDEX IF NOT EXISTS idx_admin_conversation_actions_admin_user_id ON admin_conversation_actions(admin_user_id);
