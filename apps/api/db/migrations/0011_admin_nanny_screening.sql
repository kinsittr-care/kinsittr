CREATE TABLE IF NOT EXISTS nanny_screening_steps (
    nanny_profile_id UUID PRIMARY KEY REFERENCES nanny_profiles(id) ON DELETE CASCADE,
    docs_reviewed BOOLEAN NOT NULL DEFAULT FALSE,
    references_checked BOOLEAN NOT NULL DEFAULT FALSE,
    interview_done BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
