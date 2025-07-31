import { NextRequest, NextResponse } from 'next/server'

// POST /api/generate-pitch-no-auth - Test pitch generation without authentication
// THIS IS FOR TESTING ONLY - REMOVE IN PRODUCTION
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { 
      job_description, 
      job_title, 
      company_name, 
      user_profile
    } = body

    // Validate required fields
    if (!job_description) {
      return NextResponse.json(
        { error: 'job_description is required' }, 
        { status: 400 }
      )
    }

    // Generate pitch using Gemini AI without auth
    const generatedPitch = await generatePitchWithAI({
      jobDescription: job_description,
      jobTitle: job_title,
      companyName: company_name,
      userProfile: user_profile
    })

    if (!generatedPitch) {
      return NextResponse.json({ 
        error: 'AI pitch generation failed. Please check your API key and try again.' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      generated_pitch: generatedPitch,
      note: "THIS IS A TEST ENDPOINT - NO DATABASE SAVE, NO AUTH CHECK"
    }, { status: 200 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to generate pitch with Gemini AI (same as main endpoint)
async function generatePitchWithAI({
  jobDescription,
  jobTitle,
  companyName,
  userProfile
}: {
  jobDescription: string
  jobTitle?: string
  companyName?: string  
  userProfile?: {
    full_name?: string
    background_details?: string
    skills?: string
    experience?: string
    education?: string
  } | null
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
