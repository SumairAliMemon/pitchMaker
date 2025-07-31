# Database Setup Guide for Pitch Maker Application

This guide will help you set up the complete database structure for the Pitch Maker application using Supabase.

## Quick Setup

### Step 1: Run the Complete Setup Script

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to SQL Editor (on the left sidebar)
4. Copy and paste the contents of `database/supabase_setup.sql`
5. Click "Run" to execute the SQL script

This script will create all necessary tables, indexes, policies, functions, triggers, and views.

### Step 2: Verify Tables Were Created

After running the migration, verify the tables exist:

```sql
-- Run this in Supabase SQL Editor to check tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'saved_job_descriptions', 'pitches', 'pitch_history');
```

You should see all four tables listed.

### Step 3: Test the Application

1. Start your development server: `npm run dev`
2. Go to your application and try to:
   - Sign in (user profile should be created automatically)
   - Edit and save your profile
   - Generate a pitch using the API endpoints
   - View pitch history

## Database Structure

### Tables Created

1. **`user_profiles`** - User information and background details
2. **`saved_job_descriptions`** - Stored job postings for reuse
3. **`pitches`** - Generated pitches with status tracking
4. **`pitch_history`** - Historical record of all pitch generations

### Views Created

1. **`pitch_details`** - Pitches with job and user information
2. **`pitch_history_details`** - History with user details and status

### API Endpoints Available

- `GET /api/pitches` - Get all user's pitches
- `POST /api/pitches` - Create a new pitch
- `PUT /api/pitches/[id]` - Update pitch status
- `DELETE /api/pitches/[id]` - Delete a pitch
- `POST /api/generate-pitch` - Generate pitch with AI
- `GET /api/pitch-history` - Get pitch history

## Environment Variables

Make sure your `.env.local` file has:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Troubleshooting

If you encounter issues:

1. **Authentication Errors**: Check Supabase URL/keys in `.env.local`
2. **Table Not Found**: Verify tables exist in Supabase Table Editor
3. **Permission Errors**: Check RLS policies are working correctly
4. **API Errors**: Look at browser console and server logs

### Verification Queries

```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Test data access (after signing in)
SELECT COUNT(*) FROM user_profiles;
SELECT COUNT(*) FROM pitches;
SELECT COUNT(*) FROM pitch_history;
```

## Usage Examples

### Generate a Pitch via API

```javascript
const response = await fetch('/api/generate-pitch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    job_description: "We are looking for a software engineer...",
    job_title: "Software Engineer",
    company_name: "Tech Corp"
  })
})
```

### Get Pitch History

```javascript
const response = await fetch('/api/pitch-history?detailed=true')
const { history } = await response.json()
```

For more detailed information, see the complete documentation in this file.
