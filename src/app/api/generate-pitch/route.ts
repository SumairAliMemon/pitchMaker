import { UserProfile } from '@/lib/profileService'
import { createSupabaseServer } from '@/lib/supabaseServer'
import { NextRequest, NextResponse } from 'next/server'

// Helper function to extract company name and job title from job description
function extractCompanyAndTitle(jobDesc: string) {
  const lines = jobDesc.split('\n').filter(line => line.trim())
  
  let companyName = null
  let jobTitle = null
  
  for (const line of lines) {
    // Look for company patterns
    if (line.toLowerCase().includes('company:') || line.toLowerCase().includes('organization:')) {
      companyName = line.split(':')[1]?.trim() || null
      continue
    }
    
    // Look for @company or Company Name patterns
    const companyMatch = line.match(/(?:at|@)\s+([A-Z][a-zA-Z\s&.,-]+(?:Inc|LLC|Corp|Ltd|Co)?)/i)
    if (companyMatch && !companyName) {
      companyName = companyMatch[1].trim()
      continue
    }
  }
  
  // Look for job title (usually in first few lines)
  for (const line of lines.slice(0, 5)) {
    if (line.toLowerCase().includes('position:') || line.toLowerCase().includes('role:') || line.toLowerCase().includes('title:')) {
      jobTitle = line.split(':')[1]?.trim() || null
      break
    }
    // If line looks like a job title (contains common job words)
    if (line.match(/(?:engineer|developer|manager|analyst|designer|specialist|coordinator|director|lead|senior|junior)/i) && line.length < 100) {
      jobTitle = line.trim()
      break
    }
  }
  
  return { companyName, jobTitle }
}

// POST /api/generate-pitch - Generate a pitch using AI
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body - only job description needed
    const body = await request.json()
    const { job_description } = body

    // Validate required fields - only job_description is mandatory
    if (!job_description || job_description.trim() === '') {
      return NextResponse.json(
        { error: 'job_description is required' }, 
        { status: 400 }
      )
    }

    // Extract company name and job title from job description
    const { companyName, jobTitle } = extractCompanyAndTitle(job_description)

    // Save job description to database first
    const { data: savedJobDescription, error: jobError } = await supabase
      .from('job_descriptions')
      .insert({
        user_id: user.id,
        title: jobTitle || null,
        company_name: companyName || null,
        description: job_description.trim(),
        is_saved: true
      })
      .select()
      .single()

    if (jobError) {
      console.error('Error saving job description:', jobError)
      return NextResponse.json({ error: 'Failed to save job description' }, { status: 500 })
    }

    // Get user profile from database
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      console.error('Error fetching user profile:', profileError)
      return NextResponse.json({ error: 'User profile not found. Please complete your profile first.' }, { status: 400 })
    }

    // Generate pitch using Gemini AI  
    const generatedPitch = await generatePitchWithAI({
      jobDescription: job_description,
      jobTitle: jobTitle || undefined,
      companyName: companyName || undefined, 
      userProfile: userProfile
    })

    if (!generatedPitch) {
      return NextResponse.json({ 
        error: 'AI pitch generation failed. Please check your API key and try again.' 
      }, { status: 500 })
    }

    // Save the generated pitch to database
    const { data: pitch, error: pitchError } = await supabase
      .from('pitches')
      .insert({
        user_id: user.id,
        job_description_id: savedJobDescription?.id || null,
        job_title: jobTitle?.trim() || null,
        company_name: companyName?.trim() || null,
        raw_job_description: job_description,
        generated_pitch: generatedPitch,
        pitch_status: 'generated'
      })
      .select()
      .single()

    if (pitchError) {
      console.error('Error saving pitch:', pitchError)
      return NextResponse.json({ error: 'Failed to save pitch' }, { status: 500 })
    }

    return NextResponse.json({ 
      pitch: pitch,
      generated_pitch: generatedPitch
    }, { status: 201 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to generate pitch with Gemini AI
async function generatePitchWithAI({
  jobDescription,
  jobTitle,
  companyName,
  userProfile
}: {
  jobDescription: string
  jobTitle?: string
  companyName?: string  
  userProfile: UserProfile | null
}): Promise<string | null> {
  const userName = userProfile?.full_name || 'Your Name'
  
  try {
    // Create flexible prompt that works with or without company/title info
    let prompt = `Write a professional cover letter for this job application:

Job Description: ${jobDescription}

Candidate Information:
Name: ${userName}
Background: ${userProfile?.background_details || 'Not specified'}
Skills: ${userProfile?.skills || 'Not specified'}
Experience: ${userProfile?.experience || 'Not specified'}
Education: ${userProfile?.education || 'Not specified'}`

    // Add company and title info if available
    if (companyName) {
      prompt = `Write a professional cover letter for this job application:

Company: ${companyName}
${jobTitle ? `Job Title: ${jobTitle}` : ''}
Job Description: ${jobDescription}

Candidate Information:
Name: ${userName}
Background: ${userProfile?.background_details || 'Not specified'}
Skills: ${userProfile?.skills || 'Not specified'}
Experience: ${userProfile?.experience || 'Not specified'}
Education: ${userProfile?.education || 'Not specified'}`
    }

    prompt += `

Write ONLY the cover letter text. No markdown formatting. No ** or * symbols. Just plain text.`

    // Direct API call to Gemini using the official 2.0 flash model
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API Error Response:', errorText)
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('Gemini API Response:', JSON.stringify(data, null, 2))
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      let generatedText = data.candidates[0].content.parts[0].text
      
      // Remove all markdown formatting
      generatedText = generatedText
        .replace(/\*\*/g, '')  // Remove **
        .replace(/\*/g, '')    // Remove *
        .replace(/##/g, '')    // Remove ##
        .replace(/#/g, '')     // Remove #
        .trim()
      
      return generatedText
    }

    throw new Error('No content generated from Gemini API')

  } catch (error) {
    console.error('Error generating pitch with Gemini:', error)
    // Return null to indicate failure instead of fallback
    return null
  }
}
