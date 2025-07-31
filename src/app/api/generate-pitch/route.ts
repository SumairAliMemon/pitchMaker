import { UserProfile } from '@/lib/profileService'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/generate-pitch - Generate a pitch using AI
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          }
        }
      }
    )

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

    // Generate pitch using AI (replace this with your actual AI integration)
    const generatedPitch = await generatePitchWithAI({
      jobDescription: job_description,
      jobTitle: job_title,
      companyName: company_name,
      userProfile: userProfile
    })

    if (!generatedPitch) {
      return NextResponse.json({ error: 'Failed to generate pitch' }, { status: 500 })
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

// Helper function to generate pitch with AI
// Replace this with your actual AI integration (OpenAI, Claude, etc.)
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
  try {
    // Create a comprehensive prompt for AI
    let prompt = `Generate a professional and compelling pitch for the following job application:\n\n`
    
    if (jobTitle) prompt += `Job Title: ${jobTitle}\n`
    if (companyName) prompt += `Company: ${companyName}\n`
    prompt += `Job Description:\n${jobDescription}\n\n`
    
    if (userProfile) {
      prompt += `Candidate Profile:\n`
      if (userProfile.full_name) prompt += `Name: ${userProfile.full_name}\n`
      if (userProfile.background_details) prompt += `Background: ${userProfile.background_details}\n`
      if (userProfile.skills) prompt += `Skills: ${userProfile.skills}\n`
      if (userProfile.experience) prompt += `Experience: ${userProfile.experience}\n`
      if (userProfile.education) prompt += `Education: ${userProfile.education}\n`
    }
    
    prompt += `\nPlease generate a personalized cover letter or pitch that:\n`
    prompt += `1. Addresses the specific requirements mentioned in the job description\n`
    prompt += `2. Highlights relevant experience and skills from the candidate profile\n`
    prompt += `3. Shows enthusiasm for the role and company\n`
    prompt += `4. Is professional yet personable\n`
    prompt += `5. Is concise (around 200-300 words)\n\n`
    prompt += `Generate only the pitch content, no additional formatting or explanations.`

    // Log the prompt for debugging (remove in production)
    console.log('AI Prompt:', prompt)

    // TODO: Replace this with actual AI API call
    // Example for OpenAI:
    /*
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
    
    const data = await response.json()
    return data.choices[0]?.message?.content?.trim()
    */

    // Placeholder implementation - replace with your AI service
    const placeholderPitch = `Dear Hiring Manager,

I am writing to express my strong interest in ${jobTitle ? `the ${jobTitle} position` : 'this opportunity'} ${companyName ? `at ${companyName}` : ''}. 

${userProfile?.background_details ? `With my background in ${userProfile.background_details}, ` : ''}I am excited about the opportunity to contribute to your team. ${userProfile?.skills ? `My skills in ${userProfile.skills} ` : ''}align well with the requirements outlined in your job description.

${userProfile?.experience ? `My experience includes ${userProfile.experience}, ` : ''}which has prepared me to tackle the challenges and responsibilities mentioned in this role. I am particularly drawn to this position because it offers the opportunity to apply my expertise while continuing to grow professionally.

I would welcome the opportunity to discuss how my background and enthusiasm can contribute to your team's success. Thank you for considering my application.

Best regards,
${userProfile?.full_name || 'Your Name'}`

    return placeholderPitch
  } catch (error) {
    console.error('Error generating pitch with AI:', error)
    return null
  }
}
