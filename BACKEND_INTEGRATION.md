# Backend Integration Guide

This document explains how to integrate and use the new database structure and backend services.

## Overview

The application now has a clean, organized database structure with:

- **User Profiles**: Store user background and details
- **Job Descriptions**: Save and reuse job postings
- **Pitches**: Generated pitches with status tracking
- **Pitch History**: Complete history of all generations

## Setup Steps

### 1. Database Setup

Run the complete setup script in your Supabase SQL Editor:

```sql
-- Copy and paste content from database/supabase_setup.sql
```

### 2. Backend Services

The application includes these new service files:

- `src/lib/pitchService.ts` - Main pitch operations
- `src/lib/pitchHistoryService.ts` - History tracking
- `src/lib/jobDescriptionService.ts` - Job description management
- `src/lib/profileService.ts` - User profile management

### 3. API Routes

New API endpoints are available:

- `POST /api/generate-pitch` - Generate pitch with AI
- `GET /api/pitches` - Get user's pitches
- `POST /api/pitches` - Create new pitch
- `PUT /api/pitches/[id]` - Update pitch status
- `DELETE /api/pitches/[id]` - Delete pitch
- `GET /api/pitch-history` - Get pitch history

## Usage Examples

### Generate a Pitch

```typescript
// Frontend usage
const generatePitch = async (jobData: {
  job_description: string
  job_title?: string
  company_name?: string
}) => {
  const response = await fetch('/api/generate-pitch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jobData)
  })
  
  const result = await response.json()
  return result.pitch
}
```

### Use Services Directly

```typescript
import { pitchService } from '@/lib/pitchService'
import { pitchHistoryService } from '@/lib/pitchHistoryService'

// Create a pitch
const pitch = await pitchService.createPitch(
  userId,
  {
    job_title: "Software Engineer",
    company_name: "Tech Corp", 
    job_description: "Job posting content..."
  },
  "Generated pitch content..."
)

// Get pitch history
const history = await pitchHistoryService.getUserPitchHistory(userId)

// Update pitch status
await pitchService.updatePitchStatus(pitch.id, 'favorited')
```

### Component Integration

```typescript
// Example React component
import { useEffect, useState } from 'react'
import { pitchService } from '@/lib/pitchService'

export function PitchList({ userId }: { userId: string }) {
  const [pitches, setPitches] = useState([])
  
  useEffect(() => {
    const loadPitches = async () => {
      const userPitches = await pitchService.getUserPitches(userId)
      setPitches(userPitches)
    }
    
    loadPitches()
  }, [userId])
  
  const handleStatusUpdate = async (pitchId: string, status: string) => {
    await pitchService.updatePitchStatus(pitchId, status)
    // Refresh list
    const updated = await pitchService.getUserPitches(userId)
    setPitches(updated)
  }
  
  return (
    <div>
      {pitches.map(pitch => (
        <div key={pitch.id}>
          <h3>{pitch.job_title}</h3>
          <p>{pitch.company_name}</p>
          <div>{pitch.generated_pitch}</div>
          <button onClick={() => handleStatusUpdate(pitch.id, 'favorited')}>
            Favorite
          </button>
        </div>
      ))}
    </div>
  )
}
```

## Database Schema

### Tables

```sql
-- User profiles
user_profiles (
  id UUID PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  background_details TEXT,
  skills TEXT,
  experience TEXT,
  education TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Saved job descriptions
saved_job_descriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title VARCHAR(255),
  company VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Generated pitches
pitches (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  job_description_id UUID REFERENCES saved_job_descriptions(id),
  job_title VARCHAR(255),
  company_name VARCHAR(255),
  raw_job_description TEXT,
  generated_pitch TEXT,
  pitch_status VARCHAR(50) DEFAULT 'generated',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Pitch generation history
pitch_history (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  pitch_id UUID REFERENCES pitches(id),
  job_title VARCHAR(255),
  company_name VARCHAR(255),
  job_description TEXT,
  user_details_snapshot TEXT,
  generated_pitch TEXT,
  generation_method VARCHAR(50) DEFAULT 'ai',
  created_at TIMESTAMP
)
```

## Key Features

### Automatic History Tracking

When a pitch is created, it's automatically added to `pitch_history` with a snapshot of user details at that time.

### Status Management

Pitches can have different statuses:
- `generated` - Just created
- `favorited` - Marked as favorite
- `used` - Applied to job

### Row Level Security

All tables have RLS policies ensuring users can only access their own data.

### Flexible Job Linking

Pitches can optionally link to saved job descriptions for better organization.

## AI Integration

The `generate-pitch` endpoint is set up for AI integration. Replace the placeholder in `/api/generate-pitch/route.ts` with your preferred AI service:

```typescript
// Example OpenAI integration
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 500,
    temperature: 0.7,
  }),
})
```

## Migration from Old Structure

If you have existing data:

1. Export existing data from old tables
2. Run the new schema setup
3. Create migration script to transform and import data
4. Test thoroughly before going live

## Testing

Test your setup with these steps:

1. **Authentication**: Sign up/in to create user profile
2. **Profile Management**: Update profile details
3. **Job Descriptions**: Save and retrieve job postings
4. **Pitch Generation**: Generate pitches via API
5. **History**: View and manage pitch history
6. **Status Updates**: Change pitch status

## Performance Considerations

- Indexes are created on frequently queried columns
- Views provide optimized queries for common patterns
- RLS policies are efficient and don't impact performance significantly
- Consider pagination for large datasets

## Security

- All API routes verify user authentication
- RLS policies prevent data leakage between users
- Sensitive operations use server-side validation
- Database functions use appropriate security settings

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check user authentication
2. **404 Not Found**: Verify table names and structure
3. **Foreign Key Errors**: Ensure referenced records exist
4. **RLS Denies**: Check policies and user permissions

### Debug Queries

```sql
-- Check user permissions
SELECT auth.uid();

-- View policy definitions
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Check table data
SELECT COUNT(*) FROM user_profiles;
SELECT COUNT(*) FROM pitches WHERE user_id = auth.uid();
```

This completes the backend integration setup. Your application now has a robust, scalable database structure with proper security and organization.
