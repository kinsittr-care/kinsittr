ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;

ALTER TABLE bookings
ADD CONSTRAINT bookings_status_check
CHECK (status IN ('pending', 'approved', 'declined', 'cancelled', 'completed'));

CREATE TABLE IF NOT EXISTS booking_change_requests (
    id UUID PRIMARY KEY,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    requested_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    requested_by_role TEXT NOT NULL CHECK (requested_by_role IN ('parent', 'nanny')),
    type TEXT NOT NULL CHECK (type IN ('reschedule', 'cancel')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
    proposed_date DATE,
    proposed_start_time TIMESTAMP,
    proposed_duration INT CHECK (proposed_duration IS NULL OR proposed_duration > 0),
    reason TEXT NOT NULL CHECK (char_length(trim(reason)) > 0),
    response_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    CHECK (
        type <> 'reschedule'
        OR (proposed_date IS NOT NULL AND proposed_start_time IS NOT NULL AND proposed_duration IS NOT NULL)
    ),
    CHECK (
        type <> 'cancel'
        OR (proposed_date IS NULL AND proposed_start_time IS NULL AND proposed_duration IS NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_booking_change_requests_booking_id ON booking_change_requests(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_change_requests_requested_by_user_id ON booking_change_requests(requested_by_user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_booking_change_requests_one_pending
ON booking_change_requests(booking_id)
WHERE status = 'pending';
