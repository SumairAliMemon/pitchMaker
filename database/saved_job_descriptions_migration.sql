-- Create saved_job_descriptions table
CREATE TABLE IF NOT EXISTS saved_job_descriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_saved_job_descriptions_user_id ON saved_job_descriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_job_descriptions_created_at ON saved_job_descriptions(created_at);

-- Enable Row Level Security
ALTER TABLE saved_job_descriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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

-- Create updated_at trigger
CREATE TRIGGER update_saved_job_descriptions_updated_at 
BEFORE UPDATE ON saved_job_descriptions 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
