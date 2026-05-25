ALTER TABLE parent_profiles
    ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT NOT NULL DEFAULT '';

ALTER TABLE nanny_profiles
    ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
    ADD COLUMN IF NOT EXISTS stripe_onboarded BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS booking_payments (
    id UUID PRIMARY KEY,
    booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
    parent_profile_id UUID NOT NULL REFERENCES parent_profiles(id) ON DELETE CASCADE,
    nanny_profile_id UUID NOT NULL REFERENCES nanny_profiles(id) ON DELETE CASCADE,
    stripe_payment_intent_id TEXT UNIQUE,
    stripe_charge_id TEXT,
    stripe_refund_id TEXT,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    platform_fee NUMERIC(10, 2) NOT NULL CHECK (platform_fee >= 0),
    currency TEXT NOT NULL DEFAULT 'CAD',
    status TEXT NOT NULL CHECK (status IN ('requires_payment_method', 'requires_confirmation', 'requires_action', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded')),
    failure_message TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_payments_parent_profile_id
    ON booking_payments(parent_profile_id);

CREATE INDEX IF NOT EXISTS idx_booking_payments_nanny_profile_id
    ON booking_payments(nanny_profile_id);

CREATE INDEX IF NOT EXISTS idx_booking_payments_status
    ON booking_payments(status);
