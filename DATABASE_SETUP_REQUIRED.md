# Database Setup Instructions

## Important: You need to set up the database before the app will work properly!

### Steps to set up your database:

1. **Open Supabase Dashboard**
   - Go to [supabase.com](https://supabase.com)
   - Sign in to your account
   - Select your project

2. **Run the Database Schema**
   - Go to the SQL Editor in your Supabase dashboard
   - Copy the entire content from `database/simplified_schema.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute the script

3. **Verify Setup**
   - The script will create these tables:
     - `user_profiles` - User profile information
     - `job_descriptions` - Saved job descriptions  
     - `pitches` - Generated pitches with history
   - It also sets up Row Level Security (RLS) policies
   - Creates triggers for automatic timestamps
   - Sets up indexes for better performance

### What the error means:
The error you're seeing (`JSON object requested, multiple (or no) rows returned`) happens because:
- The `user_profiles` table doesn't exist yet, OR
- Your user doesn't have a profile record yet

### After running the schema:
- The app will automatically create user profiles when needed
- You'll be able to save your profile information
- Pitch generation will work properly

### Need help?
- Make sure you're using the correct Supabase project
- Check that your environment variables are set correctly:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
