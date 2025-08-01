# Job Description APIs Summary

## Available Endpoints

### 1. `/api/job-descriptions` (Main endpoint - requires auth)

**GET** - Retrieve all job descriptions for authenticated user
- Returns: `{ job_descriptions: [], count: number }`
- Auth: Required (Supabase JWT)

**POST** - Create new job description  
- Body: `{ title?, company_name?, description!, source_url? }`
- Required: `description` only
- Optional: `title`, `company_name`, `source_url`
- Returns: `{ job_description: {...} }`
- Auth: Required (Supabase JWT)

**DELETE** - Delete job description by ID
- Query param: `?id=job_description_id`
- Returns: `{ message: "...", deleted_job_description: {...} }`
- Auth: Required (Supabase JWT)
- Security: Users can only delete their own job descriptions

## Service Layer Methods

### `jobDescriptionService` (in `/src/lib/jobDescriptionService.ts`)

- `createJobDescription(userId, jobData)` - Main creation method
- `saveJobDescription(userId, title, description, company?)` - Legacy wrapper  
- `getUserJobDescriptions(userId)` - Get user's saved job descriptions
- `getJobDescriptionById(jobId)` - Get single job description
- `updateJobDescription(jobId, updateData)` - Update job description
- `deleteJobDescription(jobId)` - Delete job description  
- `toggleSaveStatus(jobId, isSaved)` - Toggle save status

## Database Schema

```sql
job_descriptions (
  id: uuid PRIMARY KEY,
  user_id: uuid REFERENCES auth.users(id),
  title: text NULL,
  company_name: text NULL, 
  description: text NOT NULL,
  source_url: text NULL,
  is_saved: boolean DEFAULT true,
  created_at: timestamp DEFAULT now(),
  updated_at: timestamp DEFAULT now()
)
```

## Integration Points

1. **Pitch Dashboard** → Uses `jobDescriptionService.createJobDescription()`
2. **Generate Pitch API** → Saves job descriptions when generating pitches
3. **Frontend Components** → Can use `/api/job-descriptions` for CRUD operations

## Test Files

- `test-all-job-apis.http` - Comprehensive test suite for all operations
- `test-job-descriptions-api.http` - Basic API tests

## Notes

- Only `description` field is mandatory
- `title` and `company_name` are optional and can be null
- Users can only access/modify their own job descriptions
- All operations require authentication except testing endpoints
