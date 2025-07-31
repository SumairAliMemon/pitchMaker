// Gemini AI Service for generating pitches
import { UserProfile } from './profileService'

export interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string
      }[]
    }
  }[]
}

export class GeminiService {
  private apiKey: string
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generatePitch(
    userProfile: UserProfile,
    jobDescription: string,
    jobTitle: string,
    companyName: string
  ): Promise<string> {
    const prompt = this.createPitchPrompt(userProfile, jobDescription, jobTitle, companyName)
    
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey
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
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
      }

      const data: GeminiResponse = await response.json()
      
      if (data.candidates && data.candidates.length > 0) {
        return data.candidates[0].content.parts[0].text
      } else {
        throw new Error('No response generated from Gemini')
      }
    } catch (error) {
      console.error('Gemini API Error:', error)
      throw error
    }
  }

  private createPitchPrompt(
    userProfile: UserProfile,
    jobDescription: string,
    jobTitle: string,
    companyName: string
  ): string {
    return `Create a personalized, professional pitch letter for a job application. Here are the details:

**User Profile:**
- Name: ${userProfile.full_name || 'Candidate'}
- Email: ${userProfile.email}
- Background: ${userProfile.background_details || 'Professional background not specified'}
- Skills: ${userProfile.skills || 'Skills not specified'}
- Experience: ${userProfile.experience || 'Experience not specified'}
- Education: ${userProfile.education || 'Education not specified'}

**Job Details:**
- Position: ${jobTitle}
- Company: ${companyName}
- Job Description: ${jobDescription}

**Requirements:**
1. Write a professional cover letter/pitch
2. Highlight relevant skills and experience that match the job requirements
3. Show enthusiasm for the specific role and company
4. Keep it concise but compelling (300-500 words)
5. Use a professional tone
6. Include specific examples where possible
7. End with a strong call to action

Format the response as a complete cover letter that can be copied and used directly.`
  }
}

// Export singleton instance
export const geminiService = new GeminiService(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
)
