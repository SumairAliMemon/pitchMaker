import { UserProfile } from '@/lib/profileService'
import { createSupabaseServer } from '@/lib/supabaseServer'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/generate-pitch - Generate a pitch using AI
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { 
      job_description, 
      job_title, 
      company_name, 
      job_description_id,
      use_saved_profile = true
    } = body

    // Validate required fields
    if (!job_description) {
      return NextResponse.json(
        { error: 'job_description is required' }, 
        { status: 400 }
      )
    }

    // Get user profile for personalization
    let userProfile = null
    if (use_saved_profile) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      userProfile = profile
    }

    // Generate pitch using Gemini AI
    const generatedPitch = await generatePitchWithAI({
      jobDescription: job_description,
      jobTitle: job_title,
      companyName: company_name,
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
        job_description_id: job_description_id || null,
        job_title: job_title || null,
        company_name: company_name || null,
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
  const jobTitleText = jobTitle || 'Position'
  const companyText = companyName || 'Company'
  
  try {
    // Create simple prompt
    const prompt = `Write a professional cover letter for this job application:

Job Title: ${jobTitleText}
Company: ${companyText}
Job Description: ${jobDescription}

Candidate Information:
Name: ${userName}
Background: ${userProfile?.background_details || 'Not specified'}
Skills: ${userProfile?.skills || 'Not specified'}
Experience: ${userProfile?.experience || 'Not specified'}
Education: ${userProfile?.education || 'Not specified'}

Write ONLY the cover letter text. No markdown formatting. No ** or * symbols. Just plain text.`

    // Direct API call to Gemini
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
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
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024
        }
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
