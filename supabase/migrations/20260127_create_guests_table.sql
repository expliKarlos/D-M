-- ================================================
-- RSVP / GUESTS TABLE
-- ================================================
-- This table stores guest confirmations (RSVP) for the wedding

CREATE TABLE IF NOT EXISTS guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    attending BOOLEAN DEFAULT NULL,
    dietary_restrictions TEXT,
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster name lookups
CREATE INDEX IF NOT EXISTS idx_guests_name ON guests(name);

-- Enable Row Level Security (RLS)
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role full access (used by API)
CREATE POLICY "Service role has full access to guests"
ON guests
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy: Authenticated users can read all guests (optional, depends on your use case)
CREATE POLICY "Authenticated users can view guests"
ON guests
FOR SELECT
TO authenticated
USING (true);

-- ================================================
-- COMMENTS
-- ================================================
-- To execute this migration in Supabase:
-- 1. Go to SQL Editor in Supabase Dashboard
-- 2. Paste this migration
-- 3. Click "Run" or use Supabase CLI: supabase db push
