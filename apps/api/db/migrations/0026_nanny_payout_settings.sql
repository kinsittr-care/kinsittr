CREATE TABLE IF NOT EXISTS nanny_payout_settings (
    nanny_profile_id UUID PRIMARY KEY REFERENCES nanny_profiles(id) ON DELETE CASCADE,
    schedule TEXT NOT NULL DEFAULT 'weekly' CHECK (schedule IN ('daily', 'weekly')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
