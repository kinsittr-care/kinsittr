CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY,
    parent_profile_id UUID NOT NULL REFERENCES parent_profiles(id) ON DELETE CASCADE,
    nanny_profile_id UUID NOT NULL REFERENCES nanny_profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIMESTAMP NOT NULL,
    duration INT NOT NULL CHECK (duration > 0),
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'declined')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_parent_profile_id ON bookings(parent_profile_id);
CREATE INDEX IF NOT EXISTS idx_bookings_nanny_profile_id ON bookings(nanny_profile_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
