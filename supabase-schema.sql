-- Create table for social wall posts
CREATE TABLE IF NOT EXISTS social_wall (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(50) NOT NULL DEFAULT 'photo',
  content TEXT NOT NULL,
  author VARCHAR(255) DEFAULT 'Invitado',
  user_id VARCHAR(255) DEFAULT 'anonymous',
  timestamp BIGINT NOT NULL,
  approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_social_wall_type_timestamp 
ON social_wall(type, timestamp DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE social_wall ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read approved posts
CREATE POLICY "Anyone can read approved posts"
ON social_wall
FOR SELECT
USING (approved = true);

-- Policy: Authenticated users can insert
CREATE POLICY "Authenticated users can insert"
ON social_wall
FOR INSERT
WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Grant permissions
GRANT SELECT ON social_wall TO anon;
GRANT ALL ON social_wall TO authenticated;
