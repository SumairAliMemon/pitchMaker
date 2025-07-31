-- Create pitch_history table
CREATE TABLE IF NOT EXISTS pitch_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_description TEXT NOT NULL,
  user_details TEXT NOT NULL,
  generated_pitch TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_pitch_history_user_id ON pitch_history(user_id);
CREATE INDEX IF NOT EXISTS idx_pitch_history_created_at ON pitch_history(created_at);

-- Enable Row Level Security
ALTER TABLE pitch_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pitch_history_updated_at 
BEFORE UPDATE ON pitch_history 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
