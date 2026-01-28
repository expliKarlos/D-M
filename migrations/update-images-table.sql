-- Create the 'images' table for the dual-upload gallery system
-- This replaces the previous ALTER implementation since the table didn't exist.

CREATE TABLE IF NOT EXISTS public.images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Dual Upload Fields
    url_optimized TEXT NOT NULL,         -- Supabase Storage URL (WebP)
    drive_file_id TEXT,                  -- Google Drive Original File ID
    
    -- Metadata
    category_id TEXT,                    -- Moment ID (e.g., 'fiesta', 'ceremonia')
    author_id TEXT,                      -- User ID (from local storage or auth)
    author_name TEXT,                    -- User Display Name
    timestamp TIMESTAMPTZ,               -- Event time
    
    -- Engagement
    likes_count INTEGER DEFAULT 0,
    liked_by TEXT[] DEFAULT '{}',        -- Array of user IDs who liked
    
    -- Moderation
    is_approved BOOLEAN DEFAULT TRUE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_images_category ON public.images(category_id);
CREATE INDEX IF NOT EXISTS idx_images_timestamp ON public.images(timestamp DESC);

-- Enable RLS (Security)
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

-- Policies (Adjust strictness as needed)
-- 1. Everyone can view images
CREATE POLICY "Public Read Access" 
ON public.images FOR SELECT 
USING (true);

-- 2. Everyone can upload (since we use anonymous IDs)
CREATE POLICY "Public Upload Access" 
ON public.images FOR INSERT 
WITH CHECK (true);

-- 3. Users can update their own likes (or Admin)
-- For now, allowing update to ease development, but ideally restricted by author_id
CREATE POLICY "Public Update Access" 
ON public.images FOR UPDATE 
USING (true);

-- 4. Delete (Admin Only ideally, currently open for the Admin Dashboard implementation)
CREATE POLICY "Public Delete Access" 
ON public.images FOR DELETE 
USING (true);

COMMENT ON TABLE public.images IS 'Master gallery table syncing Supabase and Google Drive uploads';
