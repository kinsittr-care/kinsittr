ALTER TABLE nanny_profiles
    ADD COLUMN IF NOT EXISTS avatar_public_id TEXT NOT NULL DEFAULT '';
