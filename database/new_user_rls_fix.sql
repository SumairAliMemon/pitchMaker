-- EMERGENCY FIX FOR NEW USER PROFILE CREATION
-- Run this in your Supabase SQL Editor to fix RLS policy violations

-- 1. Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 2. Drop all existing problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;  
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON user_profiles;

-- 3. Temporarily disable RLS to test if table works
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 4. Test basic operations (run these one by one to debug)
-- SELECT auth.uid(); -- This should return your user ID when authenticated
-- SELECT * FROM auth.users LIMIT 1; -- Check if auth works  
-- INSERT INTO user_profiles (id, email) VALUES (auth.uid(), auth.email()) RETURNING *; -- Test insert

-- 5. Re-enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 6. Create simple, working policies for authenticated users
-- Policy for INSERT (new users creating profiles)
CREATE POLICY "authenticated_users_can_insert_own_profile" ON user_profiles
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = id);

-- Policy for SELECT (users viewing their own profiles)  
CREATE POLICY "authenticated_users_can_view_own_profile" ON user_profiles
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

-- Policy for UPDATE (users updating their own profiles)
CREATE POLICY "authenticated_users_can_update_own_profile" ON user_profiles
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id) 
  WITH CHECK (auth.uid() = id);

-- Policy for DELETE (users deleting their own profiles - optional)
CREATE POLICY "authenticated_users_can_delete_own_profile" ON user_profiles
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = id);

-- 7. Verify new policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 8. Test with a real insert (replace with your actual user data)
-- INSERT INTO user_profiles (id, email, full_name) 
-- VALUES (auth.uid(), auth.email(), 'Test User') 
-- ON CONFLICT (id) DO UPDATE SET 
--   email = EXCLUDED.email,
--   full_name = EXCLUDED.full_name,
--   updated_at = NOW()
-- RETURNING *;

-- 9. If policies still don't work, use this emergency override (TEMPORARY ONLY)
-- DROP POLICY IF EXISTS "authenticated_users_can_insert_own_profile" ON user_profiles;
-- DROP POLICY IF EXISTS "authenticated_users_can_view_own_profile" ON user_profiles;
-- DROP POLICY IF EXISTS "authenticated_users_can_update_own_profile" ON user_profiles;
-- DROP POLICY IF EXISTS "authenticated_users_can_delete_own_profile" ON user_profiles;
-- 
-- CREATE POLICY "emergency_full_access" ON user_profiles
--   FOR ALL 
--   TO authenticated 
--   USING (true) 
--   WITH CHECK (true);

-- After confirming everything works, you can replace the emergency policy with proper restrictive ones
