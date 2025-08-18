-- Add is_saved column to deals table
ALTER TABLE deals ADD COLUMN IF NOT EXISTS is_saved BOOLEAN DEFAULT FALSE;

-- Create index for better performance when querying saved deals
CREATE INDEX IF NOT EXISTS idx_deals_is_saved ON deals(is_saved);
CREATE INDEX IF NOT EXISTS idx_deals_user_saved ON deals(user_id, is_saved); 