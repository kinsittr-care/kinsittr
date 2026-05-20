CREATE TABLE IF NOT EXISTS nanny_reviews (
    id UUID PRIMARY KEY,
    booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
    nanny_profile_id UUID NOT NULL REFERENCES nanny_profiles(id) ON DELETE CASCADE,
    parent_profile_id UUID NOT NULL REFERENCES parent_profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL DEFAULT '',
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    flagged_at TIMESTAMPTZ,
    flagged_by UUID REFERENCES users(id) ON DELETE SET NULL,
    flag_reason TEXT,
    reviewed_by_admin BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nanny_reviews_nanny_visible
    ON nanny_reviews (nanny_profile_id, is_visible, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_nanny_reviews_parent
    ON nanny_reviews (parent_profile_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_nanny_reviews_flagged
    ON nanny_reviews (flagged_at DESC)
    WHERE flagged_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS admin_review_actions (
    id UUID PRIMARY KEY,
    review_id UUID NOT NULL REFERENCES nanny_reviews(id) ON DELETE CASCADE,
    admin_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL CHECK (action IN ('flag', 'unflag')),
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_review_actions_review
    ON admin_review_actions (review_id, created_at DESC);
