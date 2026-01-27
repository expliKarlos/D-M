-- ================================================
-- ADD PHONE FIELDS TO GUESTS TABLE
-- ================================================
-- Migration: Add country_code and phone fields

ALTER TABLE guests
ADD COLUMN IF NOT EXISTS country_code TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Create index for phone lookups (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_guests_phone ON guests(phone);

-- ================================================
-- USAGE NOTES
-- ================================================
-- country_code: International prefix (e.g., "+34", "+91", "+1")
-- phone: Phone number without prefix (e.g., "612345678")
-- Both fields are optional (no NOT NULL constraint)
