-- Add theme_preference column to profiles table
ALTER TABLE profiles 
ADD COLUMN theme_preference text DEFAULT 'default';

COMMENT ON COLUMN profiles.theme_preference IS 'User preference for UI theme (default, romantic, golden, sage, blue, lavender)';
