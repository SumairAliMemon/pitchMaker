-- Complete Database Setup for Pitch Maker App
-- Run this script in your Supabase SQL Editor

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  background_details TEXT,
  skills TEXT,
  experience TEXT,
  education TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create pitch_history table
CREATE TABLE IF NOT EXISTS pitch_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_description TEXT NOT NULL,
  user_details TEXT NOT NULL,
  generated_pitch TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create saved_job_descriptions table
CREATE TABLE IF NOT EXISTS saved_job_descriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_pitch_history_user_id ON pitch_history(user_id);
CREATE INDEX IF NOT EXISTS idx_pitch_history_created_at ON pitch_history(created_at);
CREATE INDEX IF NOT EXISTS idx_saved_job_descriptions_user_id ON saved_job_descriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_job_descriptions_created_at ON saved_job_descriptions(created_at);

-- Enable Row Level Security on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_job_descriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON user_profiles;

DROP POLICY IF EXISTS "Users can view their own pitch history" ON pitch_history;
DROP POLICY IF EXISTS "Users can insert their own pitch history" ON pitch_history;
DROP POLICY IF EXISTS "Users can update their own pitch history" ON pitch_history;
DROP POLICY IF EXISTS "Users can delete their own pitch history" ON pitch_history;

DROP POLICY IF EXISTS "Users can view their own saved job descriptions" ON saved_job_descriptions;
DROP POLICY IF EXISTS "Users can insert their own saved job descriptions" ON saved_job_descriptions;
DROP POLICY IF EXISTS "Users can update their own saved job descriptions" ON saved_job_descriptions;
DROP POLICY IF EXISTS "Users can delete their own saved job descriptions" ON saved_job_descriptions;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view their own profile" 
ON user_profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON user_profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON user_profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" 
ON user_profiles FOR DELETE 
USING (auth.uid() = id);

-- Create RLS policies for pitch_history
CREATE POLICY "Users can view their own pitch history" 
ON pitch_history FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pitch history" 
ON pitch_history FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pitch history" 
ON pitch_history FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pitch history" 
ON pitch_history FOR DELETE 
USING (auth.uid() = user_id);

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

-- Create updated_at triggers
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_pitch_history_updated_at ON pitch_history;
DROP TRIGGER IF EXISTS update_saved_job_descriptions_updated_at ON saved_job_descriptions;

CREATE TRIGGER update_user_profiles_updated_at 
BEFORE UPDATE ON user_profiles 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pitch_history_updated_at 
BEFORE UPDATE ON pitch_history 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_job_descriptions_updated_at 
BEFORE UPDATE ON saved_job_descriptions 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
