CREATE TABLE IF NOT EXISTS nanny_documents (
    id UUID PRIMARY KEY,
    nanny_profile_id UUID NOT NULL REFERENCES nanny_profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL CHECK (char_length(trim(file_name)) > 0),
    file_url TEXT NOT NULL CHECK (char_length(trim(file_url)) > 0),
    public_id TEXT NOT NULL CHECK (char_length(trim(public_id)) > 0),
    resource_type TEXT NOT NULL DEFAULT 'image' CHECK (resource_type IN ('image', 'raw', 'video')),
    mime_type TEXT NOT NULL DEFAULT '',
    size_bytes BIGINT NOT NULL DEFAULT 0 CHECK (size_bytes >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nanny_documents_profile_id ON nanny_documents(nanny_profile_id);
