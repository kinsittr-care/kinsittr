CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    firstname TEXT NOT NULL CHECK (char_length(trim(firstname)) > 0),
    lastname TEXT NOT NULL CHECK (char_length(trim(lastname)) > 0),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('parent', 'nanny', 'admin')),
    phone TEXT NOT NULL DEFAULT '',
    country_code TEXT NOT NULL DEFAULT '',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

CREATE TABLE IF NOT EXISTS parent_profiles (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL CHECK (char_length(trim(display_name)) > 0),
    num_children INTEGER NOT NULL DEFAULT 0 CHECK (num_children >= 0),
    children_ages INTEGER[] NOT NULL DEFAULT '{}'::integer[],
    city TEXT NOT NULL DEFAULT '',
    province TEXT NOT NULL DEFAULT '',
    stripe_customer_id TEXT NOT NULL DEFAULT '',
    stripe_default_payment_method_id TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parent_profiles_user_id ON parent_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_parent_profiles_city_province ON parent_profiles(city, province);

CREATE TABLE IF NOT EXISTS nanny_profiles (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL CHECK (char_length(trim(display_name)) > 0),
    bio TEXT NOT NULL DEFAULT '',
    specialties TEXT[] NOT NULL DEFAULT '{}'::text[],
    rate_per_hour NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (rate_per_hour >= 0),
    service_type TEXT NOT NULL DEFAULT 'nanny',
    currency TEXT NOT NULL DEFAULT 'CAD',
    city TEXT NOT NULL DEFAULT '',
    province TEXT NOT NULL DEFAULT '',
    verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'under_review', 'verified', 'rejected')),
    verified_at TIMESTAMPTZ,
    stripe_account_id TEXT,
    stripe_onboarded BOOLEAN NOT NULL DEFAULT FALSE,
    rating_avg NUMERIC(3, 2) NOT NULL DEFAULT 0 CHECK (rating_avg >= 0 AND rating_avg <= 5),
    rating_count INTEGER NOT NULL DEFAULT 0 CHECK (rating_count >= 0),
    avatar_url TEXT NOT NULL DEFAULT '',
    avatar_public_id TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nanny_profiles_user_id ON nanny_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_nanny_profiles_verification_status ON nanny_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_nanny_profiles_city_province ON nanny_profiles(city, province);
CREATE INDEX IF NOT EXISTS idx_nanny_profiles_specialties ON nanny_profiles USING gin(specialties);
