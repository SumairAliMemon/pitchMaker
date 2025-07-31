-- EMERGENCY RLS FIX FOR PROFILE ACCESS
-- Run this in your Supabase SQL Editor to temporarily allow profile operations

-- 1. First, let's see what policies exist
-- SELECT * FROM pg_policies WHERE tablename = 'user_profiles';

-- 2. Drop all existing RLS policies on user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;  
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- 3. Temporarily disable RLS to test functionality
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 4. Test that basic operations work
-- SELECT auth.uid(); -- Should return your user ID
-- SELECT * FROM user_profiles; -- Should show profiles

-- 5. Re-enable RLS and create simple policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 6. Create very permissive policies for testing
CREATE POLICY "Allow all for authenticated users" ON user_profiles
  FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- 7. Verify the policy exists
-- SELECT * FROM pg_policies WHERE tablename = 'user_profiles';

-- NOTE: After confirming this works, replace with proper restrictive policies:
-- CREATE POLICY "Users can manage own profile" ON user_profiles
--   FOR ALL 
--   TO authenticated 
--   USING (auth.uid() = id) 
--   WITH CHECK (auth.uid() = id);
