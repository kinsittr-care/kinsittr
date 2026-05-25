ALTER TABLE parent_profiles
    ADD COLUMN IF NOT EXISTS stripe_default_payment_method_id TEXT NOT NULL DEFAULT '';
