-- MIGRATION: 001_initial_schema.sql
-- Run this ENTIRE file in Supabase SQL Editor to create the images table.

-- 1. CLEANUP (Optional - ensures we start fresh if partial state exists)
DROP TABLE IF EXISTS public.images;

-- 2. CREATE TABLE
CREATE TABLE public.images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Dual Upload Fields
    url_optimized TEXT NOT NULL,         -- Supabase Storage URL
    drive_file_id TEXT,                  -- Google Drive File ID
    
    -- Metadata
    category_id TEXT,                    -- 'fiesta', 'boda', etc.
    author_id TEXT,                      
    author_name TEXT,                    
    timestamp TIMESTAMPTZ,               
    
    -- Engagement
    likes_count INTEGER DEFAULT 0,
    liked_by TEXT[] DEFAULT '{}',
    
    -- Moderation
    is_approved BOOLEAN DEFAULT TRUE
);

-- 3. INDEXES
CREATE INDEX idx_images_category ON public.images(category_id);
CREATE INDEX idx_images_timestamp ON public.images(timestamp DESC);

-- 4. SECURITY (RLS)
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

-- 5. POLICIES
CREATE POLICY "Public Read Access" ON public.images FOR SELECT USING (true);
CREATE POLICY "Public Upload Access" ON public.images FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Access" ON public.images FOR UPDATE USING (true);
CREATE POLICY "Public Delete Access" ON public.images FOR DELETE USING (true);

-- 6. STORAGE BUCKET (Optional - helps if bucket is missing)
-- Note: 'photos' bucket usually managed in Storage UI, but this doesn't hurt.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('photos', 'photos', true) 
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Storage Access" ON storage.objects
FOR SELECT USING (bucket_id = 'photos');

CREATE POLICY "Public Storage Upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'photos');
