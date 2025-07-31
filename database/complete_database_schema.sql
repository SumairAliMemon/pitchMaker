-- Complete Database Schema for Pitch Maker Application
-- This file contains all the necessary tables and functions

-- ============================================================================
-- 1. USER PROFILES TABLE
-- ============================================================================

-- User profiles table to store user background and skills
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  background_details TEXT,
  skills TEXT,
  experience TEXT,
  education TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================================================
-- 2. JOB DESCRIPTIONS TABLE (for saving job descriptions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS saved_job_descriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_saved_job_descriptions_user_id ON saved_job_descriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_job_descriptions_created_at ON saved_job_descriptions(created_at);

-- Enable Row Level Security
ALTER TABLE saved_job_descriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for saved_job_descriptions
CREATE POLICY "Users can view their own saved job descriptions" 
ON saved_job_descriptions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved job descriptions" 
ON saved_job_descriptions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved job descriptions" 
ON saved_job_descriptions FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved job descriptions" 
ON saved_job_descriptions FOR DELETE 
USING (auth.uid() = user_id);

-- ============================================================================
-- 3. PITCHES TABLE (for individual pitch generation)
-- ============================================================================

CREATE TABLE IF NOT EXISTS pitches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_description_id UUID REFERENCES saved_job_descriptions(id) ON DELETE SET NULL,
  job_title VARCHAR(255),
  company_name VARCHAR(255),
  raw_job_description TEXT NOT NULL,
  generated_pitch TEXT NOT NULL,
  pitch_status VARCHAR(50) DEFAULT 'generated' CHECK (pitch_status IN ('generated', 'favorited', 'used')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pitches_user_id ON pitches(user_id);
CREATE INDEX IF NOT EXISTS idx_pitches_created_at ON pitches(created_at);
CREATE INDEX IF NOT EXISTS idx_pitches_job_description_id ON pitches(job_description_id);

-- Enable Row Level Security
ALTER TABLE pitches ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for pitches
CREATE POLICY "Users can view their own pitches" 
ON pitches FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pitches" 
ON pitches FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pitches" 
ON pitches FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pitches" 
ON pitches FOR DELETE 
USING (auth.uid() = user_id);

-- ============================================================================
-- 4. PITCH HISTORY TABLE (for tracking pitch generation history)
-- ============================================================================

CREATE TABLE IF NOT EXISTS pitch_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pitch_id UUID REFERENCES pitches(id) ON DELETE CASCADE,
  job_title VARCHAR(255),
  company_name VARCHAR(255),
  job_description TEXT NOT NULL,
  user_details_snapshot TEXT NOT NULL, -- Snapshot of user details at time of generation
  generated_pitch TEXT NOT NULL,
  generation_method VARCHAR(50) DEFAULT 'ai' CHECK (generation_method IN ('ai', 'template', 'manual')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pitch_history_user_id ON pitch_history(user_id);
CREATE INDEX IF NOT EXISTS idx_pitch_history_created_at ON pitch_history(created_at);
CREATE INDEX IF NOT EXISTS idx_pitch_history_pitch_id ON pitch_history(pitch_id);

-- Enable Row Level Security
ALTER TABLE pitch_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for pitch_history
CREATE POLICY "Users can view their own pitch history" 
ON pitch_history FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pitch history" 
ON pitch_history FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pitch history" 
ON pitch_history FOR DELETE 
USING (auth.uid() = user_id);

-- ============================================================================
-- 5. FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to handle user profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at fields
CREATE TRIGGER on_user_profiles_updated
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_saved_job_descriptions_updated
  BEFORE UPDATE ON saved_job_descriptions
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_pitches_updated
  BEFORE UPDATE ON pitches
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Function to create pitch history entry when a pitch is created
CREATE OR REPLACE FUNCTION public.create_pitch_history_entry()
RETURNS TRIGGER AS $$
DECLARE
  user_details_text TEXT;
BEGIN
  -- Get user details for the snapshot
  SELECT CONCAT_WS(' | ', 
    COALESCE('Name: ' || full_name, ''),
    COALESCE('Background: ' || background_details, ''),
    COALESCE('Skills: ' || skills, ''),
    COALESCE('Experience: ' || experience, ''),
    COALESCE('Education: ' || education, '')
  ) INTO user_details_text
  FROM user_profiles 
  WHERE id = NEW.user_id;

  -- Insert into pitch history
  INSERT INTO public.pitch_history (
    user_id,
    pitch_id,
    job_title,
    company_name,
    job_description,
    user_details_snapshot,
    generated_pitch,
    generation_method
  ) VALUES (
    NEW.user_id,
    NEW.id,
    NEW.job_title,
    NEW.company_name,
    NEW.raw_job_description,
    COALESCE(user_details_text, 'No user details available'),
    NEW.generated_pitch,
    'ai'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create pitch history entry
CREATE TRIGGER on_pitch_created
  AFTER INSERT ON pitches
  FOR EACH ROW EXECUTE PROCEDURE public.create_pitch_history_entry();

-- ============================================================================
-- 6. VIEWS FOR CONVENIENT DATA ACCESS
-- ============================================================================

-- View to get pitches with associated job description details
CREATE OR REPLACE VIEW pitch_details AS
SELECT 
  p.*,
  sjd.title as saved_job_title,
  sjd.company as saved_job_company,
  up.full_name,
  up.email
FROM pitches p
LEFT JOIN saved_job_descriptions sjd ON p.job_description_id = sjd.id
LEFT JOIN user_profiles up ON p.user_id = up.id;

-- View to get comprehensive pitch history
CREATE OR REPLACE VIEW pitch_history_details AS
SELECT 
  ph.*,
  up.full_name,
  up.email,
  p.pitch_status
FROM pitch_history ph
LEFT JOIN user_profiles up ON ph.user_id = up.id
LEFT JOIN pitches p ON ph.pitch_id = p.id;

-- ============================================================================
-- 7. GRANT NECESSARY PERMISSIONS
-- ============================================================================

-- Grant usage on sequences (for UUID generation)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Grant permissions on tables
GRANT SELECT, INSERT, UPDATE, DELETE ON user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON saved_job_descriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON pitches TO authenticated;
GRANT SELECT, INSERT, DELETE ON pitch_history TO authenticated;

-- Grant permissions on views
GRANT SELECT ON pitch_details TO authenticated;
GRANT SELECT ON pitch_history_details TO authenticated;
