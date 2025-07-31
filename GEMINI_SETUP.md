# AI-Powered Pitch Generator Setup

## Google Gemini AI Integration

### 1. Get Your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the generated API key

### 2. Add API Key to Environment

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your keys:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Google Gemini AI Configuration
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   ```

### 3. How the AI Integration Works

1. **User Input**: User provides job description and has complete profile
2. **AI Processing**: System sends structured prompt to Gemini AI with:
   - User profile data (skills, experience, education)
   - Job description and requirements
   - Company name and job title (extracted)

3. **AI Response**: Gemini generates personalized pitch letter
4. **Database Storage**: Both job description and generated pitch are saved:
   - `job_descriptions` table: Stores the job posting details
   - `pitches` table: Stores generated pitch with reference to job description

5. **User Experience**: 
   - Generated pitch overlays the job description
   - User can copy clean text (markdown removed)
   - Full view modal for detailed review
   - All pitches saved to history

### 4. Database Schema

**Job Descriptions Table:**
- `id` (UUID): Primary key
- `user_id` (UUID): Foreign key to auth.users
- `title` (VARCHAR): Job title
- `company` (VARCHAR): Company name
- `description` (TEXT): Full job description

**Pitches Table:**
- `id` (UUID): Primary key
- `user_id` (UUID): Foreign key to auth.users
- `job_description_id` (UUID): Reference to job_descriptions
- `job_title` (VARCHAR): Extracted job title
- `company_name` (VARCHAR): Extracted company name
- `job_description` (TEXT): Copy of job description
- `user_profile_snapshot` (JSONB): Profile data used for generation
- `generated_pitch` (TEXT): AI-generated pitch content
- `pitch_status` (VARCHAR): Status (generated, favorited, used)

### 5. Fallback Mechanism

If Gemini API is unavailable or fails:
- System falls back to template-based generation
- Uses user profile data to create structured pitch
- Ensures the application always works

### 6. Features

✅ **AI-Powered Generation**: Uses Google Gemini 2.0 Flash model  
✅ **Smart Extraction**: Automatically extracts company name and job title  
✅ **Profile Integration**: Uses real user data for personalization  
✅ **Database Storage**: Saves both job descriptions and pitches  
✅ **Copy Functionality**: Clean text copying (removes markdown)  
✅ **Full View Modal**: Overlay for detailed pitch review  
✅ **History Tracking**: All generated pitches saved and searchable  
✅ **Fallback System**: Template generation if AI fails  

### 7. Usage Flow

1. User completes profile with background, skills, experience
2. User pastes job description
3. System extracts company/title information
4. Sends structured prompt to Gemini AI
5. AI generates personalized pitch
6. Pitch displayed with copy and full view options
7. Both job description and pitch saved to database
8. User can view history of all generated pitches

This creates a complete AI-powered pitch generation system with proper data persistence and user experience!
