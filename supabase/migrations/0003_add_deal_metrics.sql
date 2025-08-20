-- Add metrics and saved status columns to deals table
-- Apply using Supabase CLI: supabase db push

-- Add health_score column
ALTER TABLE deals ADD COLUMN IF NOT EXISTS health_score INTEGER;

-- Add metrics column (JSONB to store revenue, profit_margin, growth_rate, etc.)
ALTER TABLE deals ADD COLUMN IF NOT EXISTS metrics JSONB;

-- Add is_saved column
ALTER TABLE deals ADD COLUMN IF NOT EXISTS is_saved BOOLEAN DEFAULT FALSE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_deals_health_score ON deals(health_score);
CREATE INDEX IF NOT EXISTS idx_deals_is_saved ON deals(is_saved);
CREATE INDEX IF NOT EXISTS idx_deals_user_saved ON deals(user_id, is_saved); 