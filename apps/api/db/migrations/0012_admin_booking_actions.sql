CREATE TABLE IF NOT EXISTS admin_booking_actions (
    id UUID PRIMARY KEY,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    admin_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL CHECK (action IN ('cancel', 'complete')),
    previous_status TEXT NOT NULL,
    new_status TEXT NOT NULL,
    reason TEXT NOT NULL CHECK (LENGTH(TRIM(reason)) > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_booking_actions_booking_id ON admin_booking_actions(booking_id);
CREATE INDEX IF NOT EXISTS idx_admin_booking_actions_admin_user_id ON admin_booking_actions(admin_user_id);
