-- ============================================================================
-- SIMPLIFIED PITCH MAKER DATABASE SCHEMA
-- Run this script in your Supabase SQL Editor
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- DROP EXISTING TABLES (if needed for clean setup)
-- ============================================================================
DROP TABLE IF EXISTS pitch_history CASCADE;
DROP TABLE IF EXISTS pitches CASCADE;
DROP TABLE IF EXISTS saved_job_descriptions CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- ============================================================================
-- 1. USER PROFILES TABLE
-- ============================================================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  background_details TEXT,
  skills TEXT,
  experience TEXT,
  education TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 2. JOB DESCRIPTIONS TABLE
-- ============================================================================
CREATE TABLE job_descriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  company VARCHAR(255),
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. PITCHES TABLE (includes job description + generated pitch)
-- ============================================================================
CREATE TABLE pitches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_description_id UUID REFERENCES job_descriptions(id) ON DELETE SET NULL,
  job_title VARCHAR(255),
  company_name VARCHAR(255),
  job_description TEXT NOT NULL,
  user_profile_snapshot JSONB,
  generated_pitch TEXT NOT NULL,
  pitch_status VARCHAR(50) DEFAULT 'generated' CHECK (pitch_status IN ('generated', 'favorited', 'used')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_job_descriptions_user_id ON job_descriptions(user_id);
CREATE INDEX idx_job_descriptions_created_at ON job_descriptions(created_at DESC);
CREATE INDEX idx_pitches_user_id ON pitches(user_id);
CREATE INDEX idx_pitches_created_at ON pitches(created_at DESC);
CREATE INDEX idx_pitches_status ON pitches(pitch_status);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitches ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Job Descriptions Policies
CREATE POLICY "Users can view own job descriptions" ON job_descriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own job descriptions" ON job_descriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own job descriptions" ON job_descriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own job descriptions" ON job_descriptions
  FOR DELETE USING (auth.uid() = user_id);

-- Pitches Policies
CREATE POLICY "Users can view own pitches" ON pitches
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pitches" ON pitches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pitches" ON pitches
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pitches" ON pitches
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_descriptions_updated_at 
  BEFORE UPDATE ON job_descriptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pitches_updated_at 
  BEFORE UPDATE ON pitches 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically store user profile snapshot when creating a pitch
CREATE OR REPLACE FUNCTION store_user_profile_snapshot()
RETURNS TRIGGER AS $$
BEGIN
  -- Get current user profile and store as JSON
  SELECT to_jsonb(up) INTO NEW.user_profile_snapshot
  FROM user_profiles up
  WHERE up.id = NEW.user_id;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to store profile snapshot
CREATE TRIGGER store_profile_snapshot_trigger
  BEFORE INSERT ON pitches
  FOR EACH ROW EXECUTE FUNCTION store_user_profile_snapshot();

-- ============================================================================
-- VIEWS FOR EASIER QUERYING
-- ============================================================================

-- View for pitch history with user details
CREATE OR REPLACE VIEW pitch_history AS
SELECT 
  p.id,
  p.user_id,
  p.job_title,
  p.company_name,
  p.job_description,
  p.generated_pitch,
  p.pitch_status,
  p.user_profile_snapshot,
  p.created_at,
  up.full_name,
  up.email
FROM pitches p
LEFT JOIN user_profiles up ON p.user_id = up.id
ORDER BY p.created_at DESC;

-- ============================================================================
-- SAMPLE DATA (OPTIONAL - FOR TESTING)
-- ============================================================================

-- You can insert sample data after setting up authentication
-- Example:
-- INSERT INTO user_profiles (id, email, full_name, background_details) 
-- VALUES ('your-user-id', 'test@example.com', 'Test User', 'Sample background');

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Run these to verify the setup
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- SELECT * FROM user_profiles LIMIT 1;
-- SELECT * FROM job_descriptions LIMIT 1;
-- SELECT * FROM pitches LIMIT 1;
