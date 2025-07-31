-- ============================================================================
-- PITCH MAKER APPLICATION DATABASE SCHEMA
-- This schema includes: User Profiles, Job Descriptions, Pitches, and History
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

-- Job descriptions table for saving job descriptions
CREATE TABLE IF NOT EXISTS saved_job_descriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pitches table for individual pitch generation
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

-- Pitch history table for tracking pitch generation history
CREATE TABLE IF NOT EXISTS pitch_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pitch_id UUID REFERENCES pitches(id) ON DELETE CASCADE,
  job_title VARCHAR(255),
  company_name VARCHAR(255),
  job_description TEXT NOT NULL,
  user_details_snapshot TEXT NOT NULL,
  generated_pitch TEXT NOT NULL,
  generation_method VARCHAR(50) DEFAULT 'ai' CHECK (generation_method IN ('ai', 'template', 'manual')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_saved_job_descriptions_user_id ON saved_job_descriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_pitches_user_id ON pitches(user_id);
CREATE INDEX IF NOT EXISTS idx_pitch_history_user_id ON pitch_history(user_id);

-- Enable RLS on all tables
ALTER TABLE saved_job_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitches ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitch_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for saved_job_descriptions
CREATE POLICY "Users can manage their own job descriptions" ON saved_job_descriptions
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for pitches
CREATE POLICY "Users can manage their own pitches" ON pitches
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for pitch_history
CREATE POLICY "Users can view their own pitch history" ON pitch_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pitch history" ON pitch_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions and Triggers
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

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE TRIGGER on_user_profiles_updated
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_saved_job_descriptions_updated
  BEFORE UPDATE ON saved_job_descriptions
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_pitches_updated
  BEFORE UPDATE ON pitches
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
