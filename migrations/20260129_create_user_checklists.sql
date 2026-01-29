-- Create table for user checklists
CREATE TABLE IF NOT EXISTS user_checklists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id VARCHAR(100) NOT NULL,
  item_title TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- Enable RLS
ALTER TABLE user_checklists ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own checklist items
CREATE POLICY "Users can view own checklist"
ON user_checklists
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert/update their own checklist items
CREATE POLICY "Users can insert own checklist"
ON user_checklists
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checklist"
ON user_checklists
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can delete their own items (optional, but good practice)
CREATE POLICY "Users can delete own checklist"
ON user_checklists
FOR DELETE
USING (auth.uid() = user_id);

-- Grant access
GRANT ALL ON user_checklists TO authenticated;
