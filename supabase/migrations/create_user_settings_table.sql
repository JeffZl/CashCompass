-- User Settings Table for CashCompass
-- Run this in your Supabase SQL Editor

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    preferred_currency TEXT DEFAULT 'USD' NOT NULL,
    timezone TEXT DEFAULT 'America/New_York' NOT NULL,
    date_format TEXT DEFAULT 'MMM d, yyyy' NOT NULL,
    show_converted_amounts BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Enable Row Level Security
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own settings
CREATE POLICY "Users can view own settings" ON user_settings
    FOR SELECT USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert own settings" ON user_settings
    FOR INSERT WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update own settings" ON user_settings
    FOR UPDATE USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can delete own settings" ON user_settings
    FOR DELETE USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Alternative simpler RLS policies (if JWT claims don't work)
-- Uncomment these and comment out the above policies if needed:

-- DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
-- DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
-- DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
-- DROP POLICY IF EXISTS "Users can delete own settings" ON user_settings;

-- CREATE POLICY "Enable all for authenticated users" ON user_settings
--     FOR ALL USING (true) WITH CHECK (true);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at on changes
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
